import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { predictionsApi } from '../services/predictions';
import { Spinner } from '../components/ui/Spinner';
import { Icon } from '../components/ui/Icon';
import { useT, useLanguageStore } from '../store/language';
import { Prediction } from '../types';
import { formatTeamName } from '../lib/matchDisplay';

function PredictionRow({ pred, dateLocale }: { pred: Prediction; dateLocale: Locale }) {
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const homeTeam = formatTeamName(pred.home_team, lang);
  const awayTeam = formatTeamName(pred.away_team, lang);
  const isFinished = pred.status === 'finished';
  const isPending = pred.status === 'scheduled' || pred.status === 'live';

  const pointsColor =
    !isFinished ? 'text-[#999390]' :
    pred.points_awarded === 3 ? 'text-[#92400E]' :
    pred.points_awarded >= 1 ? 'text-[#166534]' : 'text-[#999390]';

  const statusLabel =
    !isFinished ? t('predictions.status.pending') :
    pred.points_awarded >= 1 ? t('predictions.status.won') : t('predictions.status.lost');

  const statusCls =
    !isFinished ? 'bg-[#F7F4EF] text-[#666666] border border-[#D9D4CC]' :
    pred.points_awarded >= 1 ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]' :
    'bg-[#FEF2F2] text-[#C1121F] border border-[#FECACA]';

  return (
    <Link
      to={`/matches/${pred.match_id}`}
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 border-b border-[#F2EFE9] transition-colors hover:bg-[#F7F4EF]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-[#111111] truncate">{homeTeam}</span>
          <span className="text-[#D9D4CC] text-xs shrink-0">vs</span>
          <span className="text-sm font-semibold text-[#111111] truncate">{awayTeam}</span>
        </div>
        {pred.kickoff_time && (
          <p className="text-[11px] text-[#999390]">
            {format(new Date(pred.kickoff_time), 'dd MMM · HH:mm', { locale: dateLocale })}
          </p>
        )}
      </div>

      <div className="text-center shrink-0">
        <p className="text-[10px] text-[#999390] uppercase tracking-wider mb-0.5">{t('predictions.yourPick')}</p>
        <span className="font-display text-xl text-[#111111]">
          {pred.predicted_home_score} – {pred.predicted_away_score}
        </span>
      </div>

      {isFinished && pred.home_score !== undefined && pred.away_score !== undefined && (
        <div className="text-center shrink-0">
          <p className="text-[10px] text-[#999390] uppercase tracking-wider mb-0.5">{t('predictions.result')}</p>
          <span className="font-display text-xl text-[#666666]">
            {pred.home_score} – {pred.away_score}
          </span>
        </div>
      )}

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusCls}`}>
          {statusLabel}
        </span>
        {isFinished && (
          <span className={`font-display text-lg leading-none ${pointsColor}`}>
            +{pred.points_awarded} {t('predictions.points')}
          </span>
        )}
        {isPending && (
          <Icon name="arrow-right" size={14} className="text-[#D9D4CC]" />
        )}
      </div>
    </Link>
  );
}

export default function PredictionsPage() {
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);
  const dateLocale = lang === 'tr' ? trLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ['predictions', 'all'],
    queryFn: () => predictionsApi.getMine(),
  });

  const predictions = data?.data.predictions ?? [];
  const upcoming = predictions.filter((p) => p.status === 'scheduled');
  const live = predictions.filter((p) => p.status === 'live');
  const finished = predictions.filter((p) => p.status === 'finished');

  const totalPoints = finished.reduce((sum, p) => sum + (p.points_awarded || 0), 0);
  const exactScores = finished.filter((p) => p.points_awarded === 3).length;
  const correctOutcomes = finished.filter((p) => (p.points_awarded || 0) >= 1).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[11px] font-bold text-[#999390] uppercase tracking-[0.28em] mb-1 font-heading">
          {t('predictions.eyebrow')}
        </p>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#111111]">{t('predictions.title')}</h1>
        <p className="text-[#666666] text-sm mt-1">{t('predictions.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : predictions.length === 0 ? (
        <div className="bg-white border border-[#D9D4CC] rounded-lg flex flex-col items-center gap-5 py-16 text-center">
          <div className="size-14 rounded-lg bg-[#F2EFE9] border border-[#E8E4DE] flex items-center justify-center text-[#999390]">
            <Icon name="target" size={26} />
          </div>
          <p className="font-heading font-black text-[#111111]">{t('predictions.empty')}</p>
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-white bg-[#8B1E1E] hover:bg-[#6F1717] border border-[#8B1E1E] transition-colors duration-150"
          >
            {t('predictions.goPredict')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('stats.totalPoints'), value: totalPoints, color: 'text-[#8B1E1E]' },
              { label: t('stats.exactScores'), value: exactScores, color: 'text-[#92400E]' },
              { label: t('stats.correctOutcomes'), value: correctOutcomes, color: 'text-[#166534]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-[#D9D4CC] rounded-lg p-4 text-center">
                <span className={`font-display text-4xl leading-none block ${color}`}>{value}</span>
                <p className="text-[10px] text-[#999390] uppercase tracking-widest mt-1.5 font-heading">{label}</p>
              </div>
            ))}
          </div>

          {live.length > 0 && (
            <div className="bg-white border border-[#FECACA] rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 flex items-center gap-2 border-b border-[#E8E4DE]">
                <span className="live-dot" />
                <h2 className="text-sm font-bold text-[#111111] font-heading">{t('matches.live')}</h2>
                <span className="text-xs text-[#999390] ml-auto">{live.length} {t('predictions.section.matches')}</span>
              </div>
              {live.map((p) => <PredictionRow key={p.id} pred={p} dateLocale={dateLocale} />)}
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#E8E4DE]">
                <h2 className="text-sm font-bold text-[#111111] font-heading">{t('matches.upcoming')}</h2>
                <span className="text-xs text-[#999390]">{upcoming.length} {t('predictions.section.predictions')}</span>
              </div>
              {upcoming.map((p) => <PredictionRow key={p.id} pred={p} dateLocale={dateLocale} />)}
            </div>
          )}

          {finished.length > 0 && (
            <div className="bg-white border border-[#D9D4CC] rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#E8E4DE]">
                <h2 className="text-sm font-bold text-[#111111] font-heading">{t('matches.finished')}</h2>
                <span className="text-xs text-[#999390]">{finished.length} {t('predictions.section.predictions')}</span>
              </div>
              {finished.map((p) => <PredictionRow key={p.id} pred={p} dateLocale={dateLocale} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
