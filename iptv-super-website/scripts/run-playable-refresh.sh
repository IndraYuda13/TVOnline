#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$(cd "$APP_DIR/.." && pwd)"
RUN_DIR="$PROJECT_DIR/run"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/playable-refresh.log"
LOCK_FILE="$RUN_DIR/playable-refresh.lock"
LAST_SUCCESS_FILE="$RUN_DIR/playable-refresh.last-success"
LAST_STATUS_FILE="$RUN_DIR/playable-refresh.last-status"

mkdir -p "$RUN_DIR" "$LOG_DIR"
exec 9>"$LOCK_FILE"

if ! flock -n 9; then
  printf '[%s] skipped playable refresh because another run is still active\n' "$(date -Is)" >> "$LOG_FILE"
  exit 0
fi

CONCURRENCY="${PLAYABLE_CONCURRENCY:-50}"
TIMEOUT_MS="${PLAYABLE_TIMEOUT_MS:-2500}"
STREAMS_PER_CHANNEL="${PLAYABLE_STREAMS_PER_CHANNEL:-5}"

{
  printf '[%s] playable refresh started (concurrency=%s timeout_ms=%s streams_per_channel=%s)\n' \
    "$(date -Is)" "$CONCURRENCY" "$TIMEOUT_MS" "$STREAMS_PER_CHANNEL"

  if (
    cd "$APP_DIR"
    PLAYABLE_CONCURRENCY="$CONCURRENCY" \
    PLAYABLE_TIMEOUT_MS="$TIMEOUT_MS" \
    PLAYABLE_STREAMS_PER_CHANNEL="$STREAMS_PER_CHANNEL" \
    npm run refresh:playable
  ); then
    date -Is > "$LAST_SUCCESS_FILE"
    printf 'success %s\n' "$(date -Is)" > "$LAST_STATUS_FILE"
    printf '[%s] playable refresh finished successfully\n' "$(date -Is)"
  else
    printf 'failed %s\n' "$(date -Is)" > "$LAST_STATUS_FILE"
    printf '[%s] playable refresh failed\n' "$(date -Is)"
    exit 1
  fi
} >> "$LOG_FILE" 2>&1
