#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."
PRD_FILE="$PROJECT_ROOT/prd.json"

cd "$PROJECT_ROOT"

if [ -z "$ZAI_API_KEY" ]; then
  echo "Error: ZAI_API_KEY not set"
  exit 1
fi

echo "Starting Ralph GLM v2"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "=== Iteration $i ==="
  
  # Find the first incomplete story
  NEXT_STORY=$(jq -r '.userStories[] | select(.passes == false) | .id + ": " + .title' "$PRD_FILE" | head -1)
  
  if [ -z "$NEXT_STORY" ]; then
    echo "All stories complete!"
    exit 0
  fi
  
  echo "Next story: $NEXT_STORY"
  
  # Get just that story's details
  STORY_ID=$(echo "$NEXT_STORY" | cut -d: -f1)
  STORY_DETAILS=$(jq -r ".userStories[] | select(.id == \"$STORY_ID\")" "$PRD_FILE")
  
  # Build a SHORT prompt
  PROMPT="You are Ralph, a coding agent for a finance dashboard.

Implement this story:
$STORY_DETAILS

Current files: $(ls)

Respond with ONLY bash commands in a code block:
\`\`\`bash
cat > index.html << 'END'
<!DOCTYPE html>
...
END
git add .
git commit -m 'feat: $STORY_ID - done'
\`\`\`"

  PAYLOAD=$(jq -n --arg content "$PROMPT" '{model: "glm-4.7", messages: [{role: "user", content: $content}]}')
  
  echo "Calling GLM (this may take 30-60 seconds)..."
  
  RESPONSE=$(curl -s --max-time 90 https://api.z.ai/api/coding/paas/v4/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer $ZAI_API_KEY" -d "$PAYLOAD")
  
  OUTPUT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
  
  if [ -z "$OUTPUT" ]; then
    echo "API Error or timeout:"
    echo "$RESPONSE" | jq .
    exit 1
  fi
  
  echo ""
  echo "GLM Response:"
  echo "---"
  echo "$OUTPUT"
  echo "---"
  
  echo ""
  echo "Press Enter to continue..."
  read -r
done
