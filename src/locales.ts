export const TIMING_NAMESPACE = "pi-dtime";
export const DEFAULT_LOCALE = "zh-CN";

export interface TimingMessages {
	linePrefix: string;
	lineSuffix: string;
	unavailable: string;
	lessThanSecond: string;
}

export interface TimingBundle {
	version: 1;
	namespace: typeof TIMING_NAMESPACE;
	locale: string;
	messages: TimingMessages;
	integration: {
		capability: "pi.i18n.v1";
		provider: "pi-dtime";
		coreCompat: {
			minContractVersion: 1;
			detectionEvent: "pi-core/i18n/requestApi";
		};
	};
}

const TIMING_MESSAGES = {
	cs: {
		linePrefix: "Odpověď trvala ",
		lineSuffix: " · Dokončeno v {ended}",
		unavailable: "Data časování odpovědi nejsou k dispozici",
		lessThanSecond: "méně než 1 sekunda",
	},
	da: {
		linePrefix: "Svaret tog ",
		lineSuffix: " · Afsluttet kl. {ended}",
		unavailable: "Svartidsdata er ikke tilgængelige",
		lessThanSecond: "mindre end 1 sekund",
	},
	de: {
		linePrefix: "Antwortdauer ",
		lineSuffix: " · Beendet um {ended}",
		unavailable: "Antwortzeitdaten sind nicht verfügbar",
		lessThanSecond: "weniger als 1 Sekunde",
	},
	el: {
		linePrefix: "Η απόκριση διήρκεσε ",
		lineSuffix: " · Ολοκληρώθηκε στις {ended}",
		unavailable: "Τα δεδομένα χρονισμού απόκρισης δεν είναι διαθέσιμα",
		lessThanSecond: "λιγότερο από 1 δευτερόλεπτο",
	},
	en: {
		linePrefix: "Response took ",
		lineSuffix: " · Finished at {ended}",
		unavailable: "Timing data unavailable",
		lessThanSecond: "less than 1 second",
	},
	es: {
		linePrefix: "La respuesta tardó ",
		lineSuffix: " · Finalizó a las {ended}",
		unavailable: "Los datos de tiempo de respuesta no están disponibles",
		lessThanSecond: "menos de 1 segundo",
	},
	fi: {
		linePrefix: "Vastaus kesti ",
		lineSuffix: " · Valmistui klo {ended}",
		unavailable: "Vastauksen ajoitustiedot eivät ole saatavilla",
		lessThanSecond: "alle 1 sekuntia",
	},
	fr: {
		linePrefix: "La réponse a pris ",
		lineSuffix: " · Terminée à {ended}",
		unavailable: "Données de durée de réponse indisponibles",
		lessThanSecond: "moins de 1 seconde",
	},
	hi: {
		linePrefix: "उत्तर में ",
		lineSuffix: " लगे · समाप्ति समय {ended}",
		unavailable: "उत्तर समय डेटा उपलब्ध नहीं है",
		lessThanSecond: "1 सेकंड से कम",
	},
	id: {
		linePrefix: "Respons memerlukan ",
		lineSuffix: " · Selesai pada {ended}",
		unavailable: "Data waktu respons tidak tersedia",
		lessThanSecond: "kurang dari 1 detik",
	},
	it: {
		linePrefix: "La risposta ha richiesto ",
		lineSuffix: " · Completata alle {ended}",
		unavailable: "Dati sui tempi di risposta non disponibili",
		lessThanSecond: "meno di 1 secondo",
	},
	ja: {
		linePrefix: "今回の応答時間 ",
		lineSuffix: " · 完了時刻 {ended}",
		unavailable: "応答時間データを利用できません",
		lessThanSecond: "1秒未満",
	},
	ko: {
		linePrefix: "이번 응답 소요 시간 ",
		lineSuffix: " · 완료 시각 {ended}",
		unavailable: "응답 시간 데이터를 사용할 수 없습니다",
		lessThanSecond: "1초 미만",
	},
	nl: {
		linePrefix: "Antwoord duurde ",
		lineSuffix: " · Voltooid om {ended}",
		unavailable: "Gegevens over de antwoordtijd zijn niet beschikbaar",
		lessThanSecond: "minder dan 1 seconde",
	},
	pl: {
		linePrefix: "Odpowiedź zajęła ",
		lineSuffix: " · Zakończono o {ended}",
		unavailable: "Dane czasu odpowiedzi są niedostępne",
		lessThanSecond: "mniej niż 1 sekunda",
	},
	"pt-BR": {
		linePrefix: "A resposta levou ",
		lineSuffix: " · Concluída às {ended}",
		unavailable: "Dados de tempo de resposta indisponíveis",
		lessThanSecond: "menos de 1 segundo",
	},
	"pt-PT": {
		linePrefix: "A resposta demorou ",
		lineSuffix: " · Concluída às {ended}",
		unavailable: "Dados de tempo de resposta indisponíveis",
		lessThanSecond: "menos de 1 segundo",
	},
	ro: {
		linePrefix: "Răspunsul a durat ",
		lineSuffix: " · Finalizat la {ended}",
		unavailable: "Datele despre durata răspunsului nu sunt disponibile",
		lessThanSecond: "mai puțin de 1 secundă",
	},
	sg: {
		linePrefix: "Response took ",
		lineSuffix: " · Finished at {ended}",
		unavailable: "Timing data unavailable",
		lessThanSecond: "less than 1 second",
	},
	sv: {
		linePrefix: "Svaret tog ",
		lineSuffix: " · Slutfört kl. {ended}",
		unavailable: "Svarstidsdata är inte tillgängliga",
		lessThanSecond: "mindre än 1 sekund",
	},
	tr: {
		linePrefix: "Yanıt ",
		lineSuffix: " sürdü · Tamamlanma saati {ended}",
		unavailable: "Yanıt süresi verileri kullanılamıyor",
		lessThanSecond: "1 saniyeden kısa",
	},
	uk: {
		linePrefix: "Відповідь тривала ",
		lineSuffix: " · Завершено о {ended}",
		unavailable: "Дані про час відповіді недоступні",
		lessThanSecond: "менше ніж 1 секунда",
	},
	vi: {
		linePrefix: "Phản hồi mất ",
		lineSuffix: " · Hoàn tất lúc {ended}",
		unavailable: "Không có dữ liệu thời gian phản hồi",
		lessThanSecond: "dưới 1 giây",
	},
	"zh-CN": {
		linePrefix: "本次回复耗时 ",
		lineSuffix: " · 结束于 {ended}",
		unavailable: "回复计时数据不可用",
		lessThanSecond: "不到 1 秒",
	},
	"zh-TW": {
		linePrefix: "本次回覆耗時 ",
		lineSuffix: " · 結束於 {ended}",
		unavailable: "回覆計時資料無法使用",
		lessThanSecond: "少於 1 秒",
	},
} satisfies Record<string, TimingMessages>;

