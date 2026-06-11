import cron from 'node-cron';
import { syncService } from './services/sync.service';

// FIFA World Cup 2026 — API-Football league ID
const WC_LEAGUE_ID = 1;
const WC_SEASON = 2026;

// TheSportsDB league ID for WC 2026
const SPORTSDB_LEAGUE_ID = '4429';
const SPORTSDB_SEASON = '2025-2026';

let liveRunning = false;
let dailyRunning = false;

async function syncLiveAndScore() {
  if (liveRunning) return; // skip if previous run still going
  liveRunning = true;
  try {
    if (process.env.FOOTBALL_API_KEY) {
      const live = await syncService.syncLive(WC_LEAGUE_ID);
      if (live.updated > 0 || live.errors.length > 0) {
        console.log(`[cron] live sync: ${live.updated} updated, ${live.errors.length} errors`);
      }
    }

    const sdbLive = await syncService.syncLiveFromSportsDB();
    if (sdbLive.updated > 0 || sdbLive.errors.length > 0) {
      console.log(`[cron] sportsdb live sync: ${sdbLive.updated} updated, ${sdbLive.scored} scored, ${sdbLive.errors.length} errors`);
    }

    const { scored, errors } = await syncService.scoreAllPending();
    if (scored > 0 || errors.length > 0) {
      console.log(`[cron] scoring: ${scored} matches scored, ${errors.length} errors`);
    }
  } catch (err) {
    console.error('[cron] syncLiveAndScore error:', err);
  } finally {
    liveRunning = false;
  }
}

async function dailySync() {
  if (dailyRunning) return;
  dailyRunning = true;
  console.log('[cron] daily fixture sync starting...');
  try {
    if (process.env.FOOTBALL_API_KEY) {
      const result = await syncService.syncFixtures(WC_LEAGUE_ID, WC_SEASON);
      console.log(`[cron] API-Football sync: +${result.inserted} new, ${result.updated} updated, ${result.errors.length} errors`);
    }

    const sportsdb = await syncService.syncFromSportsDB(SPORTSDB_LEAGUE_ID, SPORTSDB_SEASON);
    console.log(`[cron] TheSportsDB sync: +${sportsdb.inserted} new, ${sportsdb.updated} updated, ${sportsdb.errors.length} errors`);
  } catch (err) {
    console.error('[cron] dailySync error:', err);
  } finally {
    dailyRunning = false;
  }
}

export function startCronJobs() {
  cron.schedule('*/5 * * * *', syncLiveAndScore);
  cron.schedule('0 3 * * *', dailySync);
  console.log('[cron] jobs started: live every 5min, fixtures daily at 03:00 UTC');
}
