# Database Cleanup Safety Rules — READ BEFORE ANY BULK UPDATE/DELETE

## Rule 1: Never touch real Supabase Storage URLs
Any URL matching the pattern `https://<project-ref>.supabase.co/storage/v1/object/public/%`
is a REAL, vendor-uploaded file. NEVER include these in any WHERE clause that leads to
a DELETE, UPDATE ... = NULL, or UPDATE ... = '{}' operation, even accidentally via a
broad OR condition.

## Rule 2: Filter arrays element-by-element, never null the whole column
If a text[] array column (like screenshots) needs cleanup, NEVER do:
  UPDATE agents SET screenshots = '{}' WHERE screenshots::text LIKE '%bad-pattern%'
This nulls the ENTIRE array even if only one of several entries is bad.
ALWAYS filter the array in application code first, keeping valid entries:
  const cleaned = agent.screenshots.filter(url => !url.includes('bad-pattern'));
  UPDATE agents SET screenshots = cleaned WHERE id = agent.id  -- per row, precise

## Rule 3: Preview before any destructive operation
Always run the exact SELECT with the same WHERE clause first. Show:
- Total row count that WILL be affected
- Full sample list of affected rows (id, name, and the specific field being changed)
- Explicitly ask "Should I proceed with this UPDATE/DELETE affecting N rows? (Y/N)"
Never run the actual UPDATE/DELETE in the same step as the preview.

## Rule 4: Never introduce a new external image API without approval
Do not add any new third-party image/avatar generation service (Dicebear, mshots,
ui-avatars, gravatar, robohash, or similar) anywhere in the codebase or database
without explicit approval first. All broken/missing image fallbacks must use the
local pure-CSS colored-initials component already established in this codebase.

## Rule 5: Log every bulk data operation
Any script that modifies more than 5 rows must write a log of exactly which row IDs
were changed and what the before/after values were, saved to a timestamped file in
this repo, so changes are always traceable and auditable after the fact.
