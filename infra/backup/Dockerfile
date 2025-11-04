FROM alpine:3.19

RUN apk add --no-cache bash tzdata

COPY backup.sh /usr/local/bin/backup.sh
COPY entrypoint.sh /entrypoint.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /usr/local/bin/backup.sh /entrypoint.sh

ENV BACKUP_RETENTION=7 \
    BACKUP_TIME="0 2 * * *"

ENTRYPOINT ["/entrypoint.sh"]

