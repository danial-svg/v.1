/*
# Add staged hand storage for Hokm dealing

1. Purpose
   - Preserves the complete shuffled deal while only the Hakim's first five
     cards are visible and while the shuffler confirms the partner's first five.

2. Modified Tables
   - `rooms`
     - Add `staged_hands` (jsonb, nullable): the full four-player deal held
       privately in the room state until partner exchange is complete.

3. Security
   - The existing rooms RLS policies remain unchanged because the room is a
     shared no-auth game state table.

4. Notes
   - No data is deleted or renamed. Existing rooms remain valid with NULL until
     the next shuffle flow populates the field.
*/

ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS staged_hands jsonb;
