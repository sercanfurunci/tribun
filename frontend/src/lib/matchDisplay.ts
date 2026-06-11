import type { Lang } from '../i18n/translations';


const TEAM_NAME_TR: Record<string, string> = {
  afghanistan: 'Afganistan',
  albania: 'Arnavutluk',
  algeria: 'Cezayir',
  angola: 'Angola',
  argentina: 'Arjantin',
  armenia: 'Ermenistan',
  australia: 'Avustralya',
  austria: 'Avusturya',
  azerbaijan: 'Azerbaycan',
  bahrain: 'Bahreyn',
  belarus: 'Belarus',
  belgium: 'Belçika',
  bolivia: 'Bolivya',
  bosniaherzegovina: 'Bosna-Hersek',
  bosniaandherzegovina: 'Bosna-Hersek',
  brazil: 'Brezilya',
  bulgaria: 'Bulgaristan',
  burkinafaso: 'Burkina Faso',
  cameroon: 'Kamerun',
  canada: 'Kanada',
  capeverde: 'Yeşil Burun',
  chile: 'Şili',
  china: 'Çin',
  colombia: 'Kolombiya',
  comoros: 'Komorlar',
  congo: 'Kongo',
  costarica: 'Kosta Rika',
  croatia: 'Hırvatistan',
  curacao: 'Curaçao',
  cyprus: 'Kıbrıs',
  czechrepublic: 'Çek Cumhuriyeti',
  czechia: 'Çek Cumhuriyeti',
  denmark: 'Danimarka',
  dominicanrepublic: 'Dominik Cumhuriyeti',
  ecuador: 'Ekvador',
  egypt: 'Mısır',
  elsalvador: 'El Salvador',
  england: 'İngiltere',
  equatorialguinea: 'Ekvator Ginesi',
  ethiopia: 'Etiyopya',
  finland: 'Finlandiya',
  france: 'Fransa',
  gabon: 'Gabon',
  gambia: 'Gambiya',
  georgia: 'Gürcistan',
  germany: 'Almanya',
  ghana: 'Gana',
  greece: 'Yunanistan',
  guatemala: 'Guatemala',
  guinea: 'Gine',
  haiti: 'Haiti',
  honduras: 'Honduras',
  hungary: 'Macaristan',
  iceland: 'İzlanda',
  india: 'Hindistan',
  indonesia: 'Endonezya',
  iran: 'İran',
  iraq: 'Irak',
  ireland: 'İrlanda',
  israel: 'İsrail',
  italy: 'İtalya',
  ivorycoast: 'Fildişi Sahili',
  cotedivoire: 'Fildişi Sahili',
  jamaica: 'Jamaika',
  japan: 'Japonya',
  jordan: 'Ürdün',
  kazakhstan: 'Kazakistan',
  kenya: 'Kenya',
  kuwait: 'Kuveyt',
  latvia: 'Letonya',
  lebanon: 'Lübnan',
  libya: 'Libya',
  lithuania: 'Litvanya',
  luxembourg: 'Lüksemburg',
  malaysia: 'Malezya',
  mali: 'Mali',
  malta: 'Malta',
  mauritania: 'Moritanya',
  mexico: 'Meksika',
  moldova: 'Moldova',
  montenegro: 'Karadağ',
  morocco: 'Fas',
  mozambique: 'Mozambik',
  netherlands: 'Hollanda',
  newzealand: 'Yeni Zelanda',
  nicaragua: 'Nikaragua',
  niger: 'Nijer',
  nigeria: 'Nijerya',
  northkorea: 'Kuzey Kore',
  northmacedonia: 'Kuzey Makedonya',
  norway: 'Norveç',
  oman: 'Umman',
  pakistan: 'Pakistan',
  panama: 'Panama',
  paraguay: 'Paraguay',
  peru: 'Peru',
  philippines: 'Filipinler',
  poland: 'Polonya',
  portugal: 'Portekiz',
  qatar: 'Katar',
  romania: 'Romanya',
  russia: 'Rusya',
  rwanda: 'Ruanda',
  saudiarabia: 'Suudi Arabistan',
  scotland: 'İskoçya',
  senegal: 'Senegal',
  serbia: 'Sırbistan',
  slovakia: 'Slovakya',
  slovenia: 'Slovenya',
  somalia: 'Somali',
  southafrica: 'Güney Afrika',
  southkorea: 'Güney Kore',
  spain: 'İspanya',
  sudan: 'Sudan',
  sweden: 'İsveç',
  switzerland: 'İsviçre',
  syria: 'Suriye',
  tajikistan: 'Tacikistan',
  tanzania: 'Tanzanya',
  thailand: 'Tayland',
  togo: 'Togo',
  trinidadandtobago: 'Trinidad ve Tobago',
  tunisia: 'Tunus',
  turkey: 'Türkiye',
  turkiye: 'Türkiye',
  ukraine: 'Ukrayna',
  unitedarabemirates: 'Birleşik Arap Emirlikleri',
  uae: 'Birleşik Arap Emirlikleri',
  unitedstates: 'Amerika Birleşik Devletleri',
  unitedstatesofamerica: 'Amerika Birleşik Devletleri',
  usa: 'Amerika Birleşik Devletleri',
  uruguay: 'Uruguay',
  uzbekistan: 'Özbekistan',
  venezuela: 'Venezuela',
  vietnam: 'Vietnam',
  wales: 'Galler',
  zambia: 'Zambiya',
  zimbabwe: 'Zimbabve',
};

function normalizeTeamName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

export function formatTeamName(name: string | undefined | null, lang: Lang): string {
  if (!name) return '';
  const key = normalizeTeamName(name);
  if (lang === 'tr') {
    const tr = TEAM_NAME_TR[key];
    if (tr) return tr;
  }
  return name;
}

export function formatGroupName(group: string | undefined, lang: Lang): string {
  if (!group) return '';
  const letter = group.replace(/^group\s+/i, '');
  return lang === 'tr' ? `${letter} Grubu` : `Group ${letter}`;
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
