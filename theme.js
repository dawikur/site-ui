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

	function setOwnedParameter(name, value, defaultValue) {
		const url = new URL(window.location.href);
		if (value == null || value === defaultValue) url.searchParams.delete(name);
		else url.searchParams.set(name, value);
		window.history.replaceState(null, "", url);
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
	}

	const initialMode = normaliseMode(new URLSearchParams(window.location.search).get("theme"));
	applyTheme(initialMode, { updateUrl: false });
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindControls, { once: true });
	else bindControls();
	systemTheme.addEventListener("change", () => {
		if (root.dataset.themeMode === "auto") applyTheme("auto", { updateUrl: false });
	});

	window.SiteUi = { theme: { applyTheme, resolveTheme }, url: { setOwnedParameter, updateTransferLinks } };
})();
