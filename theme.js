(() => {
	const modes = ["auto", "light", "dark"];
	const root = document.documentElement;
	const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

	const resolveTheme = (mode) => mode === "auto" ? (systemTheme.matches ? "dark" : "light") : mode;
	const normaliseMode = (mode) => modes.includes(mode) ? mode : "auto";

	function updateTransferLinks() {
		document.querySelectorAll("a[data-state-transfer]").forEach((link) => {
			const target = new URL(link.href, window.location.href);
			target.search = window.location.search;
			link.href = target.href;
		});
	}

	function updateSiteBackLinks() {
		const hidden = window.location.protocol === "file:" || window.location.pathname === "/";
		document.querySelectorAll("[data-site-back], [data-site-back-separator]").forEach((element) => {
			element.hidden = hidden;
		});
	}

	async function copyText(text) {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
		const field = document.createElement("textarea");
		field.value = text;
		field.style.position = "fixed";
		field.style.opacity = "0";
		document.body.append(field);
		field.select();
		const copied = document.execCommand("copy");
		field.remove();
		return copied;
	}

	function showCopyFeedback(element, message = "Copied") {
		element.querySelector(".ui-copy-feedback")?.remove();
		const feedback = document.createElement("span");
		feedback.className = "ui-copy-feedback";
		feedback.setAttribute("role", "status");
		feedback.setAttribute("aria-live", "polite");
		feedback.textContent = message;
		element.append(feedback);
		window.setTimeout(() => {
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				feedback.remove();
				return;
			}
			feedback.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, easing: "ease-out", fill: "forwards" }).finished.then(() => feedback.remove());
		}, 900);
	}

	async function copyWithFeedback(element, text, message) {
		const copied = await copyText(text);
		if (copied) showCopyFeedback(element, message);
		return copied;
	}

	function setOwnedParameter(name, value, defaultValue) {
		const url = new URL(window.location.href);
		if (value == null || value === defaultValue) url.searchParams.delete(name);
		else url.searchParams.set(name, value);
		window.history.replaceState(null, "", url);
		updateTransferLinks();
	}

	function setOwnedParameters(parameters) {
		const url = new URL(window.location.href);
		parameters.forEach(({ name, value, defaultValue }) => {
			if (value == null || value === defaultValue) url.searchParams.delete(name);
			else url.searchParams.set(name, value);
		});
		if (url.href !== window.location.href) window.history.replaceState(null, "", url);
		updateTransferLinks();
	}

	function applyTheme(mode, { updateUrl = true } = {}) {
		const nextMode = normaliseMode(mode);
		root.dataset.themeMode = nextMode;
		root.dataset.theme = resolveTheme(nextMode);
		document.querySelectorAll(".ui-theme-option[data-theme-mode]").forEach((button) => {
			button.setAttribute("aria-pressed", String(button.dataset.themeMode === nextMode));
		});
		if (updateUrl) setOwnedParameter("theme", nextMode, "auto");
		window.dispatchEvent(new CustomEvent("siteui:themechange", { detail: { mode: nextMode, theme: root.dataset.theme } }));
	}

	function bindControls() {
		document.querySelectorAll(".ui-theme-option[data-theme-mode]").forEach((button) => {
			button.addEventListener("click", () => applyTheme(button.dataset.themeMode));
		});
		applyTheme(root.dataset.themeMode, { updateUrl: false });
		updateTransferLinks();
		updateSiteBackLinks();
		// Do not animate the initial palette selection; enable motion only after
		// the first complete render.
		root.dataset.uiMotionReady = "true";
	}

	const initialMode = normaliseMode(new URLSearchParams(window.location.search).get("theme"));
	applyTheme(initialMode, { updateUrl: false });
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindControls, { once: true });
	else bindControls();
	systemTheme.addEventListener("change", () => {
		if (root.dataset.themeMode === "auto") applyTheme("auto", { updateUrl: false });
	});

	window.SiteUi = {
		copy: { text: copyText, feedback: showCopyFeedback, withFeedback: copyWithFeedback },
		theme: { applyTheme, resolveTheme },
		url: { setOwnedParameter, setOwnedParameters, updateSiteBackLinks, updateTransferLinks },
	};
})();
