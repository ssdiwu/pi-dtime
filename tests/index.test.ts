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

function setupExtension() {
	const handlers = new Map<string, EventHandler>();
	const entries: Array<{ type: string; customType: string; data: unknown }> = [];
	let renderer: EntryRenderer | undefined;

	const pi = {
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
	return { handlers, entries, renderer };
}

const theme: TestTheme = {
	fg: (_color, text) => text,
};

function render(renderer: EntryRenderer, data: unknown): string {
	return renderer({ data }, { expanded: false }, theme).render(120).join("\n").trimEnd();
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
			data: {
				version: 1,
				durationMs: 3_500,
			},
		});
		expect(render(renderer, entries[0]?.data)).toBe("本次回复耗时 4 秒 · 结束于 20:30:03");
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
