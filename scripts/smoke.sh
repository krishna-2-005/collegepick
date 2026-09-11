#!/usr/bin/env bash
# API smoke checks: happy paths plus the edge cases from the plan (400/401/404/409).
# Usage: pnpm smoke   (the app must be running; BASE_URL defaults to http://localhost:3000)
set -u

BASE="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0
BODY="$(mktemp)"
JAR="$(mktemp)"
trap 'rm -f "$BODY" "$JAR"' EXIT

# check <name> <expected-status> <method> <path> [json-body]
check() {
  local name="$1" expected="$2" method="$3" path="$4" body="${5:-}"
  local args=(-s -o "$BODY" -w "%{http_code}" -X "$method" -b "$JAR" -c "$JAR")
  if [ -n "$body" ]; then args+=(-H "Content-Type: application/json" --data "$body"); fi
  local status
  status=$(curl "${args[@]}" "$BASE$path")
  if [ "$status" = "$expected" ]; then
    PASS=$((PASS + 1))
    printf "  ok    %s  %s\n" "$status" "$name"
  else
    FAIL=$((FAIL + 1))
    printf "  FAIL  %s (expected %s)  %s\n        %s\n" "$status" "$expected" "$name" "$(head -c 300 "$BODY")"
  fi
}

# assert <name> <js-expression over `b` (the last response body)>
assert() {
  local name="$1" expr="$2"
  if node -e "const b=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); process.exit(($expr)?0:1)" "$BODY"; then
    PASS=$((PASS + 1))
    printf "  ok    ---  %s\n" "$name"
  else
    FAIL=$((FAIL + 1))
    printf "  FAIL  ---  %s\n        %s\n" "$name" "$(head -c 300 "$BODY")"
  fi
}

# field <js-expression over `b`> -> prints the value from the last response body
field() {
  node -e "const b=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log($1)" "$BODY"
}

echo "Colleges list"
check "default list" 200 GET "/api/colleges"
assert "envelope has data, total and 12 items" "b.ok && b.data.length === 12 && b.meta.total === 200"
check "filters combined" 200 GET "/api/colleges?state=Karnataka,Tamil%20Nadu&course=BTECH&sort=fees_asc&minRating=3"
assert "every row matches state filter" "b.data.every(c => ['Karnataka','Tamil Nadu'].includes(c.state) && c.rating >= 3)"
assert "sorted by fees ascending" "b.data.every((c, i, a) => i === 0 || a[i-1].minFees <= c.minFees)"
check "bracket array params" 200 GET "/api/colleges?state%5B%5D=Kerala"
assert "bracket params filter" "b.data.length > 0 && b.data.every(c => c.state === 'Kerala')"
check "search by name" 200 GET "/api/colleges?q=kaveri"
assert "search matches" "b.data.length > 0 && b.data.every(c => /kaveri/i.test(c.name + c.city))"
check "limit above cap is clamped" 200 GET "/api/colleges?limit=500"
assert "clamped to 50" "b.data.length === 50"
check "limit=0" 400 GET "/api/colleges?limit=0"
check "limit not a number" 400 GET "/api/colleges?limit=abc"
check "unknown sort" 400 GET "/api/colleges?sort=cheapest"
check "unknown course" 400 GET "/api/colleges?course=PHD"
check "minRating out of range" 400 GET "/api/colleges?minRating=9"
check "minFees > maxFees" 400 GET "/api/colleges?minFees=500000&maxFees=100000"
assert "error has zod details" "b.ok === false && b.error.code === 'BAD_REQUEST' && b.error.details[0].path === 'minFees'"
check "malformed cursor" 400 GET "/api/colleges?cursor=not-a-cursor"

echo "Cursor pagination"
for sort in rating package fees_asc fees_desc name; do
  check "page 1 ($sort)" 200 GET "/api/colleges?sort=$sort&limit=7"
  first_ids=$(field "b.data.map(c => c.id).join(',')")
  cursor=$(field "b.meta.nextCursor")
  check "page 2 ($sort)" 200 GET "/api/colleges?sort=$sort&limit=7&cursor=$cursor"
  assert "no overlap between pages ($sort)" "b.data.length === 7 && b.data.every(c => !'$first_ids'.split(',').includes(c.id))"
done
check "walk all pages" 200 GET "/api/colleges?limit=50"
seen=$(field "b.data.length")
cursor=$(field "b.meta.nextCursor")
while [ "$cursor" != "null" ]; do
  curl -s -o "$BODY" "$BASE/api/colleges?limit=50&cursor=$cursor"
  seen=$((seen + $(field "b.data.length")))
  cursor=$(field "b.meta.nextCursor")
done
if [ "$seen" = "200" ]; then PASS=$((PASS + 1)); echo "  ok    ---  walked 200 rows, no gaps"; else FAIL=$((FAIL + 1)); echo "  FAIL  ---  walked $seen rows, expected 200"; fi

echo "College detail and reviews"
check "top college" 200 GET "/api/colleges?limit=1"
SLUG=$(field "b.data[0].slug")
check "detail by slug" 200 GET "/api/colleges/$SLUG"
assert "detail has courses, placement and distribution" "b.data.courses.length >= 3 && b.data.placement && b.data.ratingDistribution.reduce((s, n) => s + n, 0) === b.data.ratingCount"
assert "reviews show first name and initial only" "b.data.reviews.every(r => /^\\S+( [A-Z]\\.)?$/.test(r.author))"
check "unknown slug" 404 GET "/api/colleges/no-such-college"
assert "404 envelope" "b.ok === false && b.error.code === 'NOT_FOUND'"
check "malformed slug" 404 GET "/api/colleges/Bad%20Slug!"
check "reviews page" 200 GET "/api/colleges/$SLUG/reviews?limit=2"
assert "reviews newest first" "b.data.length === 2 && b.data[0].createdAt >= b.data[1].createdAt"
REVIEW_CURSOR=$(field "b.meta.nextCursor")
check "reviews page 2" 200 GET "/api/colleges/$SLUG/reviews?limit=2&cursor=$REVIEW_CURSOR"
check "reviews bad limit" 400 GET "/api/colleges/$SLUG/reviews?limit=100"
check "reviews bad cursor" 400 GET "/api/colleges/$SLUG/reviews?cursor=abc"
check "reviews unknown college" 404 GET "/api/colleges/no-such-college/reviews"

echo "Filters"
check "filter options" 200 GET "/api/filters"
assert "15 states with counts" "b.data.states.length === 15 && b.data.states.every(s => s.count > 0)"

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
