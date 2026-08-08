import { performance } from "node:perf_hooks";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { afterEach, describe, expect, it, vi } from "vitest";
import dtimeExtension from "../index.js";

type EventHandler = (event?: unknown, ctx?: unknown) => unknown;
type EntryRenderer = (entry: { data: unknown }, options: { expanded: boolean }, theme: TestTheme) => {
	render(width: number): string[];
};

interface TestTheme {
	fg(color: string, text: string): string;
}

interface TestBundle {
	version: 1;
	namespace: string;
	locale: string;
	messages: Record<string, string>;
}

function createTestI18n(initialLocale: string) {
	let locale = initialLocale;
	const bundles = new Map<string, Map<string, Record<string, string>>>();
	const api = {
		getLocale: () => locale,
		registerBundle(bundle: TestBundle) {
			const byLocale = bundles.get(bundle.namespace) ?? new Map<string, Record<string, string>>();
			byLocale.set(bundle.locale, bundle.messages);
			bundles.set(bundle.namespace, byLocale);
			return { ok: true, errors: [] };
		},
		t(fullKey: string, params?: Record<string, string | number>) {
			const separator = fullKey.indexOf(".");
			const namespace = separator < 0 ? "" : fullKey.slice(0, separator);
			const key = separator < 0 ? fullKey : fullKey.slice(separator + 1);
			const byLocale = bundles.get(namespace);
			const template = byLocale?.get(locale)?.[key] ?? byLocale?.get("en")?.[key];
			if (!template) return fullKey;
			return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, name: string) =>
				params?.[name] === undefined ? match : String(params[name]),
			);
		},
	};

	return {
		api,
		setLocale(nextLocale: string) {
			locale = nextLocale;
		},
		getRegisteredLocales() {
			return [...(bundles.get("pi-dtime")?.keys() ?? [])].sort();
		},
	};
}

function setupExtension(initialI18nApi?: unknown) {
	const handlers = new Map<string, EventHandler>();
	const eventHandlers = new Map<string, Set<(payload: unknown) => void>>();
	const entries: Array<{ type: string; customType: string; data: unknown }> = [];
	let renderer: EntryRenderer | undefined;
	let i18nApi = initialI18nApi;

	const events = {
		on(event: string, handler: (payload: unknown) => void) {
			const listeners = eventHandlers.get(event) ?? new Set<(payload: unknown) => void>();
			listeners.add(handler);
			eventHandlers.set(event, listeners);
		},
		emit(event: string, payload: unknown) {
			if (
				(event === "pi-core/i18n/requestApi" || event === "pi-i18n/requestApi") &&
				i18nApi !== undefined
			) {
				(payload as { reply?: (api: unknown) => void })?.reply?.(i18nApi);
			}
			for (const handler of eventHandlers.get(event) ?? []) handler(payload);
		},
	};

	const pi = {
		events,
		on: vi.fn((event: string, handler: EventHandler) => {
			handlers.set(event, handler);
		}),
		registerEntryRenderer: vi.fn((customType: string, nextRenderer: EntryRenderer) => {
			expect(customType).toBe("response-timing");
			renderer = nextRenderer;
		}),
		appendEntry: vi.fn((customType: string, data: unknown) => {
			entries.push({ type: "custom", customType, data });
		}),
	} as unknown as ExtensionAPI;

	dtimeExtension(pi);
	if (!renderer) throw new Error("entry renderer was not registered");
	return {
		handlers,
		entries,
		renderer,
		emitEvent: events.emit,
		setI18nApi(nextApi: unknown) {
			i18nApi = nextApi;
		},
	};
}

const theme: TestTheme = {
	fg: (_color, text) => text,
};

function render(renderer: EntryRenderer, data: unknown): string {
	return renderer({ data }, { expanded: false }, theme).render(120).join("\n").trimEnd();
}

