/*
# Create rooms table for multiplayer Hokm game state

1. Purpose
   - Stores the shared game state for each Hokm room so up to 4 players can
     join and play together in real time. Each row is one room identified by
     its room number. Players poll this row to sync state (seats, phase,
     hands, tricks, etc.).
   - No-auth (single-tenant, shared) app: frontend uses anon key. Policies
     allow anon + authenticated to read/write all rows.

2. New Tables
   - `rooms`
     - `room_number` (text, primary key) — the room identifier players enter
     - `phase` (text, not null) — current game phase:
       'waiting' | 'shuffle' | 'hokm' | 'partner_deal' | 'playing' | 'trickEnd' | 'gameOver'
     - `seats` (jsonb) — array of 4 seat objects: {name, connected}
     - `host_seat` (int) — which seat is the host (0-3)
     - `hakim_seat` (int) — which seat is the Hakim this deal
     - `shuffler_seat` (int) — which seat shuffles this deal
     - `hokm_type` (text) — declared Hokm type: 'spades'|'hearts'|'diamonds'|'clubs'|'saras'|'naras'|'tek_naras'
     - `hands` (jsonb) — array of 4 arrays of card objects per seat
     - `current_trick` (jsonb) — array of {seat, card} plays in current trick
     - `lead_suit` (text, nullable) — suit led in current trick
     - `leader_seat` (int) — who leads the current/next trick
     - `current_seat` (int) — whose turn it is
     - `team1_tricks` (int) — tricks won by team 1 (seats 0 & 2)
     - `team2_tricks` (int) — tricks won by team 2 (seats 1 & 3)
     - `team1_games` (int) — games won by team 1
     - `team2_games` (int) — games won by team 2
     - `trick_count` (int) — tricks completed this deal
     - `last_trick_winner` (int, nullable)
     - `partner_hands` (jsonb, nullable) — partner's 5-card hand during partner_deal phase
     - `updated_at` (timestamptz, default now())

3. Indexes
   - Primary key on room_number (automatic)

4. Security
   - RLS enabled. Four CRUD policies scoped to anon, authenticated (shared data).
   - This is a no-auth app; all rooms are intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS rooms (
  room_number text PRIMARY KEY,
  phase text NOT NULL DEFAULT 'waiting',
  seats jsonb NOT NULL DEFAULT '[
    {"name": null, "connected": false},
    {"name": null, "connected": false},
    {"name": null, "connected": false},
    {"name": null, "connected": false}
  ]'::jsonb,
  host_seat int NOT NULL DEFAULT 0,
  hakim_seat int NOT NULL DEFAULT 0,
  shuffler_seat int NOT NULL DEFAULT 0,
  hokm_type text,
  hands jsonb NOT NULL DEFAULT '[[],[],[],[]]'::jsonb,
  current_trick jsonb NOT NULL DEFAULT '[]'::jsonb,
  lead_suit text,
  leader_seat int NOT NULL DEFAULT 0,
  current_seat int NOT NULL DEFAULT 0,
  team1_tricks int NOT NULL DEFAULT 0,
  team2_tricks int NOT NULL DEFAULT 0,
  team1_games int NOT NULL DEFAULT 0,
  team2_games int NOT NULL DEFAULT 0,
  trick_count int NOT NULL DEFAULT 0,
  last_trick_winner int,
  partner_hands jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_rooms" ON rooms;
CREATE POLICY "anon_select_rooms" ON rooms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rooms" ON rooms;
CREATE POLICY "anon_insert_rooms" ON rooms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rooms" ON rooms;
CREATE POLICY "anon_update_rooms" ON rooms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rooms" ON rooms;
CREATE POLICY "anon_delete_rooms" ON rooms FOR DELETE
  TO anon, authenticated USING (true);
