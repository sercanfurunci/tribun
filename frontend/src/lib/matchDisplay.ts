import type { Lang } from '../i18n/translations';

const TEAM_REGION_CODES: Record<string, string> = {
  afghanistan: 'AF',
  albania: 'AL',
  algeria: 'DZ',
  angola: 'AO',
  argentina: 'AR',
  armenia: 'AM',
  australia: 'AU',
  austria: 'AT',
  azerbaijan: 'AZ',
  bahrain: 'BH',
  bangladesh: 'BD',
  belarus: 'BY',
  belgium: 'BE',
  belize: 'BZ',
  benin: 'BJ',
  bolivia: 'BO',
  bosniaherzegovina: 'BA',
  bosniaandherzegovina: 'BA',
  botswana: 'BW',
  brazil: 'BR',
  bulgaria: 'BG',
  burkinafaso: 'BF',
  burundi: 'BI',
  cambodia: 'KH',
  cameroon: 'CM',
  canada: 'CA',
  capeverde: 'CV',
  centralafricanrepublic: 'CF',
  chad: 'TD',
  chile: 'CL',
  china: 'CN',
  colombia: 'CO',
  comoros: 'KM',
  congo: 'CG',
  costarica: 'CR',
  croatia: 'HR',
  cuba: 'CU',
  curacao: 'CW',
  cyprus: 'CY',
  czechrepublic: 'CZ',
  denmark: 'DK',
  djibouti: 'DJ',
  dominicanrepublic: 'DO',
  ecuador: 'EC',
  egypt: 'EG',
  elsalvador: 'SV',
  equatorialguinea: 'GQ',
  eritrea: 'ER',
  estonia: 'EE',
  eswatini: 'SZ',
  ethiopia: 'ET',
  finland: 'FI',
  france: 'FR',
  gabon: 'GA',
  gambia: 'GM',
  georgia: 'GE',
  germany: 'DE',
  ghana: 'GH',
  greece: 'GR',
  guatemala: 'GT',
  guinea: 'GN',
  guineabissau: 'GW',
  haiti: 'HT',
  honduras: 'HN',
  hungary: 'HU',
  iceland: 'IS',
  india: 'IN',
  indonesia: 'ID',
  iran: 'IR',
  iraq: 'IQ',
  ireland: 'IE',
  israel: 'IL',
  italy: 'IT',
  ivorycoast: 'CI',
  cotedivoire: 'CI',
  jamaica: 'JM',
  japan: 'JP',
  jordan: 'JO',
  kazakhstan: 'KZ',
  kenya: 'KE',
  kosovo: 'XK',
  kuwait: 'KW',
  kyrgyzstan: 'KG',
  laos: 'LA',
  latvia: 'LV',
  lebanon: 'LB',
  lesotho: 'LS',
  liberia: 'LR',
  libya: 'LY',
  lithuania: 'LT',
  luxembourg: 'LU',
  madagascar: 'MG',
  malawi: 'MW',
  malaysia: 'MY',
  mali: 'ML',
  malta: 'MT',
  mauritania: 'MR',
  mauritius: 'MU',
  mexico: 'MX',
  moldova: 'MD',
  mongolia: 'MN',
  montenegro: 'ME',
  morocco: 'MA',
  mozambique: 'MZ',
  myanmar: 'MM',
  namibia: 'NA',
  nepal: 'NP',
  netherlands: 'NL',
  newzealand: 'NZ',
  nicaragua: 'NI',
  niger: 'NE',
  nigeria: 'NG',
  northafrica: 'TN',
  northkorea: 'KP',
  northmacedonia: 'MK',
  norway: 'NO',
  oman: 'OM',
  pakistan: 'PK',
  palestine: 'PS',
  panama: 'PA',
  paraguay: 'PY',
  peru: 'PE',
  philippines: 'PH',
  poland: 'PL',
  portugal: 'PT',
  qatar: 'QA',
  romania: 'RO',
  russia: 'RU',
  rwanda: 'RW',
  saudiarabia: 'SA',
  senegal: 'SN',
  serbia: 'RS',
  sierraleone: 'SL',
  singapore: 'SG',
  slovakia: 'SK',
  slovenia: 'SI',
  somalia: 'SO',
  southafrica: 'ZA',
  southkorea: 'KR',
  spain: 'ES',
  srilanka: 'LK',
  sudan: 'SD',
  sweden: 'SE',
  switzerland: 'CH',
  syria: 'SY',
  taiwan: 'TW',
  tajikistan: 'TJ',
  tanzania: 'TZ',
  thailand: 'TH',
  togo: 'TG',
  trinidadandtobago: 'TT',
  tunisia: 'TN',
  turkey: 'TR',
  turkmenistan: 'TM',
  uganda: 'UG',
  ukraine: 'UA',
  unitedarabemirates: 'AE',
  uae: 'AE',
  unitedkingdom: 'GB',
  unitedstates: 'US',
  unitedstatesofamerica: 'US',
  usa: 'US',
  uruguay: 'UY',
  uzbekistan: 'UZ',
  venezuela: 'VE',
  vietnam: 'VN',
  yemen: 'YE',
  zambia: 'ZM',
  zimbabwe: 'ZW',
};

