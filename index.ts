import { performance } from "node:perf_hooks";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import {
	createTimingBundles,
	DEFAULT_LOCALE,
	getIntlLocale,
	getTimingMessages,
	resolveTimingLocale,
	TIMING_NAMESPACE,
	type TimingBundle,
	type TimingMessages,
} from "./src/locales.js";

const ENTRY_TYPE = "response-timing";
const I18N_REQUEST_EVENTS = ["pi-core/i18n/requestApi", "pi-i18n/requestApi"] as const;

interface ResponseTimingEntry {
	version: 1;
	startedAt: number;
	endedAt: number;
	durationMs: number;
}

interface OptionalI18nApi {
	getLocale(): string;
	registerBundle?(bundle: TimingBundle): { ok: boolean; errors: string[] };
	t?(fullKey: string, params?: Record<string, string | number>): string;
	onLocaleChanged?(callback: (locale: string) => void): () => void;
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

function fillTemplate(template: string, params?: Record<string, string | number>): string {
	return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, name: string) =>
		params?.[name] === undefined ? match : String(params[name]),
	);
}

function translate(
	api: OptionalI18nApi | undefined,
	locale: string,
	key: keyof TimingMessages,
	params?: Record<string, string | number>,
): string {
	const fullKey = `${TIMING_NAMESPACE}.${key}`;
	try {
		const translated = api?.t?.(fullKey, params);
		if (typeof translated === "string" && translated !== fullKey) return translated;
	} catch {
		// Fall through to pi-dtime's local bundle.
	}
	return fillTemplate(getTimingMessages(locale)[key], params);
}

function formatUnit(value: number, unit: "hour" | "minute" | "second", locale: string): string {
	const timingLocale = resolveTimingLocale(locale);
	if (timingLocale === "zh-CN" || timingLocale === "zh-TW") {
		const units =
			timingLocale === "zh-CN"
				? { hour: "小时", minute: "分", second: "秒" }
				: { hour: "小時", minute: "分", second: "秒" };
		return `${value} ${units[unit]}`;
	}

	try {
		return new Intl.NumberFormat(getIntlLocale(locale), {
			style: "unit",
			unit,
			unitDisplay: "long",
			useGrouping: false,
		}).format(value);
	} catch {
		return `${value} ${unit}${value === 1 ? "" : "s"}`;
	}
}

function formatDuration(durationMs: number, locale: string, api?: OptionalI18nApi): string {
	if (durationMs < 1_000) return translate(api, locale, "lessThanSecond");

	const totalSeconds = Math.round(durationMs / 1_000);
	const hours = Math.floor(totalSeconds / 3_600);
	const minutes = Math.floor((totalSeconds % 3_600) / 60);
	const seconds = totalSeconds % 60;
	const parts: string[] = [];

	if (hours > 0) parts.push(formatUnit(hours, "hour", locale));
	if (minutes > 0) parts.push(formatUnit(minutes, "minute", locale));
	if (seconds > 0 || parts.length === 0) parts.push(formatUnit(seconds, "second", locale));
	if (resolveTimingLocale(locale).startsWith("zh")) return parts.join(" ");

	try {
		return new Intl.ListFormat(getIntlLocale(locale), { style: "long", type: "unit" }).format(parts);
	} catch {
		return parts.join(" ");
	}
}

function formatEndTime(startedAt: number, endedAt: number, locale: string): string {
	const started = new Date(startedAt);
	const ended = new Date(endedAt);
	const sameDay =
		started.getFullYear() === ended.getFullYear() &&
		started.getMonth() === ended.getMonth() &&
		started.getDate() === ended.getDate();
	const dateOptions: Intl.DateTimeFormatOptions = sameDay
		? {}
		: { year: "numeric", month: "2-digit", day: "2-digit" };

	try {
		return new Intl.DateTimeFormat(getIntlLocale(locale), {
			...dateOptions,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h23",
		}).format(ended);
	} catch {
		return ended.toLocaleString();
	}
}

function isI18nApi(value: unknown): value is OptionalI18nApi {
	return !!value && typeof value === "object" && typeof (value as OptionalI18nApi).getLocale === "function";
}

export default function dtimeExtension(pi: ExtensionAPI): void {
	let monotonicStartedAt: number | undefined;
	let lastKnownLocale = DEFAULT_LOCALE;
	let i18nApi: OptionalI18nApi | undefined;
	let registeredApi: OptionalI18nApi | undefined;
	let unsubscribeLocaleChanged: (() => void) | undefined;

	const acceptI18nApi = (candidate: unknown) => {
		if (!isI18nApi(candidate)) return false;
		i18nApi = candidate;
		if (registeredApi !== candidate) {
			try {
				unsubscribeLocaleChanged?.();
			} catch {
				// A broken previous provider must not block the replacement.
			}
			unsubscribeLocaleChanged = undefined;
			try {
				const unsubscribe = candidate.onLocaleChanged?.((locale) => {
					if (typeof locale === "string" && locale.trim()) lastKnownLocale = locale;
				});
				if (typeof unsubscribe === "function") unsubscribeLocaleChanged = unsubscribe;
			} catch {
				// The public event remains available as a fallback signal.
			}
			registeredApi = candidate;
			for (const bundle of createTimingBundles()) {
				try {
					candidate.registerBundle?.(bundle);
				} catch {
					// Local messages remain available if bundle registration fails.
				}
			}
		}
		return true;
	};

	const requestI18nApi = () => {
		let accepted = false;
		for (const event of I18N_REQUEST_EVENTS) {
			if (accepted) break;
			try {
				pi.events.emit(event, {
					reply: (candidate: unknown) => {
						accepted = acceptI18nApi(candidate) || accepted;
					},
				});
			} catch {
				// pi-di18n is optional; the default locale remains usable.
			}
		}
	};

	const currentLocale = () => {
		try {
			const locale = i18nApi?.getLocale();
			if (typeof locale === "string" && locale.trim()) {
				lastKnownLocale = locale;
				return locale;
			}
		} catch {
			// Use the last valid locale signal.
		}
		return lastKnownLocale;
	};

	pi.events.on("pi-i18n/localeChanged", (payload: unknown) => {
		const locale = (payload as { locale?: unknown } | undefined)?.locale;
		if (typeof locale === "string" && locale.trim()) lastKnownLocale = locale;
	});
	requestI18nApi();

	pi.registerEntryRenderer<ResponseTimingEntry>(ENTRY_TYPE, (entry, _options, theme) => {
		const locale = currentLocale();
		if (!isResponseTimingEntry(entry.data)) {
			return new Text(theme.fg("warning", translate(i18nApi, locale, "unavailable")), 0, 0);
		}

		const duration = theme.fg("accent", formatDuration(entry.data.durationMs, locale, i18nApi));
		const ended = formatEndTime(entry.data.startedAt, entry.data.endedAt, locale);
		const prefix = translate(i18nApi, locale, "linePrefix");
		const suffix = translate(i18nApi, locale, "lineSuffix", { ended });
		return new Text(`${theme.fg("dim", prefix)}${duration}${theme.fg("dim", suffix)}`, 0, 0);
	});

	pi.on("session_start", () => {
		monotonicStartedAt = undefined;
		requestI18nApi();
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
