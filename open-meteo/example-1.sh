ULLCOORDS=$(source ipapi/example-1.sh)
LATITUDE=$(echo $ULLCOORDS | jq '.latitude')
LONGITUDE=$(echo $ULLCOORDS | jq '.longitude') 
read -r -d '' PARAMS << EOM
latitude=$LATITUDE
&longitude=$LONGITUDE
&current=temperature_2m,wind_speed_10m
&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m
EOM
PARAMS=$(echo $PARAMS | tr -d '\n')
#echo $PARAMS
curl -s "https://api.open-meteo.com/v1/forecast?$PARAMS" | jq '.'