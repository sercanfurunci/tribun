import type { Lang } from '../i18n/translations';

const TEAM_REGION_CODES: Record<string, string> = {
  argentina: 'AR',
  australia: 'AU',
  belgium: 'BE',
  bolivia: 'BO',
  bosniaherzegovina: 'BA',
  brazil: 'BR',
  canada: 'CA',
  chile: 'CL',
  china: 'CN',
  colombia: 'CO',
  croatia: 'HR',
  czechrepublic: 'CZ',
  denmark: 'DK',
  ecuador: 'EC',
  egypt: 'EG',
  france: 'FR',
  germany: 'DE',
  greece: 'GR',
  iran: 'IR',
  italy: 'IT',
  japan: 'JP',
  mexico: 'MX',
  morocco: 'MA',
  netherlands: 'NL',
  newzealand: 'NZ',
  nigeria: 'NG',
  paraguay: 'PY',
  peru: 'PE',
  poland: 'PL',
  portugal: 'PT',
  qatar: 'QA',
  romania: 'RO',
  saudiarabia: 'SA',
  southafrica: 'ZA',
  southkorea: 'KR',
  spain: 'ES',
  switzerland: 'CH',
  turkey: 'TR',
  ukraine: 'UA',
  uruguay: 'UY',
  usa: 'US',
  unitedstates: 'US',
  unitedstatesofamerica: 'US',
  venezuela: 'VE',
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
  return name.toLowerCase().replace(/[^a-z]/g, '');
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
