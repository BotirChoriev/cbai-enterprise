FROM node:22-alpine

RUN apk add --no-cache clamav clamav-daemon tini \
  && mkdir -p /app /run/clamav /var/lib/clamav \
  && chown -R clamav:clamav /run/clamav /var/lib/clamav

WORKDIR /app
COPY package.json server.mjs entrypoint.sh ./
RUN chmod 0555 /app/entrypoint.sh \
  && freshclam --no-warnings || true

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]
