FROM node:22-alpine AS node-runtime
FROM clamav/clamav:stable

USER root
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
RUN mkdir -p /app /run/clamav \
  && chown -R clamav:clamav /run/clamav /var/lib/clamav

WORKDIR /app
COPY package.json server.mjs entrypoint.sh ./
RUN chmod 0555 /app/entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--", "/app/entrypoint.sh"]
