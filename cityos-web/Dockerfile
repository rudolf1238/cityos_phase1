FROM node:14-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/city-os-abnormal/package.json ./packages/city-os-abnormal/
COPY packages/city-os-common/package.json ./packages/city-os-common/
COPY packages/city-os-web/package.json ./packages/city-os-web/
COPY packages/city-os-dashboard/package.json ./packages/city-os-dashboard/
COPY packages/city-os-events/package.json ./packages/city-os-events/
COPY packages/city-os-map/package.json ./packages/city-os-map/
COPY packages/city-os-indoor/package.json ./packages/city-os-indoor/
COPY packages/city-os-surveillance/package.json ./packages/city-os-surveillance/
COPY packages/city-os-automation/package.json ./packages/city-os-automation/
COPY packages/city-os-sample/package.json ./packages/city-os-sample/
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn install --frozen-lockfile

COPY . .

RUN source '.env'; \
    if [ -z "${NEXT_PUBLIC_FEAT_ABNORMAL}" ]; then rm -rf ./packages/city-os-abnormal/ ./packages/city-os-web/src/pages/abnormal/ ./packages/city-os-web/src/pages/info.ts; fi; \
    if [ -z "${NEXT_PUBLIC_FEAT_DASHBOARD}" ]; then rm -rf ./packages/city-os-dashboard/ ./packages/city-os-web/src/pages/dashboard.ts; fi; \
    if [ -z "${NEXT_PUBLIC_FEAT_EVENTS}" ]; then rm -rf ./packages/city-os-events/ ./packages/city-os-web/src/pages/events.ts; fi; \
    if [ -z "${NEXT_PUBLIC_FEAT_MAP}" ]; then rm -rf ./packages/city-os-map/ ./packages/city-os-web/src/pages/map.ts; fi; \
    if [ -z "${NEXT_PUBLIC_FEAT_INDOOR}" ]; then rm -rf ./packages/city-os-indoor/ ./packages/city-os-web/src/pages/indoor/; fi; \
    if [ -z "${NODE_ENV}" ]; then rm -rf ./packages/city-os-sample/ ./packages/city-os-web/src/pages/sample/; fi; \
    if [ -z "${NEXT_PUBLIC_FEAT_SURVEILLANCE}" ]; then rm -rf ./packages/city-os-surveillance/ ./packages/city-os-web/src/pages/surveillance.ts; fi; \
    if [ -z "${NEXT_PUBLIC_FEAT_AUTOMATION}" ]; then rm -rf ./packages/city-os-automation/ ./packages/city-os-web/src/pages/audit-log.ts ./packages/city-os-web/src/pages/rule-management.ts ./packages/city-os-web/src/pages/subscription-settings.ts; fi

ARG APP_VER
RUN echo -e "{\n  \"version\": \"${APP_VER}\"\n}" > ./packages/city-os-web/public/version.json
RUN yarn run build
RUN yarn install --frozen-lockfile --production

FROM node:14-alpine
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/city-os-common/package.json ./packages/city-os-common/
COPY --from=builder --chown=nextjs:nodejs /app/packages/city-os-web/node_modules ./packages/city-os-web/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/city-os-web/package.json /app/packages/city-os-web/next.config.js ./packages/city-os-web/
COPY --from=builder --chown=nextjs:nodejs /app/packages/city-os-web/public ./packages/city-os-web/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/city-os-web/.next ./packages/city-os-web/.next

USER nextjs

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["yarn", "start"]
