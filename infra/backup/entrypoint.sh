#!/bin/sh
set -eu

if [ -n "${BACKUP_TIME:-}" ]; then
  echo "${BACKUP_TIME} /usr/local/bin/backup.sh" > /etc/crontabs/root
fi

echo "[backup] service starting with schedule ${BACKUP_TIME:-manual}"

exec crond -f -l 8

