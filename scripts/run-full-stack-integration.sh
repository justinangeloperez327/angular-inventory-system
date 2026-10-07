#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${FULL_STACK_BACKEND_DIR:-${ROOT_DIR}/.contract-backend}"
BACKEND_COMPOSE="${BACKEND_DIR}/compose.yaml"
PROJECT_NAME="${FULL_STACK_PROJECT_NAME:-angular-inventory-integration}"
FRONTEND_IMAGE="${FULL_STACK_FRONTEND_IMAGE:-angular-inventory-system:ci}"
FRONTEND_CONTAINER="${FULL_STACK_FRONTEND_CONTAINER:-angular-inventory-system-full-stack}"
FRONTEND_PORT="${FULL_STACK_FRONTEND_PORT:-8080}"
BACKEND_PORT="${FULL_STACK_BACKEND_PORT:-3000}"
NETWORK_NAME="${PROJECT_NAME}_default"

export POSTGRES_DB="${POSTGRES_DB:-inventory}"
export POSTGRES_USER="${POSTGRES_USER:-inventory}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-inventory}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export PORT="${BACKEND_PORT}"
export API_PREFIX="${API_PREFIX:-api/v1}"
export OPENAPI_ENABLED="${OPENAPI_ENABLED:-true}"
export OPENAPI_PATH="${OPENAPI_PATH:-docs}"
export CORS_ORIGINS="${CORS_ORIGINS:-http://127.0.0.1:${FRONTEND_PORT}}"
export JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-full-stack-access-secret-0123456789-abcdefghijklmnopqrstuvwxyz}"
export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-full-stack-refresh-secret-0123456789-abcdefghijklmnopqrstuvwxyz-different}"
export JWT_ACCESS_TTL_SECONDS="${JWT_ACCESS_TTL_SECONDS:-900}"
export JWT_REFRESH_TTL_SECONDS="${JWT_REFRESH_TTL_SECONDS:-604800}"
export JWT_ISSUER="${JWT_ISSUER:-nest-js-inventory-system}"
export JWT_AUDIENCE="${JWT_AUDIENCE:-angular-inventory-system}"
export BOOTSTRAP_ADMIN_EMAIL="${FULL_STACK_ADMIN_EMAIL:-integration-admin@example.com}"
export BOOTSTRAP_ADMIN_PASSWORD="${FULL_STACK_ADMIN_PASSWORD:-Integration-Admin-Password-123!}"
export BOOTSTRAP_ADMIN_FIRST_NAME="${BOOTSTRAP_ADMIN_FIRST_NAME:-Integration}"
export BOOTSTRAP_ADMIN_LAST_NAME="${BOOTSTRAP_ADMIN_LAST_NAME:-Administrator}"

if [[ ! -f "${BACKEND_COMPOSE}" ]]; then
  echo "Pinned backend checkout is missing: ${BACKEND_COMPOSE}" >&2
  exit 1
fi

if ! docker image inspect "${FRONTEND_IMAGE}" >/dev/null 2>&1; then
  echo "Frontend image ${FRONTEND_IMAGE} is missing. Build it before running full-stack integration." >&2
  exit 1
fi

compose=(
  docker compose
  --project-name "${PROJECT_NAME}"
  --file "${BACKEND_COMPOSE}"
)

cleanup() {
  local status=$?

  if [[ "${status}" -ne 0 ]]; then
    echo "Full-stack integration failed; collecting container diagnostics." >&2
    docker logs "${FRONTEND_CONTAINER}" 2>&1 || true
    "${compose[@]}" logs --no-color 2>&1 || true
  fi

  docker rm --force "${FRONTEND_CONTAINER}" >/dev/null 2>&1 || true
  "${compose[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker rm --force "${FRONTEND_CONTAINER}" >/dev/null 2>&1 || true
"${compose[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true

echo "Starting pinned NestJS + PostgreSQL integration stack..."
"${compose[@]}" up --build --detach

backend_ready=0
for attempt in $(seq 1 90); do
  if curl --fail --silent --show-error     "http://127.0.0.1:${BACKEND_PORT}/api/v1/health/ready"     >/dev/null; then
    backend_ready=1
    break
  fi

  sleep 2
done

if [[ "${backend_ready}" -ne 1 ]]; then
  echo "Pinned NestJS backend did not become ready." >&2
  exit 1
fi

echo "Starting production Angular container against the live backend..."
docker run --detach   --name "${FRONTEND_CONTAINER}"   --network "${NETWORK_NAME}"   --publish "${FRONTEND_PORT}:8080"   --env API_UPSTREAM=http://app:3000   "${FRONTEND_IMAGE}"   >/dev/null

frontend_ready=0
for attempt in $(seq 1 45); do
  if curl --fail --silent --show-error     "http://127.0.0.1:${FRONTEND_PORT}/healthz"     >/dev/null; then
    frontend_ready=1
    break
  fi

  sleep 1
done

if [[ "${frontend_ready}" -ne 1 ]]; then
  echo "Angular production container did not become ready." >&2
  exit 1
fi

echo "Verifying the Angular Nginx proxy reaches the live NestJS readiness endpoint..."
curl --fail --silent --show-error   "http://127.0.0.1:${FRONTEND_PORT}/api/v1/health/ready"   >/dev/null

echo "Running full-stack browser integration..."
FULL_STACK_BASE_URL="http://127.0.0.1:${FRONTEND_PORT}" FULL_STACK_ADMIN_EMAIL="${BOOTSTRAP_ADMIN_EMAIL}" FULL_STACK_ADMIN_PASSWORD="${BOOTSTRAP_ADMIN_PASSWORD}" npm run e2e:full-stack

echo "Full-stack integration passed."
