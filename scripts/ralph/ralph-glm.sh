#!/bin/bash
# Ralph Wiggum - GLM Edition
# Direct API calls to Z.AI/GLM without Amp dependency

set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/../../prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
PROMPT_FILE="$SCRIPT_DIR/prompt.md"

# Check API key
if [ -z "$ZAI_API_KEY" ]; then
  echo "Error: ZAI_API_KEY not set"
  echo "Run: export ZAI_API_KEY=your_key"
  exit 1
fi

# Initialize progress file
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph GLM - Max iterations: $MAX_ITERATIONS"
echo "Using GLM model: glm-4.7"

# Function to call GLM API
call_glm() {
  local system_prompt="$1"
  local user_prompt="$2"
  
  response=$(curl -s https://api.z.ai/api/coding/paas/v4/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ZAI_API_KEY" \
    -d "{
      \"model\": \"glm-4.7\",
      \"messages\": [
        {\"role\": \"system\", \"content\": $(echo "$system_prompt" | jq -Rs .)},
        {\"role\": \"user\", \"content\": $(echo "$user_prompt" | jq -Rs .)}
      ]
    }")
  
  # Extract the content from the response
  echo "$response" | jq -r '.choices[0].message.content // empty'
}

# Main loop
for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"
  
  # Read the prompt template
  PROMPT_TEMPLATE=$(cat "$PROMPT_FILE")
  
  # Read PRD
  PRD_CONTENT=$(cat "$PRD_FILE")
  
  # Read progress
  PROGRESS_CONTENT=$(cat "$PROGRESS_FILE")
  
  # Read current directory structure
  REPO_STRUCTURE=$(find . -type f -not -path '*/\.*' -not -path '*/node_modules/*' | head -50)
  
  # Build the full prompt
  USER_PROMPT="$PROMPT_TEMPLATE

## Current PRD (prd.json):
\`\`\`json
$PRD_CONTENT
\`\`\`

## Progress Log (progress.txt):
\`\`\`
$PROGRESS_CONTENT
\`\`\`

## Repository Structure:
\`\`\`
$REPO_STRUCTURE
\`\`\`

Now execute the next task according to the Ralph Agent Instructions."

  SYSTEM_PROMPT="You are Ralph, an autonomous coding agent. Follow the instructions exactly. Work on ONE user story at a time. Always commit your changes. When all stories are complete, end with <promise>COMPLETE</promise>"
  
  echo "Calling GLM API..."
  
  # Call GLM
  OUTPUT=$(call_glm "$SYSTEM_PROMPT" "$USER_PROMPT")
  
  if [ -z "$OUTPUT" ]; then
    echo "Error: Empty response from GLM"
    exit 1
  fi
  
  echo "Response received. Processing..."
  echo "$OUTPUT"
  
  # Check for completion
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "🎉 Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi
  
  # Save iteration output
  echo "" >> "$PROGRESS_FILE"
  echo "## Iteration $i - $(date)" >> "$PROGRESS_FILE"
  echo "$OUTPUT" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
  
  echo ""
  echo "⏸️  Iteration $i complete. Review the output above."
  echo "   Press Enter to continue to next iteration, or Ctrl+C to stop..."
  read -r
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS)"
exit 1
