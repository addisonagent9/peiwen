#!/bin/bash
#
# backup-db.sh — Safe, live-capable SQLite backup for data.db
#
# Uses SQLite's online backup API (the .backup command) which is:
#   • Safe to run while the server is reading/writing the DB (no lock-out)
#   • Produces a consistent snapshot (transactional, not a raw file copy)
#   • ~instant for small DBs (data.db is likely < 10 MB)
#
# ── Usage ───────────────────────────────────────────────────────────────────
#   ./scripts/backup-db.sh                 # backup with auto-rotation
#   ./scripts/backup-db.sh pre-migration   # tagged backup, never rotated
#
# ── Cron suggestion (daily at 3am) ──────────────────────────────────────────
#   0 3 * * * cd /var/www/pw.truesolartime.com && ./scripts/backup-db.sh
#
# ── Restore ─────────────────────────────────────────────────────────────────
#   systemctl stop poetry-checker
#   cp server/backups/poetry-db-TIMESTAMP.sqlite server/data.db
#   systemctl start poetry-checker
#
# Exit codes:
#   0 — success
#   1 — source DB missing
#   2 — backup command failed

set -euo pipefail

# --- Configurable paths (override with env vars if your layout differs) ----
DB_PATH="${DB_PATH:-server/data.db}"
BACKUP_DIR="${BACKUP_DIR:-server/backups}"
TAG="${1:-auto}"
KEEP_AUTO=14    # how many automatic (daily) backups to retain

# --- Preflight ------------------------------------------------------------
if [ ! -f "$DB_PATH" ]; then
  echo "ERROR: source DB not found at $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_FILE="$BACKUP_DIR/poetry-db-${TIMESTAMP}-${TAG}.sqlite"

# --- Take the backup (SQLite online backup API) --------------------------
# sqlite3's .backup command is transactional and non-blocking. It works
# even while another connection has the DB open for writes.
echo "Backing up $DB_PATH → $BACKUP_FILE"
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# Verify the backup is a valid SQLite file
if ! sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" >/dev/null 2>&1; then
  echo "ERROR: backup file failed integrity check" >&2
  rm -f "$BACKUP_FILE"
  exit 2
fi

SIZE_BYTES=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
SIZE_KB=$((SIZE_BYTES / 1024))
echo "OK  ${SIZE_KB} KB  ${BACKUP_FILE}"

# --- Rotate old AUTO backups (tagged backups are never rotated) ----------
if [ "$TAG" = "auto" ]; then
  # List auto backups sorted oldest-first, delete all but the newest $KEEP_AUTO
  cd "$BACKUP_DIR"
  auto_backups=$(ls -1t poetry-db-*-auto.sqlite 2>/dev/null || true)
  if [ -n "$auto_backups" ]; then
    count=$(echo "$auto_backups" | wc -l)
    if [ "$count" -gt "$KEEP_AUTO" ]; then
      to_delete=$(echo "$auto_backups" | tail -n +$((KEEP_AUTO + 1)))
      while IFS= read -r f; do
        [ -z "$f" ] && continue
        echo "Rotating out: $f"
        rm -f "$f"
      done <<< "$to_delete"
    fi
  fi
fi

echo "Done."
