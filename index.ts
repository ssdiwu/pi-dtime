import { performance } from "node:perf_hooks";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";

const ENTRY_TYPE = "response-timing";

interface ResponseTimingEntry {
	version: 1;
	startedAt: number;
	endedAt: number;
	durationMs: number;
}

function isResponseTimingEntry(value: unknown): value is ResponseTimingEntry {
	if (!value || typeof value !== "object") return false;
	const entry = value as Partial<ResponseTimingEntry>;
	const { startedAt, endedAt, durationMs } = entry;
	return (
		entry.version === 1 &&
		Number.isSafeInteger(startedAt) &&
		Number.isSafeInteger(endedAt) &&
		Number.isSafeInteger(durationMs) &&
		!Number.isNaN(new Date(startedAt!).getTime()) &&
		!Number.isNaN(new Date(endedAt!).getTime()) &&
		startedAt! <= endedAt! &&
		durationMs === endedAt! - startedAt!
	);
}

function formatDuration(durationMs: number): string {
	if (durationMs < 1_000) return "不到 1 秒";

	const totalSeconds = Math.round(durationMs / 1_000);
	const hours = Math.floor(totalSeconds / 3_600);
	const minutes = Math.floor((totalSeconds % 3_600) / 60);
	const seconds = totalSeconds % 60;
	const parts: string[] = [];

	if (hours > 0) parts.push(`${hours} 小时`);
	if (minutes > 0) parts.push(`${minutes} 分`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds} 秒`);
	return parts.join(" ");
}

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

function formatEndTime(startedAt: number, endedAt: number): string {
	const started = new Date(startedAt);
	const ended = new Date(endedAt);
	const time = `${pad(ended.getHours())}:${pad(ended.getMinutes())}:${pad(ended.getSeconds())}`;
	const sameDay =
		started.getFullYear() === ended.getFullYear() &&
		started.getMonth() === ended.getMonth() &&
		started.getDate() === ended.getDate();

	if (sameDay) return time;
	return `${ended.getFullYear()}-${pad(ended.getMonth() + 1)}-${pad(ended.getDate())} ${time}`;
}

export default function dtimeExtension(pi: ExtensionAPI): void {
	let monotonicStartedAt: number | undefined;

	pi.registerEntryRenderer<ResponseTimingEntry>(ENTRY_TYPE, (entry, _options, theme) => {
		if (!isResponseTimingEntry(entry.data)) {
			return new Text(theme.fg("warning", "回复计时数据不可用"), 0, 0);
		}

		const duration = theme.fg("accent", formatDuration(entry.data.durationMs));
		const ended = formatEndTime(entry.data.startedAt, entry.data.endedAt);
		return new Text(
			`${theme.fg("dim", "本次回复耗时 ")}${duration}${theme.fg("dim", ` · 结束于 ${ended}`)}`,
			0,
			0,
		);
	});

	pi.on("session_start", () => {
		monotonicStartedAt = undefined;
	});

	pi.on("agent_start", () => {
		monotonicStartedAt ??= performance.now();
	});

	pi.on("agent_settled", () => {
		if (monotonicStartedAt === undefined) return;

		const runStartedAt = monotonicStartedAt;
		const endedAt = Date.now();
		const durationMs = Math.max(0, Math.round(performance.now() - runStartedAt));
		monotonicStartedAt = undefined;
		pi.appendEntry<ResponseTimingEntry>(ENTRY_TYPE, {
			version: 1,
			startedAt: endedAt - durationMs,
			endedAt,
			durationMs,
		});
	});

	pi.on("session_shutdown", () => {
		monotonicStartedAt = undefined;
	});
}
