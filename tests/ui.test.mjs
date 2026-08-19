import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

class Element {
	constructor({ href = "", dataset = {} } = {}) {
		this.href = href;
		this.dataset = { ...dataset };
		this.attributes = {};
		this.classNames = new Set();
		this.classList = {
			toggle: (name, enabled) => enabled ? this.classNames.add(name) : this.classNames.delete(name),
			contains: (name) => this.classNames.has(name),
		};
		this.listeners = {};
		this.hidden = false;
		this.tabIndex = 0;
	}

	setAttribute(name, value) { this.attributes[name] = String(value); }
	getAttribute(name) { return this.attributes[name]; }
	addEventListener(name, listener) { this.listeners[name] = listener; }
}

function runAsset(name, setup) {
	const root = new Element();
	root.scrollHeight = 2400;
	const buttons = ["auto", "light", "dark"].map((mode) => new Element({ dataset: { themeMode: mode } }));
	const links = [new Element({ href: "https://example.test/next/", dataset: { stateTransfer: "" } })];
	const windowListeners = {};
	const mediaListeners = [];
	const location = new URL("https://example.test/page/?theme=dark&future=kept");
	const document = {
		readyState: "complete",
		documentElement: root,
		querySelector(selector) { return selector === ".ui-scroll-top" ? setup.scrollButton : null; },
		querySelectorAll(selector) {
			if (selector === ".ui-theme-option[data-theme-mode]") return buttons;
			if (selector === "a[data-state-transfer]") return links;
			return [];
		},
	};
	const context = {
		document,
		URL,
		URLSearchParams,
		CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
		window: {
			innerHeight: 800,
			scrollY: 0,
			location,
			history: { replaceState(_state, _title, url) { location.href = new URL(url).href; } },
			matchMedia(query) {
				return {
					get matches() { return query.includes("color-scheme") ? setup.prefersDark : setup.reducedMotion; },
					addEventListener(_event, listener) { mediaListeners.push(listener); },
				};
			},
			addEventListener(event, listener) { windowListeners[event] = listener; },
			dispatchEvent() {},
			scrollTo(options) { setup.scrollTo = options; },
		},
	};
	vm.createContext(context);
	vm.runInContext(readFileSync(new URL(`../${name}`, import.meta.url), "utf8"), context);
	return { buttons, context, links, mediaListeners, root, windowListeners };
}

test("theme keeps unknown parameters while synchronising controls and transfer links", () => {
	const setup = { prefersDark: false, reducedMotion: false };
	const { buttons, context, links, root } = runAsset("theme.js", setup);

	assert.equal(root.dataset.themeMode, "dark");
	assert.equal(root.dataset.theme, "dark");
	assert.equal(buttons[2].getAttribute("aria-pressed"), "true");
	assert.equal(links[0].href, "https://example.test/next/?theme=dark&future=kept");

	context.window.SiteUi.theme.applyTheme("auto");
	assert.equal(root.dataset.theme, "light");
	assert.equal(context.window.location.search, "?future=kept");
	assert.equal(links[0].href, "https://example.test/next/?future=kept");
});

test("theme controls update the URL and auto mode follows system changes", () => {
	const setup = { prefersDark: false, reducedMotion: false };
	const { buttons, context, mediaListeners, root } = runAsset("theme.js", setup);

	buttons[1].listeners.click();
	assert.equal(root.dataset.themeMode, "light");
	assert.equal(root.dataset.theme, "light");
	assert.equal(context.window.location.search, "?theme=light&future=kept");

	context.window.SiteUi.theme.applyTheme("auto");
	setup.prefersDark = true;
	mediaListeners[0]();
	assert.equal(root.dataset.themeMode, "auto");
	assert.equal(root.dataset.theme, "dark");
	assert.equal(context.window.location.search, "?future=kept");
});

test("scroll-top appears only for scrollable pages and honours reduced motion", () => {
	const scrollButton = new Element();
	const setup = { prefersDark: false, reducedMotion: true, scrollButton };
	const { context, root, windowListeners } = runAsset("scroll-top.js", setup);

	assert.equal(scrollButton.hidden, false);
	assert.equal(scrollButton.tabIndex, -1);
	context.window.scrollY = 500;
	windowListeners.scroll();
	assert.equal(scrollButton.classList.contains("is-visible"), true);
	assert.equal(scrollButton.tabIndex, 0);
	scrollButton.listeners.click();
	assert.equal(setup.scrollTo.top, 0);
	assert.equal(setup.scrollTo.behavior, "auto");
});

