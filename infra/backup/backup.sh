#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TARGET_DIR=${BACKUP_TARGET_DIR:-/var/backups/app}
RETENTION=${BACKUP_RETENTION:-7}
ARCHIVE="${TARGET_DIR}/homeportal-${TIMESTAMP}.tar.gz"

mkdir -p "${TARGET_DIR}"

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

if [ -d /source/db ]; then
  cp -a /source/db "${TMP_DIR}/db"
fi

if [ -d /source/uploads ]; then
  cp -a /source/uploads "${TMP_DIR}/uploads"
fi

tar -czf "${ARCHIVE}" -C "${TMP_DIR}" .
echo "[backup] created ${ARCHIVE}"

ls -1t "${TARGET_DIR}"/homeportal-*.tar.gz | tail -n +$((RETENTION + 1)) | xargs -r rm --

