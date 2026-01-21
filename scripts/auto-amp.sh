#!/bin/bash

cd ~/Documents/finance-dashboard

INCOMPLETE=$(jq -r '.userStories[] | select(.passes == false) | .id' prd.json)

for STORY_ID in $INCOMPLETE; do
  echo "=== Working on $STORY_ID ==="
  
  STORY=$(jq -r ".userStories[] | select(.id == \"$STORY_ID\")" prd.json)
  TITLE=$(echo "$STORY" | jq -r '.title')
  DESC=$(echo "$STORY" | jq -r '.description')
  CRITERIA=$(echo "$STORY" | jq -r '.acceptanceCriteria | join("\n- ")')
  
  PROMPT="Implement $STORY_ID: $TITLE

$DESC

Acceptance Criteria:
- $CRITERIA

Modify existing index.html, styles.css, and app.js files."
  
  echo "$PROMPT"
  echo ""
  read -p "Press Enter when done in Amp..."
  
  jq "(.userStories[] | select(.id == \"$STORY_ID\") | .passes) = true" prd.json > prd_temp.json
  mv prd_temp.json prd.json
  
  echo "✓ Marked complete - $(jq '[.userStories[] | select(.passes == true)] | length' prd.json)/35"
  echo ""
done

echo "All done!"
