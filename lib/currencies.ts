export type CurrencyCode =
  | 'USD'
  | 'INR'
  | 'NGN'
  | 'CNY'
  | 'VND'
  | 'IDR'
  | 'PHP'
  | 'PKR'
  | 'BRL'
  | 'TRY'
  | 'RUB'
  | 'UAH'
  | 'KES'
  | 'ARS'
  | 'THB'
  | 'KRW'
  | 'MXN'
  | 'COP'
  | 'ZAR'
  | 'GBP'
  | 'EUR'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'SGD'
  | 'AED';

export type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';
export const CURRENCY_STORAGE_KEY = 'satsofbitcoin-currency';

/** Sensible default fiat when the UI language changes (if user has no saved currency) */
export const LANGUAGE_DEFAULT_CURRENCY: Record<string, CurrencyCode> = {
  en: 'USD',
  zh: 'CNY',
  hi: 'INR',
  es: 'MXN',
  ar: 'AED',
  pt: 'BRL',
  ru: 'RUB',
  vi: 'VND',
  id: 'IDR',
  tr: 'TRY',
  bn: 'INR',
  fr: 'EUR',
  ja: 'JPY',
  ur: 'PKR',
  de: 'EUR',
  ko: 'KRW',
  th: 'THB',
  it: 'EUR',
  uk: 'UAH',
  pl: 'EUR',
  tl: 'PHP',
  nl: 'EUR',
  ms: 'SGD',
  fa: 'USD',
  ha: 'NGN',
  yo: 'NGN',
  sw: 'KES',
  kn: 'INR',
  ta: 'INR',
  te: 'INR',
  ro: 'EUR',
  cs: 'EUR',
  sv: 'EUR',
  no: 'EUR',
  da: 'EUR',
  fi: 'EUR',
  el: 'EUR',
  he: 'USD',
  my: 'USD',
  km: 'USD',
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value);
}

export function getCurrency(code: CurrencyCode): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
