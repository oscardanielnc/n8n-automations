# Multi-stage: build everything with dev dependencies, ship only the API's production deps + the web build.
FROM node:24-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm --filter @panel/contracts build \
 && pnpm --filter @panel/api build \
 && pnpm --filter @panel/web exec vite build \
 && pnpm --filter @panel/api deploy --prod --legacy /out/api

FROM node:24-alpine
ENV NODE_ENV=production PORT=3110 WEB_DIST=/app/web
WORKDIR /app
COPY --from=build /out/api ./api
COPY --from=build /repo/apps/api/dist ./api/dist
COPY --from=build /repo/apps/web/dist ./web
USER node
EXPOSE 3110
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3110/api/v1/health || exit 1
CMD ["node", "api/dist/main.js"]
