/*
# Create chat_messages table for Hokm game live chat

1. Purpose
   - Stores real-time chat messages exchanged by players in the Hokm game room.
   - No-auth (single-tenant, shared) app: frontend uses anon key. Policies allow
     anon + authenticated to read/write all rows (chat is intentionally shared).

2. New Tables
   - `chat_messages`
     - `id` (uuid, primary key)
     - `room_id` (text, not null) — game room identifier
     - `player_name` (text, not null) — sender display name
     - `player_seat` (int, 0-3) — sender seat
     - `text` (text, not null) — message body
     - `created_at` (timestamptz, default now())

3. Indexes
   - `chat_messages_room_created_idx` on (room_id, created_at)

4. Security
   - RLS enabled. Four CRUD policies scoped to anon, authenticated (shared data).
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  player_name text NOT NULL,
  player_seat int NOT NULL CHECK (player_seat >= 0 AND player_seat <= 3),
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_room_created_idx
  ON chat_messages (room_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);
