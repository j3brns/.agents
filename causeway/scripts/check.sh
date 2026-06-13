#!/usr/bin/env bash
# Causeway repo consistency check. Exit 0 = consistent. Run from anywhere.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2
fail=0
note(){ echo "FAIL: $*"; fail=1; }

# 1. ADR count: files vs index rows vs AGENTS count
adr_files=$(ls docs/adr/[0-9]*.md 2>/dev/null | wc -l | tr -d ' ')
adr_rows=$(grep -c '^| \[00' docs/adr/README.md)
adr_agents=$(grep -oE '[0-9]+ immutable ADRs' AGENTS.md | grep -oE '^[0-9]+')
[ "$adr_files" = "$adr_rows" ] || note "ADR files ($adr_files) != index rows ($adr_rows)"
[ "$adr_files" = "$adr_agents" ] || note "ADR files ($adr_files) != AGENTS count ($adr_agents)"

# 2. every ADR file is linked in the index
for f in docs/adr/[0-9]*.md; do
  b=$(basename "$f")
  grep -q "$b" docs/adr/README.md || note "ADR not indexed: $b"
done

# 3. version consistency across SPEC / README / AGENTS
spec_ver=$(grep -oE 'Spec v[0-9]+\.[0-9]+' docs/SPEC.md | head -1 | grep -oE 'v[0-9]+\.[0-9]+')
grep -q "current: $spec_ver" AGENTS.md || note "AGENTS version != SPEC ($spec_ver)"
grep -q "Specification, $spec_ver" README.md || note "README status version != SPEC ($spec_ver)"

# 4. decision-log contiguity: D1..Dmax all present in §0
python3 - "$spec_ver" <<'PY'
import re,sys
s=open("docs/SPEC.md").read()
# only the decision-log table region (lines starting "| D")
nums=sorted({int(m) for m in re.findall(r'^\| D(\d+) \|', s, re.M)})
if nums:
    missing=[n for n in range(1, max(nums)+1) if n not in nums]
    if missing: print("FAIL: decision-log gaps:", missing); sys.exit(0)
PY


# 5. every epic in SPEC has a Definition-of-Done row
if [ -f docs/DEFINITION-OF-DONE.md ]; then
  for e in $(grep -oE '\bE[0-9]+\b' docs/SPEC.md | sort -u); do
    grep -q "\b$e\b" docs/DEFINITION-OF-DONE.md || note "epic $e has no Definition-of-Done row"
  done
else note "docs/DEFINITION-OF-DONE.md missing"; fi

[ $fail -eq 0 ] && echo "OK: $adr_files ADRs, spec $spec_ver, index+versions+decisions consistent"
exit $fail