export const SUPPORTED_LOCALES = Object.freeze(Object.keys(TIMING_MESSAGES).sort());

function canonicalize(locale: string): string | undefined {
	const raw = String(locale ?? "").trim().replaceAll("_", "-");
	if (!raw) return undefined;
	if (raw.toLowerCase() === "sg" || raw.toLowerCase() === "en-sg") return "sg";
	try {
		return Intl.getCanonicalLocales(raw)[0];
	} catch {
		return undefined;
	}
}

export function resolveTimingLocale(locale: string): string {
	const canonical = canonicalize(locale);
	if (!canonical) return DEFAULT_LOCALE;

	const exact = SUPPORTED_LOCALES.find((candidate) => candidate.toLowerCase() === canonical.toLowerCase());
	if (exact) return exact;

	const lower = canonical.toLowerCase();
	if (lower.startsWith("zh-hant") || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-mo") {
		return "zh-TW";
	}
	if (lower.startsWith("zh")) return "zh-CN";
	if (lower.startsWith("pt-br")) return "pt-BR";
	if (lower.startsWith("pt")) return "pt-PT";

	const language = lower.split("-")[0] ?? "";
	return SUPPORTED_LOCALES.find((candidate) => candidate.toLowerCase() === language) ?? "en";
}

export function getTimingMessages(locale: string): TimingMessages {
	return TIMING_MESSAGES[resolveTimingLocale(locale) as keyof typeof TIMING_MESSAGES];
}

export function getIntlLocale(locale: string): string {
	const raw = String(locale ?? "").trim();
	if (raw.toLowerCase() === "sg") return "en-SG";
	try {
		return Intl.getCanonicalLocales(raw.replaceAll("_", "-"))[0] ?? getIntlLocale(resolveTimingLocale(locale));
	} catch {
		const resolved = resolveTimingLocale(locale);
		return resolved === "sg" ? "en-SG" : resolved;
	}
}

export function createTimingBundles(): TimingBundle[] {
	return SUPPORTED_LOCALES.map((locale) => ({
		version: 1,
		namespace: TIMING_NAMESPACE,
		locale,
		messages: TIMING_MESSAGES[locale as keyof typeof TIMING_MESSAGES],
		integration: {
			capability: "pi.i18n.v1",
			provider: "pi-dtime",
			coreCompat: {
				minContractVersion: 1,
				detectionEvent: "pi-core/i18n/requestApi",
			},
		},
	}));
}
