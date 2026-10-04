#!/bin/bash
# Bootstraps the local Entropy Data (Community Edition) instance:
# creates the user account, the organization, and an organization API key,
# and writes ENTROPY_DATA_API_KEY / ENTROPY_DATA_HOST into .env.
#
# Start the instance first: docker compose -f entropy-data-ce/docker-compose.yaml up -d
# Configuration comes from .env (see .env.example): ENTROPY_DATA_CE_EMAIL,
# ENTROPY_DATA_CE_PASSWORD, ENTROPY_DATA_CE_ORGANIZATION.
set -e
cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; . ./.env; set +a; fi
HOST="${ENTROPY_DATA_CE_HOST:-http://localhost:8081}"
EMAIL="${ENTROPY_DATA_CE_EMAIL:-workshop@example.com}"
PASSWORD="${ENTROPY_DATA_CE_PASSWORD:-workshop}"
ORGANIZATION="${ENTROPY_DATA_CE_ORGANIZATION:-workshop}"

COOKIES=$(mktemp)
PAGE=$(mktemp)
trap 'rm -f "$COOKIES" "$PAGE"' EXIT

csrf() { grep -oE 'name="_csrf" value="[^"]*"' "$PAGE" | head -1 | sed -E 's/.*value="([^"]*)"/\1/'; }

echo "Creating account $EMAIL ..."
curl -sf -c "$COOKIES" "$HOST/create-account" -o "$PAGE"
curl -sf -b "$COOKIES" -c "$COOKIES" -X POST "$HOST/create-account" \
  -d "_csrf=$(csrf)" -d "ref=" -d "fullName=Workshop" \
  --data-urlencode "email=$EMAIL" --data-urlencode "password=$PASSWORD" \
  -d "termsAccepted=v1" -d "_termsAccepted=on" -o "$PAGE"

echo "Logging in ..."
curl -sf -c "$COOKIES" "$HOST/login" -o "$PAGE"
curl -sf -b "$COOKIES" -c "$COOKIES" -X POST "$HOST/login" \
  -d "_csrf=$(csrf)" --data-urlencode "username=$EMAIL" --data-urlencode "password=$PASSWORD" -o /dev/null

if curl -sf -b "$COOKIES" -c "$COOKIES" -o /dev/null "$HOST/$ORGANIZATION"; then
  echo "Organization $ORGANIZATION already exists."
else
  echo "Creating organization $ORGANIZATION ..."
  curl -sf -b "$COOKIES" -c "$COOKIES" "$HOST/welcome" -o "$PAGE"
  curl -sf -b "$COOKIES" -c "$COOKIES" -X POST "$HOST/organizations/save" \
    -d "_csrf=$(csrf)" -d "host=$HOST" \
    --data-urlencode "fullName=$ORGANIZATION" --data-urlencode "vanityUrl=$ORGANIZATION" -o "$PAGE"
  curl -sf -b "$COOKIES" -c "$COOKIES" -o /dev/null "$HOST/$ORGANIZATION" \
    || { echo "ERROR: could not create organization '$ORGANIZATION' (vanity URL reserved or taken?)"; exit 1; }
fi

echo "Creating organization API key ..."
curl -sf -b "$COOKIES" -c "$COOKIES" "$HOST/$ORGANIZATION/settings/api-keys/add" -o "$PAGE"
CSRF=$(csrf)
curl -sf -b "$COOKIES" -c "$COOKIES" -X POST "$HOST/$ORGANIZATION/settings/api-keys/save" \
  -d "_csrf=$CSRF" -d "displayName=workshop-cli" -d "scope=organization" -o "$PAGE"
API_KEY=$(grep -oE 'ed_[A-Za-z0-9_-]{20,}' "$PAGE" | head -1)
[ -n "$API_KEY" ] || { echo "ERROR: could not extract the API key"; exit 1; }

echo "Writing ENTROPY_DATA_API_KEY and ENTROPY_DATA_HOST to .env ..."
[ -f .env ] || cp .env.example .env
{
  grep -vE '^(ENTROPY_DATA_API_KEY|ENTROPY_DATA_HOST)=' .env
  echo "ENTROPY_DATA_API_KEY=$API_KEY"
  echo "ENTROPY_DATA_HOST=$HOST"
} > .env.tmp && mv .env.tmp .env

echo
echo "Done. Log in at $HOST with $EMAIL / $PASSWORD (organization: $ORGANIZATION)"
echo "Verify the CLI connection with: entropy-data connection test"
