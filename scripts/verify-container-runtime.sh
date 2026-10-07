#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8080}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

fail() {
  printf 'Runtime verification failed: %s\n' "$1" >&2
  exit 1
}

request() {
  local path="$1"
  local name="$2"

  curl --silent --show-error     --dump-header "$TMP_DIR/$name.headers"     --output "$TMP_DIR/$name.body"     --write-out '%{http_code}'     "$BASE_URL$path"
}

header_lines() {
  local file="$1"
  local header="$2"

  awk -v wanted="$header" '
    BEGIN { IGNORECASE = 1 }
    {
      key = $1
      sub(/:$/, "", key)
      if (tolower(key) == tolower(wanted)) {
        sub(/^[^:]+:[[:space:]]*/, "")
        sub(/\r$/, "")
        print
      }
    }
  ' "$file"
}

assert_header_exact() {
  local file="$1"
  local header="$2"
  local expected="$3"
  local actual

  actual="$(header_lines "$file" "$header" | tail -n 1)"

  if [[ "$actual" != "$expected" ]]; then
    fail "$header expected '$expected' but received '${actual:-<missing>}'"
  fi
}

assert_header_contains() {
  local file="$1"
  local header="$2"
  local expected="$3"
  local actual

  actual="$(header_lines "$file" "$header" | tr '\n' ',' | sed 's/,$//')"

  if [[ "$actual" != *"$expected"* ]]; then
    fail "$header must contain '$expected' but received '${actual:-<missing>}'"
  fi
}

assert_security_headers() {
  local file="$1"

  assert_header_exact "$file" "X-Content-Type-Options" "nosniff"
  assert_header_exact "$file" "Referrer-Policy" "same-origin"
  assert_header_exact "$file" "Permissions-Policy" "camera=(), microphone=(), geolocation=()"
  assert_header_exact "$file" "Cross-Origin-Opener-Policy" "same-origin"
  assert_header_exact "$file" "X-Frame-Options" "DENY"
  assert_header_contains "$file" "Content-Security-Policy" "frame-ancestors 'none'"
  assert_header_contains "$file" "Content-Security-Policy" "trusted-types angular angular#bundler"

  local csp
  csp="$(header_lines "$file" "Content-Security-Policy" | tail -n 1)"

  if [[ "$csp" == *"require-trusted-types-for 'script'"* ]]; then
    fail "Content-Security-Policy must not enforce Trusted Types before Angular autoCSP bootstrap"
  fi

  local server
  server="$(header_lines "$file" "Server" | tail -n 1)"

  if [[ "$server" == *"/"* ]]; then
    fail "Server header must not disclose an Nginx version ('$server')"
  fi
}

for attempt in $(seq 1 20); do
  status="$(request "/healthz" "health" || true)"

  if [[ "$status" == "200" ]]; then
    break
  fi

  sleep 1
done

[[ "${status:-}" == "200" ]] || fail "/healthz did not become ready"
[[ "$(tr -d '\r\n' < "$TMP_DIR/health.body")" == "ok" ]] || fail "/healthz body must be 'ok'"
assert_security_headers "$TMP_DIR/health.headers"

index_status="$(request "/index.html" "index")"
[[ "$index_status" == "200" ]] || fail "/index.html returned HTTP $index_status"
grep -q '<app-root' "$TMP_DIR/index.body" || fail "/index.html does not contain the Angular root element"
assert_header_contains "$TMP_DIR/index.headers" "Cache-Control" "no-store"
assert_security_headers "$TMP_DIR/index.headers"

build_info_status="$(request "/build-info.json" "build-info")"
[[ "$build_info_status" == "200" ]] || fail "/build-info.json returned HTTP $build_info_status"
assert_header_contains "$TMP_DIR/build-info.headers" "Cache-Control" "no-store"
assert_security_headers "$TMP_DIR/build-info.headers"
grep -Eq '"appName"[[:space:]]*:[[:space:]]*"angular-inventory-system"' "$TMP_DIR/build-info.body" || fail "build-info.json is missing the application name"
grep -Eq '"angularVersion"[[:space:]]*:[[:space:]]*"22\.[0-9]+\.[0-9]+"' "$TMP_DIR/build-info.body" || fail "build-info.json is missing the Angular version"
grep -Eq '"commitSha"[[:space:]]*:[[:space:]]*"[0-9a-f]{7,64}"' "$TMP_DIR/build-info.body" || fail "build-info.json is missing the CI commit SHA"
grep -Eq '"buildId"[[:space:]]*:[[:space:]]*"[A-Za-z0-9._:-]+"' "$TMP_DIR/build-info.body" || fail "build-info.json is missing the CI build ID"

spa_status="$(request "/products" "spa")"
[[ "$spa_status" == "200" ]] || fail "SPA fallback /products returned HTTP $spa_status"
grep -q '<app-root' "$TMP_DIR/spa.body" || fail "SPA fallback did not serve index.html"
assert_header_contains "$TMP_DIR/spa.headers" "Cache-Control" "no-store"
assert_security_headers "$TMP_DIR/spa.headers"

asset_path="$(
  {
    grep -oE '(src|href)="[^"]+\.(js|css)"' "$TMP_DIR/index.body" || true
  } | head -n 1 | sed -E 's/^(src|href)="([^"]+)"/\2/'
)"

[[ -n "$asset_path" ]] || fail "Could not discover a generated JavaScript/CSS asset from index.html"
[[ "$asset_path" == /* ]] || asset_path="/$asset_path"

asset_status="$(request "$asset_path" "asset")"
[[ "$asset_status" == "200" ]] || fail "Generated asset $asset_path returned HTTP $asset_status"
assert_header_contains "$TMP_DIR/asset.headers" "Cache-Control" "max-age=31536000"
assert_header_contains "$TMP_DIR/asset.headers" "Cache-Control" "immutable"
assert_security_headers "$TMP_DIR/asset.headers"

api_status="$(request "/api/v1/__runtime-verification__" "api")"
[[ "$api_status" != "200" ]] || fail "/api/v1/ request was incorrectly served by the Angular SPA"
grep -q '<app-root' "$TMP_DIR/api.body" && fail "/api/v1/ request must never fall back to index.html"
assert_security_headers "$TMP_DIR/api.headers"

printf 'Runtime verification passed: health, build identity, security headers, SPA fallback, API separation, and asset caching are correct.\n'
