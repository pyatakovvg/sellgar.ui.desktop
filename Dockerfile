# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS builder

WORKDIR /app/code

RUN corepack enable

COPY code/ ./

RUN yarn install --immutable
RUN yarn build:desktop_ui

FROM node:24-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS runtime

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=8080

WORKDIR /app/clients/desktop

COPY --from=builder --chown=node:node /app/code/clients/desktop/.next/standalone/ /app/
COPY --from=builder --chown=node:node /app/code/clients/desktop/.next/static/ ./.next/static/
COPY --from=builder --chown=node:node /app/code/clients/desktop/public/ ./public/

USER node

EXPOSE 8080

CMD ["node", "--env-file=.env", "server.js"]
