import { normalizeScore, type GameScore } from "./game";
import type { PlayerIdentity } from "./auth";

type LeaderboardStore = Pick<D1Database | D1DatabaseSession, "prepare">;

type ScoreAggregateRow = {
  total_points: number | string | null;
  wins: number | string | null;
  reveals: number | string | null;
  wrong_guesses: number | string | null;
  total_questions: number | string | null;
  perfect_rounds: number | string | null;
};

type ScoreRow = ScoreAggregateRow & {
  player_id: string;
  display_name: string;
  best_streak: number | string | null;
  updated_at: string;
};

type CountRow = {
  better_count: number | string | null;
};

export type LeaderboardEntry = {
  rank: number;
  playerId: string;
  displayName: string;
  totalPoints: number;
  wins: number;
  reveals: number;
  wrongGuesses: number;
  totalQuestions: number;
  bestStreak: number;
  perfectRounds: number;
  updatedAt: string;
  isCurrentPlayer: boolean;
};

export type LeaderboardSnapshot = {
  entries: LeaderboardEntry[];
  currentPlayer: LeaderboardEntry | null;
  updatedAt: string;
};

export type PersistedRoundScore =
  | {
      persisted: true;
      roundId: string;
      leaderboard: LeaderboardSnapshot;
    }
  | {
      persisted: false;
      reason: string;
      roundId?: string;
    };

export async function persistCompletedRoundScore(
  db: D1Database,
  player: PlayerIdentity,
  score: GameScore,
  limit = 10
): Promise<PersistedRoundScore> {
  const normalizedScore = normalizeScore(score);
  const round = normalizedScore.lastRound;

  if (!round?.finishedAt || round.status === "active") {
    return {
      persisted: false,
      reason: "No completed round score is ready to persist."
    };
  }

  const now = new Date().toISOString();
  const session = db.withSession("first-primary");

  await session.batch([
    session
      .prepare(
        `
        INSERT INTO players (
          player_id,
          display_name,
          identity_source,
          created_at,
          updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?4)
        ON CONFLICT(player_id) DO UPDATE SET
          display_name = excluded.display_name,
          identity_source = excluded.identity_source,
          updated_at = excluded.updated_at
      `
      )
      .bind(player.id, player.displayName, player.source, now),
    session
      .prepare(
        `
        INSERT INTO round_results (
          round_id,
          player_id,
          topic,
          outcome,
          points,
          grade,
          mistakes,
          questions,
          badges_json,
          finished_at,
          created_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        ON CONFLICT(round_id) DO UPDATE SET
          player_id = excluded.player_id,
          topic = excluded.topic,
          outcome = excluded.outcome,
          points = excluded.points,
          grade = excluded.grade,
          mistakes = excluded.mistakes,
          questions = excluded.questions,
          badges_json = excluded.badges_json,
          finished_at = excluded.finished_at
      `
      )
      .bind(
        round.roundId,
        player.id,
        round.topic,
        round.outcome,
        round.points,
        round.grade,
        round.mistakes,
        round.questions,
        JSON.stringify(round.badges),
        round.finishedAt,
        now
      )
  ]);

  const aggregate = await readScoreAggregate(session, player.id);
  const existingBestStreak = await readExistingBestStreak(session, player.id);
  const bestStreak = Math.max(existingBestStreak, normalizedScore.bestStreak);

  await session
    .prepare(
      `
      INSERT INTO player_scores (
        player_id,
        display_name,
        total_points,
        wins,
        reveals,
        wrong_guesses,
        total_questions,
        best_streak,
        perfect_rounds,
        updated_at
      )
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
      ON CONFLICT(player_id) DO UPDATE SET
        display_name = excluded.display_name,
        total_points = excluded.total_points,
        wins = excluded.wins,
        reveals = excluded.reveals,
        wrong_guesses = excluded.wrong_guesses,
        total_questions = excluded.total_questions,
        best_streak = MAX(player_scores.best_streak, excluded.best_streak),
        perfect_rounds = excluded.perfect_rounds,
        updated_at = excluded.updated_at
    `
    )
    .bind(
      player.id,
      player.displayName,
      aggregate.totalPoints,
      aggregate.wins,
      aggregate.reveals,
      aggregate.wrongGuesses,
      aggregate.totalQuestions,
      bestStreak,
      aggregate.perfectRounds,
      now
    )
    .run();

  return {
    persisted: true,
    roundId: round.roundId,
    leaderboard: await getLeaderboard(session, player.id, limit)
  };
}

