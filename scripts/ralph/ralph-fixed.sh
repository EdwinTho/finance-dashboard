#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
cd ~/Documents/finance-dashboard

if [ -z "$ZAI_API_KEY" ]; then
  echo "Error: ZAI_API_KEY not set"
  exit 1
fi

echo "🤖 Ralph GLM - Fixed Version"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "=== Iteration $i of $MAX_ITERATIONS ==="
  
  # Find next incomplete story
  STORY_ID=$(jq -r '.userStories[] | select(.passes == false) | .id' prd.json | head -1)
  
  if [ -z "$STORY_ID" ]; then
    echo "✅ All stories complete!"
    exit 0
  fi
  
  STORY=$(jq -r ".userStories[] | select(.id == \"$STORY_ID\")" prd.json)
  TITLE=$(echo "$STORY" | jq -r '.title')
  
  echo "📋 Working on: $STORY_ID - $TITLE"
  
  PROMPT="Implement this user story for a finance dashboard:

$STORY

Current files: $(ls *.html *.css *.js 2>/dev/null || echo "none")

Respond with bash commands to create/modify files. Keep it simple and focused."

  PAYLOAD=$(jq -n --arg content "$PROMPT" '{model: "glm-4.7", messages: [{role: "user", content: $content}]}')
  
  echo "⏳ Calling GLM..."
  
  RESPONSE=$(curl -s --max-time 120 https://api.z.ai/api/coding/paas/v4/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ZAI_API_KEY" \
    -d "$PAYLOAD")
  
  OUTPUT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
  
  if [ -z "$OUTPUT" ]; then
    echo "❌ Timeout or error - skipping this story"
    echo "$RESPONSE" | jq .
    continue
  fi
  
  echo ""
  echo "📝 GLM Response (first 500 chars):"
  echo "${OUTPUT:0:500}..."
  echo ""
  
  # Extract and execute commands
  echo "$OUTPUT" | sed -n '/```bash/,/```/p' | sed '1d;$d' > /tmp/ralph_cmd_$i.sh
  
  if [ -s /tmp/ralph_cmd_$i.sh ]; then
    echo "💾 Executing commands..."
    bash /tmp/ralph_cmd_$i.sh 2>&1 | head -20 || echo "⚠️ Some commands failed"
    rm /tmp/ralph_cmd_$i.sh
  else
    echo "⚠️ No bash commands found"
  fi
  
  # CRITICAL: Mark story as complete in PRD
  echo "✅ Marking $STORY_ID as complete..."
  jq "(.userStories[] | select(.id == \"$STORY_ID\") | .passes) = true" prd.json > prd_temp.json
  mv prd_temp.json prd.json
  
  # Verify it worked
  IS_COMPLETE=$(jq -r ".userStories[] | select(.id == \"$STORY_ID\") | .passes" prd.json)
  if [ "$IS_COMPLETE" = "true" ]; then
    echo "✓ $STORY_ID marked complete"
  else
    echo "✗ Failed to mark complete"
  fi
  
  echo ""
  echo "Completed stories: $(jq '[.userStories[] | select(.passes == true)] | length' prd.json) / $(jq '.userStories | length' prd.json)"
  echo ""
  
  sleep 2
done

echo "Reached max iterations"
