#!/bin/bash
set -e

cd ~/Documents/finance-dashboard

STORY_ID="US-008"
STORY_DETAILS=$(jq -r ".userStories[] | select(.id == \"$STORY_ID\")" prd.json)

echo "Story details length: ${#STORY_DETAILS} chars"
echo ""
echo "Story:"
echo "$STORY_DETAILS"
echo ""

PROMPT="You are Ralph. Implement this:
$STORY_DETAILS

Current files: $(ls *.html 2>/dev/null || echo "none")

Respond with bash commands to create/edit files."

echo "Prompt length: ${#PROMPT} chars"
echo ""

PAYLOAD=$(jq -n --arg content "$PROMPT" '{model: "glm-4.7", messages: [{role: "user", content: $content}]}')

echo "Payload length: ${#PAYLOAD} chars"
echo ""
echo "Calling API..."

time curl -s --max-time 30 https://api.z.ai/api/coding/paas/v4/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -d "$PAYLOAD" | jq -r '.choices[0].message.content // "TIMEOUT OR ERROR"'