const TEAM_NAME_OVERRIDES: Record<Lang, Record<string, string>> = {
  en: {
    england: 'England',
    scotland: 'Scotland',
    wales: 'Wales',
    czechrepublic: 'Czech Republic',
    southkorea: 'South Korea',
    unitedstates: 'United States',
    unitedstatesofamerica: 'United States',
    usa: 'United States',
  },
  tr: {
    england: 'İngiltere',
    scotland: 'İskoçya',
    wales: 'Galler',
    czechrepublic: 'Çek Cumhuriyeti',
    southkorea: 'Güney Kore',
    unitedstates: 'Amerika Birleşik Devletleri',
    unitedstatesofamerica: 'Amerika Birleşik Devletleri',
    usa: 'Amerika Birleşik Devletleri',
  },
};

const REGION_NAMES = new Map<string, Intl.DisplayNames>();

function normalizeTeamName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function getRegionNames(lang: Lang) {
  const cached = REGION_NAMES.get(lang);
  if (cached) return cached;

  const displayNames = new Intl.DisplayNames([lang], { type: 'region' });
  REGION_NAMES.set(lang, displayNames);
  return displayNames;
}

export function formatTeamName(name: string, lang: Lang) {
  const code = TEAM_REGION_CODES[normalizeTeamName(name)];
  const override = TEAM_NAME_OVERRIDES[lang][normalizeTeamName(name)];
  if (override) return override;
  if (!code) return name;

  return getRegionNames(lang).of(code) ?? name;
}

export function formatMatchDay(matchDay: string | undefined, lang: Lang) {
  if (!matchDay) return '';

  const trimmed = matchDay.trim();
  const normalized = trimmed.toLowerCase();

  const roundMatch = normalized.match(/^round\s*(?:\s+)?(\d+)$/i);
  if (roundMatch) {
    const round = roundMatch[1];
    return lang === 'tr' ? `${round}. Tur` : `Round ${round}`;
  }

  if (normalized === 'round of 16') {
    return lang === 'tr' ? 'Son 16 Turu' : 'Round of 16';
  }

  if (normalized === 'quarter-finals' || normalized === 'quarter final' || normalized === 'quarter-final') {
    return lang === 'tr' ? 'Çeyrek Final' : 'Quarter-finals';
  }

  if (normalized === 'semi-finals' || normalized === 'semi final' || normalized === 'semi-final') {
    return lang === 'tr' ? 'Yarı Final' : 'Semi-finals';
  }

  if (normalized === 'final') {
    return lang === 'tr' ? 'Final' : 'Final';
  }

  return trimmed;
}
