CREATE TABLE IF NOT EXISTS players (
  player_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  identity_source TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS round_results (
  round_id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (
    outcome IN ('direct-win', 'elimination-win', 'revealed')
  ),
  points INTEGER NOT NULL DEFAULT 0,
  grade TEXT NOT NULL,
  mistakes INTEGER NOT NULL DEFAULT 0,
  questions INTEGER NOT NULL DEFAULT 0,
  badges_json TEXT NOT NULL DEFAULT '[]',
  finished_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS round_results_player_finished_idx
ON round_results(player_id, finished_at DESC);

CREATE TABLE IF NOT EXISTS player_scores (
  player_id TEXT PRIMARY KEY REFERENCES players(player_id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  reveals INTEGER NOT NULL DEFAULT 0,
  wrong_guesses INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  perfect_rounds INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS player_scores_leaderboard_idx
ON player_scores(
  total_points DESC,
  wins DESC,
  best_streak DESC,
  updated_at ASC,
  player_id ASC
);
