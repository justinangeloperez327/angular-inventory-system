# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.15.0

FROM node:${NODE_VERSION}-alpine AS build

ARG APP_COMMIT_SHA=development
ARG APP_BUILD_ID=local

ENV APP_COMMIT_SHA=${APP_COMMIT_SHA}
ENV APP_BUILD_ID=${APP_BUILD_ID}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build:production

FROM nginx:alpine AS runtime

ENV API_UPSTREAM=http://host.docker.internal:3000

COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist/angular-inventory-system/browser /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
