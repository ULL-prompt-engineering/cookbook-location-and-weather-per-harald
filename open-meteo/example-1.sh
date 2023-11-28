#!/bin/bash
ULLCOORDS=$(source ipapi/example-1.sh)
LATITUDE=$(echo $ULLCOORDS | jq '.latitude')
LONGITUDE=$(echo $ULLCOORDS | jq '.longitude') 
EOM
curl -s -G "https://api.open-meteo.com/v1/forecast" \
  --data-urlencode "latitude=$LATITUDE" \
  --data-urlencode "longitude=$LONGITUDE"\
  --data-urlencode 'current=temperature_2m,wind_speed_10m' \
  --data-urlencode 'hourly=temperature_2m,relative_humidity_2m,wind_speed_10m' \
  | jq '.'