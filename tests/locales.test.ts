import { describe, expect, it } from "vitest";
import {
	createTimingBundles,
	DEFAULT_LOCALE,
	getIntlLocale,
	getTimingMessages,
	resolveTimingLocale,
	SUPPORTED_LOCALES,
} from "../src/locales.js";

const EXPECTED_LOCALES = [
	"cs",
	"da",
	"de",
	"el",
	"en",
	"es",
	"fi",
	"fr",
	"hi",
	"id",
	"it",
	"ja",
	"ko",
	"nl",
	"pl",
	"pt-BR",
	"pt-PT",
	"ro",
	"sg",
	"sv",
	"tr",
	"uk",
	"vi",
	"zh-CN",
	"zh-TW",
].sort();

describe("timing locale bundles", () => {
	it("covers every locale shipped by pi-di18n", () => {
		expect(SUPPORTED_LOCALES).toEqual(EXPECTED_LOCALES);
		const bundles = createTimingBundles();
		expect(bundles).toHaveLength(EXPECTED_LOCALES.length);
		for (const bundle of bundles) {
			expect(bundle.version).toBe(1);
			expect(bundle.namespace).toBe("pi-dtime");
			expect(bundle.integration.capability).toBe("pi.i18n.v1");
			expect(bundle.messages.linePrefix.length).toBeGreaterThan(0);
			expect(bundle.messages.lineSuffix).toContain("{ended}");
			expect(bundle.messages.unavailable.length).toBeGreaterThan(0);
			expect(bundle.messages.lessThanSecond.length).toBeGreaterThan(0);
		}
	});

	it("normalizes regional locales and keeps deterministic fallbacks", () => {
		expect(DEFAULT_LOCALE).toBe("zh-CN");
		expect(resolveTimingLocale("zh-Hant-HK")).toBe("zh-TW");
		expect(resolveTimingLocale("zh-Hans")).toBe("zh-CN");
		expect(resolveTimingLocale("en-GB")).toBe("en");
		expect(resolveTimingLocale("en-SG")).toBe("sg");
		expect(resolveTimingLocale("pt-BR")).toBe("pt-BR");
		expect(resolveTimingLocale("pt-AO")).toBe("pt-PT");
		expect(resolveTimingLocale("ru")).toBe("en");
		expect(resolveTimingLocale("!!!")).toBe("zh-CN");
		expect(getIntlLocale("sg")).toBe("en-SG");
		expect(getTimingMessages("fi").lessThanSecond).toBe("alle 1 sekuntia");
	});

	it("preserves the established Chinese fallback copy", () => {
		expect(getTimingMessages("zh-CN")).toEqual({
			linePrefix: "本次回复耗时 ",
			lineSuffix: " · 结束于 {ended}",
			unavailable: "回复计时数据不可用",
			lessThanSecond: "不到 1 秒",
		});
	});
});
