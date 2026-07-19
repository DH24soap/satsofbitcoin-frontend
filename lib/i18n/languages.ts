export type LanguageCode =
  | 'en'
  | 'zh'
  | 'hi'
  | 'es'
  | 'fr'
  | 'ar'
  | 'bn'
  | 'pt'
  | 'ru'
  | 'ur'
  | 'id'
  | 'de';

export type LanguageOption = {
  code: LanguageCode;
  /** English label for accessibility */
  name: string;
  /** Native script label shown in the dropdown */
  nativeName: string;
  flag: string;
  /** BCP 47 locale for dates/numbers */
  locale: string;
  dir: 'ltr' | 'rtl';
  /** Full language name for AI system prompts */
  aiName: string;
};

/** Top 12 most spoken languages worldwide */
export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', locale: 'en-US', dir: 'ltr', aiName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', locale: 'zh-CN', dir: 'ltr', aiName: 'Simplified Chinese' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN', dir: 'ltr', aiName: 'Hindi' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES', dir: 'ltr', aiName: 'Spanish' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR', dir: 'ltr', aiName: 'French' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', locale: 'ar-SA', dir: 'rtl', aiName: 'Arabic' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', locale: 'bn-BD', dir: 'ltr', aiName: 'Bengali' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', locale: 'pt-BR', dir: 'ltr', aiName: 'Portuguese' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', locale: 'ru-RU', dir: 'ltr', aiName: 'Russian' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', locale: 'ur-PK', dir: 'rtl', aiName: 'Urdu' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', locale: 'id-ID', dir: 'ltr', aiName: 'Indonesian' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', locale: 'de-DE', dir: 'ltr', aiName: 'German' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'satsofbitcoin-lang';

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((lang) => lang.code === value);
}

export function getLanguage(code: LanguageCode): LanguageOption {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0];
}