test("scroll-top responds to resize and remains inaccessible when hidden", () => {
	const scrollButton = new Element();
	const setup = { prefersDark: false, reducedMotion: false, scrollButton };
	const { context, root, windowListeners } = runAsset("scroll-top.js", setup);

	context.window.scrollY = 500;
	windowListeners.scroll();
	assert.equal(scrollButton.classList.contains("is-visible"), true);
	root.scrollHeight = 800;
	windowListeners.resize();
	assert.equal(scrollButton.hidden, true);
	assert.equal(scrollButton.classList.contains("is-visible"), false);
	assert.equal(scrollButton.tabIndex, -1);
	assert.equal(scrollButton.getAttribute("aria-hidden"), "true");

	root.scrollHeight = 2400;
	context.window.scrollY = 0;
	windowListeners.resize();
	assert.equal(scrollButton.hidden, false);
	assert.equal(scrollButton.tabIndex, -1);
});

test("component contract keeps geometry and component motion centralised", () => {
	const css = readFileSync(new URL("../components.css", import.meta.url), "utf8");
	const foundation = readFileSync(new URL("../foundation.css", import.meta.url), "utf8");
	for (const primitive of [".ui-segmented", ".ui-segmented-option", ".ui-tag", ".ui-action", ".ui-pill", ".ui-toggle", ".ui-card", ".ui-code", ".ui-tooltip", ".ui-swatch", ".ui-palette-card", ".ui-scroll-top"]) assert.ok(css.includes(primitive));
	assert.match(css, /\.ui-segmented \{[^}]*border-radius: 10px/);
	assert.match(css, /\.ui-segmented-option \{[^}]*min-width: 58px[^}]*border-radius: 7px[^}]*padding: 7px 11px[^}]*font-size: 13px/);
	assert.match(css, /\.ui-scroll-top \{[^}]*width: 42px[^}]*height: 42px[^}]*border-radius: 7px[^}]*font-size: 19px/);
	assert.match(css, /\.ui-card--landing \{[^}]*border-radius: 32px/);
	assert.match(css, /\.ui-card--compact \{[^}]*padding: 12px/);
	assert.match(css, /\.ui-card--flush \{[^}]*padding: 0/);
	assert.match(css, /\.ui-palette-card--compact \{[^}]*padding: 10px/);
	assert.match(css, /\.ui-toggle \{[^}]*border-radius: 7px/);
	assert.match(css, /\.ui-action--landing \{[^}]*padding: 9px 14px[^}]*font-size: \.94rem[^}]*font-weight: 400/);
	assert.doesNotMatch(css, /prefers-reduced-motion/);
	assert.match(foundation, /@media \(prefers-reduced-motion: reduce\)/);
	assert.match(foundation, /transition-duration: 0\.01ms !important/);
});

test("catalogue loads every shared asset and documents public component classes", () => {
	const catalogue = readFileSync(new URL("../index.html", import.meta.url), "utf8");
	const agents = readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8");
	for (const asset of ["foundation.css", "components.css", "theme.js", "scroll-top.js"]) assert.match(catalogue, new RegExp(`(?:href|src)="${asset}"`));
	for (const component of [
		"ui-segmented", "ui-segmented--two", "ui-segmented--vertical", "ui-segmented--vertical-at-wide", "ui-segmented--contrast", "ui-segmented-option",
		"ui-tag", "ui-tag--fill-at-mobile", "ui-pill", "ui-pill--color", "ui-pill--stacked-at-mobile", "ui-color-dot", "ui-toggle",
		"ui-action", "ui-action--landing", "ui-action--pending", "ui-card", "ui-card--landing", "ui-card--compact", "ui-card--flush", "ui-code", "ui-tooltip",
		"ui-swatch", "ui-palette-card", "ui-palette-card--compact", "ui-palette-sample", "ui-swatch-color", "ui-swatch-label", "ui-swatch-name", "ui-copy-feedback", "ui-scroll-top",
	]) assert.match(catalogue, new RegExp(`class="[^"]*\\b${component}\\b`));
	assert.match(agents, /index\.html/);
	assert.match(agents, /completeness test/);
});
