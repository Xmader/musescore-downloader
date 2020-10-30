
API_URL=https://addons.mozilla.org/api/v4/addons/addon/$EXT_ID/versions/

# wait for maximum 15 min
for i in {1..15}
do 
  url=$(\
    wget -q $API_URL -O - | \
    jq -r ".results[] | select(.version==\"$VERSION\") | .files[0].url" \
  )

  if [ -n "$url" ]; then
    echo "v$VERSION available!"
    wget -nv $url -P ${OUT_DIR:-./}
    exit
  else
    echo "v$VERSION unavailable"
  fi

  sleep 1m
done