export async function getLeaderboard(
  store: LeaderboardStore,
  currentPlayerId: string,
  limit = 10
): Promise<LeaderboardSnapshot> {
  const safeLimit = Math.min(50, Math.max(1, Math.trunc(limit)));
  const rows = await store
    .prepare(
      `
      SELECT
        player_id,
        display_name,
        total_points,
        wins,
        reveals,
        wrong_guesses,
        total_questions,
        best_streak,
        perfect_rounds,
        updated_at
      FROM player_scores
      ORDER BY
        total_points DESC,
        wins DESC,
        best_streak DESC,
        updated_at ASC,
        player_id ASC
      LIMIT ?1
    `
    )
    .bind(safeLimit)
    .all<ScoreRow>();

  const entries = rows.results.map((row, index) =>
    toLeaderboardEntry(row, index + 1, currentPlayerId)
  );
  const currentPlayer =
    entries.find((entry) => entry.playerId === currentPlayerId) ??
    (await getCurrentPlayerEntry(store, currentPlayerId));

  return {
    entries,
    currentPlayer,
    updatedAt: new Date().toISOString()
  };
}

async function readScoreAggregate(store: LeaderboardStore, playerId: string) {
  const row = await store
    .prepare(
      `
      SELECT
        COALESCE(SUM(points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN outcome IN ('direct-win', 'elimination-win') THEN 1 ELSE 0 END), 0) AS wins,
        COALESCE(SUM(CASE WHEN outcome = 'revealed' THEN 1 ELSE 0 END), 0) AS reveals,
        COALESCE(SUM(mistakes), 0) AS wrong_guesses,
        COALESCE(SUM(questions), 0) AS total_questions,
        COALESCE(SUM(CASE WHEN outcome IN ('direct-win', 'elimination-win') AND mistakes = 0 AND questions = 0 THEN 1 ELSE 0 END), 0) AS perfect_rounds
      FROM round_results
      WHERE player_id = ?1
    `
    )
    .bind(playerId)
    .first<ScoreAggregateRow>();

  return {
    totalPoints: toNumber(row?.total_points),
    wins: toNumber(row?.wins),
    reveals: toNumber(row?.reveals),
    wrongGuesses: toNumber(row?.wrong_guesses),
    totalQuestions: toNumber(row?.total_questions),
    perfectRounds: toNumber(row?.perfect_rounds)
  };
}

async function readExistingBestStreak(
  store: LeaderboardStore,
  playerId: string
) {
  const bestStreak = await store
    .prepare(
      `
      SELECT best_streak
      FROM player_scores
      WHERE player_id = ?1
    `
    )
    .bind(playerId)
    .first<number | string>("best_streak");

  return toNumber(bestStreak);
}

async function getCurrentPlayerEntry(
  store: LeaderboardStore,
  playerId: string
) {
  const row = await store
    .prepare(
      `
      SELECT
        player_id,
        display_name,
        total_points,
        wins,
        reveals,
        wrong_guesses,
        total_questions,
        best_streak,
        perfect_rounds,
        updated_at
      FROM player_scores
      WHERE player_id = ?1
    `
    )
    .bind(playerId)
    .first<ScoreRow>();

  if (!row) return null;

  const rank = await getPlayerRank(store, row);
  return toLeaderboardEntry(row, rank, playerId);
}

async function getPlayerRank(store: LeaderboardStore, row: ScoreRow) {
  const better = await store
    .prepare(
      `
      SELECT COUNT(*) AS better_count
      FROM player_scores
      WHERE
        total_points > ?1 OR
        (total_points = ?1 AND wins > ?2) OR
        (total_points = ?1 AND wins = ?2 AND best_streak > ?3) OR
        (total_points = ?1 AND wins = ?2 AND best_streak = ?3 AND updated_at < ?4) OR
        (
          total_points = ?1 AND
          wins = ?2 AND
          best_streak = ?3 AND
          updated_at = ?4 AND
          player_id < ?5
        )
    `
    )
    .bind(
      toNumber(row.total_points),
      toNumber(row.wins),
      toNumber(row.best_streak),
      row.updated_at,
      row.player_id
    )
    .first<CountRow>();

  return toNumber(better?.better_count) + 1;
}

function toLeaderboardEntry(
  row: ScoreRow,
  rank: number,
  currentPlayerId: string
): LeaderboardEntry {
  return {
    rank,
    playerId: row.player_id,
    displayName: row.display_name,
    totalPoints: toNumber(row.total_points),
    wins: toNumber(row.wins),
    reveals: toNumber(row.reveals),
    wrongGuesses: toNumber(row.wrong_guesses),
    totalQuestions: toNumber(row.total_questions),
    bestStreak: toNumber(row.best_streak),
    perfectRounds: toNumber(row.perfect_rounds),
    updatedAt: row.updated_at,
    isCurrentPlayer: row.player_id === currentPlayerId
  };
}

function toNumber(value: number | string | null | undefined) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
