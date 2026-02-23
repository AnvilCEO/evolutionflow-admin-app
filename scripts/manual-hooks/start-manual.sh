#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INDEX_FILE="$ROOT_DIR/docs/00-manual/INDEX.md"
STATE_DIR="$ROOT_DIR/docs/.manual-automation"
CHAPTER_STATE_FILE="$STATE_DIR/active-chapters.txt"
INSTRUCTION_STATE_FILE="$STATE_DIR/last-instruction.txt"
STARTED_AT_STATE_FILE="$STATE_DIR/last-started-at.txt"

if [[ ! -f "$INDEX_FILE" ]]; then
  echo "Missing manual index: $INDEX_FILE"
  exit 1
fi

if [[ $# -eq 0 ]]; then
  echo "Usage: yarn manual:start \"<instruction text>\""
  exit 1
fi

instruction="$*"
instruction_lc="$(printf "%s" "$instruction" | tr '[:upper:]' '[:lower:]')"

declare -a selected_chapters=()
declare -a matched_keywords=()
declare -a matched_keywords_lc=()

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

while IFS= read -r line; do
  if ! printf "%s\n" "$line" | grep -qE '^\|[[:space:]]*`'; then
    continue
  fi

  keywords_col="$(printf "%s\n" "$line" | awk -F'|' '{print $2}')"
  chapter_col="$(printf "%s\n" "$line" | awk -F'|' '{print $3}')"
  chapter_path="$(printf "%s" "$chapter_col" | sed -E 's/[`[:space:]]//g')"

  if [[ -z "$chapter_path" ]]; then
    continue
  fi

  chapter_matched=0
  while IFS= read -r raw_keyword; do
    keyword="$(printf "%s" "$raw_keyword" | sed -E 's/[`[:space:]]//g')"
    if [[ -z "$keyword" ]]; then
      continue
    fi

    keyword_lc="$(printf "%s" "$keyword" | tr '[:upper:]' '[:lower:]')"
    if [[ "$instruction_lc" == *"$keyword_lc"* ]]; then
      chapter_matched=1
      if ! array_contains "$keyword_lc" "${matched_keywords_lc[@]-}"; then
        matched_keywords_lc+=("$keyword_lc")
        matched_keywords+=("$keyword")
      fi
    fi
  done < <(printf "%s\n" "$keywords_col" | tr ',' '\n')

  if [[ "$chapter_matched" -eq 1 ]]; then
    if ! array_contains "$chapter_path" "${selected_chapters[@]-}"; then
      selected_chapters+=("$chapter_path")
    fi
  fi
done < "$INDEX_FILE"

if [[ "${#selected_chapters[@]}" -eq 0 ]]; then
  selected_chapters=("docs/00-manual/frontend.md")
  matched_keywords=("none")
fi

frontend_selected=0
figma_url_found=0
node_id_found=0

if array_contains "docs/00-manual/frontend.md" "${selected_chapters[@]-}"; then
  frontend_selected=1
fi

if printf "%s" "$instruction" | grep -qiE 'https?://(www\.)?figma\.com/'; then
  figma_url_found=1
fi

if printf "%s" "$instruction" | grep -qiE 'node-id=|[0-9]{2,}:[0-9]{2,}'; then
  node_id_found=1
fi

mkdir -p "$STATE_DIR"
printf "%s\n" "${selected_chapters[@]}" > "$CHAPTER_STATE_FILE"
printf "%s\n" "$instruction" > "$INSTRUCTION_STATE_FILE"
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$STARTED_AT_STATE_FILE"

echo "== Manual Automation: Start =="
echo "Instruction: $instruction"
echo "Matched keywords: $(IFS=', '; echo "${matched_keywords[*]}")"
echo "Loaded chapters:"
for chapter in "${selected_chapters[@]}"; do
  echo "- $chapter"
done

if [[ "$frontend_selected" -eq 1 ]]; then
  echo
  echo "== Frontend Figma Gate =="
  if [[ "$figma_url_found" -eq 1 ]]; then
    echo "- Figma URL: found"
  else
    echo "- Figma URL: missing"
  fi

  if [[ "$node_id_found" -eq 1 ]]; then
    echo "- node-id/frame id: found"
  else
    echo "- node-id/frame id: missing"
  fi

  if [[ "$figma_url_found" -eq 0 || "$node_id_found" -eq 0 ]]; then
    echo "Action required before coding:"
    echo "1. Ask for exact Figma URL and node-id/frame id."
    echo "2. Ask for target breakpoint scope (PC/Tablet/Mobile)."
    echo "3. Ask for feedback criteria and interaction details."
  fi
fi

echo
for chapter in "${selected_chapters[@]}"; do
  chapter_file="$ROOT_DIR/$chapter"
  if [[ -f "$chapter_file" ]]; then
    echo "--- $(basename "$chapter") ---"
    sed -n '1,140p' "$chapter_file"
    echo
  else
    echo "--- Missing chapter file: $chapter ---"
    echo
  fi
done

echo "Saved context:"
echo "- $CHAPTER_STATE_FILE"
echo "- $INSTRUCTION_STATE_FILE"
echo "- $STARTED_AT_STATE_FILE"
