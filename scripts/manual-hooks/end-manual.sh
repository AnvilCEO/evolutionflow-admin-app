#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_DIR="$ROOT_DIR/docs/.manual-automation"
CHAPTER_STATE_FILE="$STATE_DIR/active-chapters.txt"
INSTRUCTION_STATE_FILE="$STATE_DIR/last-instruction.txt"

run_checks=0
if [[ "${1:-}" == "--run-checks" ]]; then
  run_checks=1
fi

array_contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

declare -a chapters=()

if [[ -f "$CHAPTER_STATE_FILE" ]]; then
  while IFS= read -r chapter; do
    chapters+=("$chapter")
  done < "$CHAPTER_STATE_FILE"
else
  chapters=(
    "docs/00-manual/frontend.md"
    "docs/00-manual/backend.md"
    "docs/00-manual/db.md"
    "docs/00-manual/security.md"
  )
fi

echo "== Manual Automation: End Checklist =="
if [[ -f "$INSTRUCTION_STATE_FILE" ]]; then
  echo "Instruction: $(cat "$INSTRUCTION_STATE_FILE")"
fi

for chapter in "${chapters[@]}"; do
  if [[ -z "$chapter" ]]; then
    continue
  fi

  chapter_file="$ROOT_DIR/$chapter"
  if [[ ! -f "$chapter_file" ]]; then
    echo "--- Missing chapter file: $chapter ---"
    echo
    continue
  fi

  echo "--- $(basename "$chapter") ---"
  awk '
    /^## End-of-Task Auto Questions/ { in_section=1; next }
    in_section && /^## / { in_section=0 }
    in_section && /^[0-9]+\./ { print }
  ' "$chapter_file"
  echo
done

frontend_selected=0
if array_contains "docs/00-manual/frontend.md" "${chapters[@]-}"; then
  frontend_selected=1
fi

echo "--- Global Closeout Reminder ---"
echo "1. Security: secret/token/PII leak check completed?"
echo "2. Error handling: all new failure paths covered?"
echo "3. Logging: debug logs removed from production paths?"
echo "4. Testing: lint/build/manual verification completed?"

if [[ "$frontend_selected" -eq 1 ]]; then
  echo
  echo "--- Frontend Figma Closeout ---"
  echo "1. Figma MCP context and screenshot were collected from exact node-id?"
  echo "2. Required assets/logo/comments were downloaded and applied?"
  echo "3. Implementation was compared to captured Figma reference?"
  echo "4. Feedback was received and reflected before completion?"
  echo "5. Ambiguous design points were resolved through questions?"
fi

if [[ "$run_checks" -eq 1 ]]; then
  echo
  echo "== Running Quality Gate =="
  yarn lint
  yarn build
fi
