-- FlxioAI Vision core product schema (additive-only).

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  billing_interval TEXT,
  billing_mode TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_renews_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_boards_user ON boards(user_id);

CREATE TABLE IF NOT EXISTS board_items (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  prompt TEXT,
  model TEXT,
  preset_slug TEXT,
  media_type TEXT,
  preview_url TEXT,
  raw_url TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_board_items_board ON board_items(board_id);
CREATE INDEX IF NOT EXISTS idx_board_items_user ON board_items(user_id);

-- Recipe log: FlxioAI's own record of each submission (prompt, preset,
-- settings) so remix/history search work. fnf remains the source of truth
-- for generation state/results.
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  generation_id TEXT,
  job_set_id TEXT,
  prompt TEXT NOT NULL,
  subject TEXT,
  model TEXT NOT NULL,
  preset_slug TEXT,
  settings_json TEXT NOT NULL,
  media_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_genid ON recipes(generation_id);

CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT,
  model TEXT NOT NULL,
  preset_slug TEXT,
  media_type TEXT NOT NULL,
  preview_url TEXT,
  raw_url TEXT NOT NULL,
  thumbnail_url TEXT,
  in_gallery INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shares_gallery ON shares(in_gallery, vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_shares_user ON shares(user_id);

CREATE TABLE IF NOT EXISTS votes (
  share_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (share_id, user_id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS billing_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  kind TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL
);
