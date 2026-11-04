#!/bin/sh
# Adds the Hakutaku usage note to the session, unless the member's own instructions already carry it
# (the note the Hakutaku server hands out is saved between the hakutaku:start/end markers).
for file in "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md" "./CLAUDE.md" "./AGENTS.md"; do
	if [ -f "$file" ] && grep -q "hakutaku:start" "$file"; then exit 0; fi
done
cat "${CLAUDE_PLUGIN_ROOT}/hooks/session-note.md"
