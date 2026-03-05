#!/bin/bash
# Seed the belo product specification into the backend
# Usage: ./scripts/seed-spec.sh [API_URL] [AUTH_TOKEN]

API_URL="${1:-http://localhost:3001}"
AUTH_TOKEN="${2:-$(echo -n '12344' | openssl dgst -sha256 -hmac 'gioia-docs-token' | awk '{print $2}')}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPEC_FILE="$SCRIPT_DIR/../spec.md"

if [ ! -f "$SPEC_FILE" ]; then
  echo "Error: spec.md not found at $SPEC_FILE"
  exit 1
fi

# Read the markdown and escape it for JSON
MARKDOWN=$(python3 -c "
import json, sys
with open('$SPEC_FILE') as f:
    print(json.dumps(f.read()))
")

echo "Seeding spec to $API_URL..."

curl -s -X POST "$API_URL/api/spec/seed" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"markdown\": $MARKDOWN,
    \"title\": \"belo Product Specification\",
    \"force\": true
  }" | python3 -m json.tool

echo ""
echo "Done!"