function timingData(durationMs = 3_500) {
	const endedAt = new Date(2026, 7, 7, 20, 30, 3).getTime();
	return { version: 1, startedAt: endedAt - durationMs, endedAt, durationMs };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("pi-dtime", () => {
	it("appends one timing entry from the first agent_start through agent_settled", () => {
		const { handlers, entries, renderer } = setupExtension();
		let wallClockMs = new Date(2026, 7, 7, 20, 30, 0).getTime();
		let monotonicMs = 10_000;
		vi.spyOn(Date, "now").mockImplementation(() => wallClockMs);
		vi.spyOn(performance, "now").mockImplementation(() => monotonicMs);

		handlers.get("session_start")?.();
		handlers.get("agent_start")?.();
		wallClockMs += 1_500;
		monotonicMs += 1_500;
		handlers.get("agent_start")?.();
		wallClockMs += 2_000;
		monotonicMs += 2_000;
		handlers.get("agent_settled")?.();

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({
			type: "custom",
			customType: "response-timing",
			data: { version: 1, durationMs: 3_500 },
		});
		expect(render(renderer, entries[0]?.data)).toBe("本次回复耗时 4 秒 · 结束于 20:30:03");
	});

	it("renders persisted entries in the active pi-di18n locale and follows runtime changes", () => {
		const i18n = createTestI18n("en");
		const { renderer } = setupExtension(i18n.api);

		expect(render(renderer, timingData())).toBe("Response took 4 seconds · Finished at 20:30:03");
		i18n.setLocale("ja");
		expect(render(renderer, timingData())).toBe("今回の応答時間 4 秒 · 完了時刻 20:30:03");
		i18n.setLocale("zh-TW");
		expect(render(renderer, timingData())).toBe("本次回覆耗時 4 秒 · 結束於 20:30:03");
	});

	it("reconnects at session_start when pi-di18n loads after pi-dtime", () => {
		const i18n = createTestI18n("en");
		const extension = setupExtension();
		extension.setI18nApi(i18n.api);
		extension.handlers.get("session_start")?.();

		expect(render(extension.renderer, timingData())).toBe("Response took 4 seconds · Finished at 20:30:03");
	});

	it("uses localeChanged as a fail-soft locale signal when the API is unavailable", () => {
		const extension = setupExtension();
		extension.emitEvent("pi-i18n/localeChanged", { locale: "ko" });
		expect(render(extension.renderer, timingData())).toBe(
			"이번 응답 소요 시간 4초 · 완료 시각 20:30:03",
		);
	});

	it("tracks the API locale callback when direct locale reads later fail", () => {
		let localeListener: ((locale: string) => void) | undefined;
		let readsFail = false;
		const api = {
			getLocale() {
				if (readsFail) throw new Error("locale read failed");
				return "en";
			},
			onLocaleChanged(listener: (locale: string) => void) {
				localeListener = listener;
				return () => {};
			},
		};
		const { renderer } = setupExtension(api);
		expect(localeListener).toBeTypeOf("function");
		readsFail = true;
		localeListener?.("ja");
		expect(render(renderer, timingData())).toBe("今回の応答時間 4 秒 · 完了時刻 20:30:03");
	});

	it("falls back to Chinese when a discovered i18n API throws", () => {
		const brokenApi = {
			getLocale() {
				throw new Error("locale unavailable");
			},
			registerBundle() {
				throw new Error("bundle unavailable");
			},
			t() {
				throw new Error("translation unavailable");
			},
		};
		const { renderer } = setupExtension(brokenApi);
		expect(render(renderer, timingData())).toBe("本次回复耗时 4 秒 · 结束于 20:30:03");
	});

	it("keeps elapsed duration valid when the wall clock moves backward", () => {
		const { handlers, entries, renderer } = setupExtension();
		let wallClockMs = 1_000;
		let monotonicMs = 10_000;
		vi.spyOn(Date, "now").mockImplementation(() => wallClockMs);
		vi.spyOn(performance, "now").mockImplementation(() => monotonicMs);

		handlers.get("agent_start")?.();
		wallClockMs = 500;
		monotonicMs += 3_500;
		handlers.get("agent_settled")?.();

		expect(entries).toHaveLength(1);
		expect(entries[0]?.data).toEqual({
			version: 1,
			startedAt: -3_000,
			endedAt: 500,
			durationMs: 3_500,
		});
		expect(render(renderer, entries[0]?.data)).toContain("本次回复耗时 4 秒");
	});

	it("localizes unavailable persisted data", () => {
		const i18n = createTestI18n("en");
		const { renderer } = setupExtension(i18n.api);
		expect(render(renderer, { version: 1, startedAt: 0, endedAt: 60_000, durationMs: 0 })).toBe(
			"Timing data unavailable",
		);
	});

	it("rejects invalid dates and inconsistent persisted durations", () => {
		const { renderer } = setupExtension();
		expect(render(renderer, { version: 1, startedAt: 9e15, endedAt: 9e15, durationMs: 0 })).toBe(
			"回复计时数据不可用",
		);
		expect(render(renderer, { version: 1, startedAt: 0, endedAt: 60_000, durationMs: 0 })).toBe(
			"回复计时数据不可用",
		);
	});

	it("discards an incomplete run on session shutdown", () => {
		const { handlers, entries } = setupExtension();
		vi.spyOn(Date, "now").mockReturnValue(1_000);
		handlers.get("agent_start")?.();
		handlers.get("session_shutdown")?.();
		handlers.get("agent_settled")?.();
		expect(entries).toHaveLength(0);
	});
});
