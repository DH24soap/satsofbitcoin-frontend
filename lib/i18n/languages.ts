export type LanguageCode =
  | 'en'
  | 'zh'
  | 'hi'
  | 'es'
  | 'ar'
  | 'pt'
  | 'ru'
  | 'vi'
  | 'id'
  | 'tr'
  | 'bn'
  | 'fr'
  | 'ja'
  | 'ur'
  | 'de'
  | 'ko'
  | 'th'
  | 'it'
  | 'uk'
  | 'pl'
  | 'tl'
  | 'nl'
  | 'ms'
  | 'fa'
  | 'ha'
  | 'yo'
  | 'sw'
  | 'kn'
  | 'ta'
  | 'te'
  | 'ro'
  | 'cs'
  | 'sv'
  | 'no'
  | 'da'
  | 'fi'
  | 'el'
  | 'he'
  | 'my'
  | 'km';

export type LanguageOption = {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
  dir: 'ltr' | 'rtl';
  aiName: string;
  tier: 1 | 2 | 3 | 4;
};

/** 40 languages across major crypto / regional markets */
export const LANGUAGES: LanguageOption[] = [
  // Tier 1
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', locale: 'en-US', dir: 'ltr', aiName: 'English', tier: 1 },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文', flag: '🇨🇳', locale: 'zh-CN', dir: 'ltr', aiName: 'Simplified Chinese (Mandarin)', tier: 1 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN', dir: 'ltr', aiName: 'Hindi', tier: 1 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES', dir: 'ltr', aiName: 'Spanish', tier: 1 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', locale: 'ar-AE', dir: 'rtl', aiName: 'Arabic', tier: 1 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', locale: 'pt-BR', dir: 'ltr', aiName: 'Portuguese', tier: 1 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', locale: 'ru-RU', dir: 'ltr', aiName: 'Russian', tier: 1 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi-VN', dir: 'ltr', aiName: 'Vietnamese', tier: 1 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', locale: 'id-ID', dir: 'ltr', aiName: 'Indonesian', tier: 1 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR', dir: 'ltr', aiName: 'Turkish', tier: 1 },
  // Tier 2
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', locale: 'bn-BD', dir: 'ltr', aiName: 'Bengali', tier: 2 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR', dir: 'ltr', aiName: 'French', tier: 2 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', locale: 'ja-JP', dir: 'ltr', aiName: 'Japanese', tier: 2 },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', locale: 'ur-PK', dir: 'rtl', aiName: 'Urdu', tier: 2 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', locale: 'de-DE', dir: 'ltr', aiName: 'German', tier: 2 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', locale: 'ko-KR', dir: 'ltr', aiName: 'Korean', tier: 2 },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', locale: 'th-TH', dir: 'ltr', aiName: 'Thai', tier: 2 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', locale: 'it-IT', dir: 'ltr', aiName: 'Italian', tier: 2 },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', locale: 'uk-UA', dir: 'ltr', aiName: 'Ukrainian', tier: 2 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', locale: 'pl-PL', dir: 'ltr', aiName: 'Polish', tier: 2 },
  // Tier 3
  { code: 'tl', name: 'Filipino (Tagalog)', nativeName: 'Filipino', flag: '🇵🇭', locale: 'fil-PH', dir: 'ltr', aiName: 'Filipino (Tagalog)', tier: 3 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL', dir: 'ltr', aiName: 'Dutch', tier: 3 },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', locale: 'ms-MY', dir: 'ltr', aiName: 'Malay', tier: 3 },
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', flag: '🇮🇷', locale: 'fa-IR', dir: 'rtl', aiName: 'Persian (Farsi)', tier: 3 },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', locale: 'ha-NG', dir: 'ltr', aiName: 'Hausa', tier: 3 },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', locale: 'yo-NG', dir: 'ltr', aiName: 'Yoruba', tier: 3 },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', locale: 'sw-KE', dir: 'ltr', aiName: 'Swahili', tier: 3 },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', locale: 'kn-IN', dir: 'ltr', aiName: 'Kannada', tier: 3 },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', locale: 'ta-IN', dir: 'ltr', aiName: 'Tamil', tier: 3 },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', locale: 'te-IN', dir: 'ltr', aiName: 'Telugu', tier: 3 },
  // Tier 4
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', locale: 'ro-RO', dir: 'ltr', aiName: 'Romanian', tier: 4 },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', locale: 'cs-CZ', dir: 'ltr', aiName: 'Czech', tier: 4 },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', locale: 'sv-SE', dir: 'ltr', aiName: 'Swedish', tier: 4 },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', locale: 'nb-NO', dir: 'ltr', aiName: 'Norwegian', tier: 4 },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', locale: 'da-DK', dir: 'ltr', aiName: 'Danish', tier: 4 },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', locale: 'fi-FI', dir: 'ltr', aiName: 'Finnish', tier: 4 },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', locale: 'el-GR', dir: 'ltr', aiName: 'Greek', tier: 4 },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', locale: 'he-IL', dir: 'rtl', aiName: 'Hebrew', tier: 4 },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲', locale: 'my-MM', dir: 'ltr', aiName: 'Burmese', tier: 4 },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭', locale: 'km-KH', dir: 'ltr', aiName: 'Khmer', tier: 4 },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'satsofbitcoin-lang';

/** Browser language tags → our codes (including common aliases) */
const BROWSER_ALIASES: Record<string, LanguageCode> = {
  en: 'en',
  zh: 'zh',
  'zh-cn': 'zh',
  'zh-tw': 'zh',
  'zh-hans': 'zh',
  'zh-hant': 'zh',
  hi: 'hi',
  es: 'es',
  ar: 'ar',
  pt: 'pt',
  'pt-br': 'pt',
  ru: 'ru',
  vi: 'vi',
  id: 'id',
  tr: 'tr',
  bn: 'bn',
  fr: 'fr',
  ja: 'ja',
  ur: 'ur',
  de: 'de',
  ko: 'ko',
  th: 'th',
  it: 'it',
  uk: 'uk',
  pl: 'pl',
  tl: 'tl',
  fil: 'tl',
  nl: 'nl',
  ms: 'ms',
  fa: 'fa',
  ha: 'ha',
  yo: 'yo',
  sw: 'sw',
  kn: 'kn',
  ta: 'ta',
  te: 'te',
  ro: 'ro',
  cs: 'cs',
  sv: 'sv',
  no: 'no',
  nb: 'no',
  nn: 'no',
  da: 'da',
  fi: 'fi',
  el: 'el',
  he: 'he',
  iw: 'he',
  my: 'my',
  km: 'km',
};

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((lang) => lang.code === value);
}

export function getLanguage(code: LanguageCode): LanguageOption {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0];
}

export function resolveBrowserLanguage(tag: string): LanguageCode | null {
  const lower = tag.toLowerCase();
  if (BROWSER_ALIASES[lower]) return BROWSER_ALIASES[lower];
  const base = lower.split('-')[0];
  if (BROWSER_ALIASES[base]) return BROWSER_ALIASES[base];
  if (isLanguageCode(base)) return base;
  return null;
}
