# Example of using ipapi.co API
# dns-sd -q www.ull.es
ULL=193.145.118.52
GOOGLE=142.250.200.68
GOBCAN=93.188.136.86
curl  "http://api.ipapi.com/api/${ULL}?access_key=$IPAPI_KEY" | jq '.'
