import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enUS, tr as trLocale } from 'date-fns/locale';
import { predictionsApi } from '../services/predictions';
import { Spinner } from '../components/ui/Spinner';
import { Icon } from '../components/ui/Icon';
import { useT } from '../store/language';
import { useLanguageStore } from '../store/language';
import { Prediction } from '../types';

function PredictionRow({ pred, dateLocale }: { pred: Prediction; dateLocale: Locale }) {
  const t = useT();
  const isFinished = pred.status === 'finished';
  const isPending = pred.status === 'scheduled' || pred.status === 'live';

  const pointsColor =
    !isFinished ? 'text-slate-500' :
    pred.points_awarded === 3 ? 'text-amber-400' :
    pred.points_awarded >= 1 ? 'text-green-400' : 'text-slate-600';

  const statusLabel =
    !isFinished ? t('predictions.status.pending') :
    pred.points_awarded >= 1 ? t('predictions.status.won') : t('predictions.status.lost');

  const statusColor =
    !isFinished ? 'bg-slate-700/50 text-slate-400' :
    pred.points_awarded >= 1 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
    'bg-red-500/10 text-red-400 border border-red-500/20';

  return (
    <Link
      to={`/matches/${pred.match_id}`}
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Teams */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-white truncate">{pred.home_team}</span>
          <span className="text-slate-600 text-xs shrink-0">vs</span>
          <span className="text-sm font-semibold text-white truncate">{pred.away_team}</span>
        </div>
        {pred.kickoff_time && (
          <p className="text-[11px] text-slate-600">
            {format(new Date(pred.kickoff_time), 'dd MMM · HH:mm', { locale: dateLocale })}
          </p>
        )}
      </div>

      {/* Your pick */}
      <div className="text-center shrink-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">{t('predictions.yourPick')}</p>
        <span className="font-score text-xl text-white">
          {pred.predicted_home_score} – {pred.predicted_away_score}
        </span>
      </div>

      {/* Result (if finished) */}
      {isFinished && pred.home_score !== undefined && pred.away_score !== undefined && (
        <div className="text-center shrink-0">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">{t('predictions.result')}</p>
          <span className="font-score text-xl text-slate-300">
            {pred.home_score} – {pred.away_score}
          </span>
        </div>
      )}

      {/* Points / Status */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColor}`}>
          {statusLabel}
        </span>
        {isFinished && (
          <span className={`font-score text-lg leading-none ${pointsColor}`}>
            +{pred.points_awarded} {t('predictions.points')}
          </span>
        )}
        {isPending && (
          <Icon name="chevron-right" size={14} className="text-slate-700" />
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

      {/* Header */}
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 font-heading">
          {t('predictions.eyebrow')}
        </p>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white">{t('predictions.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('predictions.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : predictions.length === 0 ? (
        <div
          className="rounded-[24px] flex flex-col items-center gap-5 py-16 text-center"
          style={{ background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-slate-500"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Icon name="target" size={28} />
          </div>
          <div>
            <p className="font-heading font-bold text-white mb-1">{t('predictions.empty')}</p>
          </div>
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-glow"
            style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16a34a 100%)' }}
          >
            {t('predictions.goPredict')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Toplam Puan', value: totalPoints, color: 'text-green-400' },
              { label: 'Skor Tutturma', value: exactScores, color: 'text-amber-400' },
              { label: 'Doğru Sonuç', value: correctOutcomes, color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-[20px] p-4 text-center"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className={`font-score text-4xl leading-none block ${color}`}>{value}</span>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1.5 font-heading">{label}</p>
              </div>
            ))}
          </div>

          {/* Live predictions */}
          {live.length > 0 && (
            <div
              className="rounded-[24px] overflow-hidden"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="size-2 rounded-full bg-red-500 live-indicator" />
                <h2 className="text-sm font-bold text-white font-heading">Canlı</h2>
                <span className="text-xs text-slate-500 ml-auto">{live.length} maç</span>
              </div>
              <div>
                {live.map((p) => <PredictionRow key={p.id} pred={p} dateLocale={dateLocale} />)}
              </div>
            </div>
          )}

          {/* Upcoming predictions */}
          {upcoming.length > 0 && (
            <div
              className="rounded-[24px] overflow-hidden"
              style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-sm font-bold text-white font-heading">Yaklaşan</h2>
                <span className="text-xs text-slate-500">{upcoming.length} tahmin</span>
              </div>
              <div>
                {upcoming.map((p) => <PredictionRow key={p.id} pred={p} dateLocale={dateLocale} />)}
              </div>
            </div>
          )}

          {/* Finished predictions */}
          {finished.length > 0 && (
            <div
              className="rounded-[24px] overflow-hidden"
              style={{ background: 'rgba(12,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-sm font-bold text-white font-heading">Biten Maçlar</h2>
                <span className="text-xs text-slate-500">{finished.length} tahmin</span>
              </div>
              <div>
                {finished.map((p) => <PredictionRow key={p.id} pred={p} dateLocale={dateLocale} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
