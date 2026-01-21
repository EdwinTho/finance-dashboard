#!/bin/bash
set -e

MAX_ITERATIONS=${1:-5}
cd ~/Documents/finance-dashboard

if [ -z "$ZAI_API_KEY" ]; then
  echo "Error: ZAI_API_KEY not set"
  exit 1
fi

echo "🤖 Ralph GLM - Finance Dashboard Builder"
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
  
  PROMPT="You are a coding assistant. Implement this user story for a finance dashboard:

$STORY

Files: $(ls *.html *.css *.js 2>/dev/null || echo "none yet")

Respond with ONLY executable bash commands. Example:
\`\`\`bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>...</html>
EOF
\`\`\`"

  PAYLOAD=$(jq -n --arg content "$PROMPT" '{model: "glm-4.7", messages: [{role: "user", content: $content}]}')
  
  echo "⏳ Calling GLM (may take up to 2 minutes)..."
  
  RESPONSE=$(curl -s --max-time 120 https://api.z.ai/api/coding/paas/v4/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ZAI_API_KEY" \
    -d "$PAYLOAD")
  
  OUTPUT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
  
  if [ -z "$OUTPUT" ]; then
    echo "❌ Timeout or error"
    echo "$RESPONSE" | jq .
    exit 1
  fi
  
  echo ""
  echo "📝 GLM says:"
  echo "---"
  echo "$OUTPUT"
  echo "---"
  echo ""
  
  # Extract and save commands
  echo "$OUTPUT" | sed -n '/```bash/,/```/p' | sed '1d;$d' > /tmp/ralph_cmd_$i.sh
  
  if [ -s /tmp/ralph_cmd_$i.sh ]; then
    echo "💾 Commands saved to /tmp/ralph_cmd_$i.sh"
    echo "Review and run manually, or press Enter to execute..."
    read -r
    
    bash /tmp/ralph_cmd_$i.sh || echo "⚠️ Some commands failed"
  fi
  
  echo ""
done

echo "Reached max iterations"
