See <https://ipapi.com/documentation> for more information.

## Script

See [/ipapi/example-1.sh](/ipapi/example-1.sh) for an example script.

## Execution of shell script example-1.sh

```bash
➜  cookbook-location-and-weather-per-harald git:(main) ✗ source ipapi/example-1.sh 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   852    0   852    0     0   3047      0 --:--:-- --:--:-- --:--:--  3143
```
```json
{
  "ip": "193.145.118.52",
  "type": "ipv4",
  "continent_code": "EU",
  "continent_name": "Europe",
  "country_code": "ES",
  "country_name": "Spain",
  "region_code": "CN",
  "region_name": "Canary Islands",
  "city": "La Laguna",
  "zip": "38200",
  "latitude": 28.476879119873047,
  "longitude": -16.318309783935547,
  "location": {
    "geoname_id": 2511401,
    "capital": "Madrid",
    "languages": [
      {
        "code": "es",
        "name": "Spanish",
        "native": "Español"
      },
      {
        "code": "eu",
        "name": "Basque",
        "native": "Euskara"
      },
      {
        "code": "ca",
        "name": "Catalan",
        "native": "Català"
      },
      {
        "code": "gl",
        "name": "Galician",
        "native": "Galego"
      },
      {
        "code": "oc",
        "name": "Occitan",
        "native": "Occitan"
      }
    ],
    "country_flag": "https://assets.ipstack.com/flags/es.svg",
    "country_flag_emoji": "🇪🇸",
    "country_flag_emoji_unicode": "U+1F1EA U+1F1F8",
    "calling_code": "34",
    "is_eu": true
  }
}
```

## Execution of example-2.mjs

See [/ipapi/example-2.mjs](/ipapi/example-2.mjs) for an example script.

```
➜  cookbook-location-and-weather-per-harald git:(main) ✗ node ipapi/example-2.mjs             
{
  ip: '193.145.118.52',
  type: 'ipv4',
  continent_code: 'EU',
  continent_name: 'Europe',
  country_code: 'ES',
  country_name: 'Spain',
  region_code: 'CN',
  region_name: 'Canary Islands',
  city: 'La Laguna',
  zip: '38200',
  latitude: 28.476879119873047,
  longitude: -16.318309783935547,
  location: {
    geoname_id: 2511401,
    capital: 'Madrid',
    languages: [
      { code: 'es', name: 'Spanish', native: 'Español' },
      { code: 'eu', name: 'Basque', native: 'Euskara' },
      { code: 'ca', name: 'Catalan', native: 'Català' },
      { code: 'gl', name: 'Galician', native: 'Galego' },
      { code: 'oc', name: 'Occitan', native: 'Occitan' }
    ],
    country_flag: 'https://assets.ipstack.com/flags/es.svg',
    country_flag_emoji: '🇪🇸',
    country_flag_emoji_unicode: 'U+1F1EA U+1F1F8',
    calling_code: '34',
    is_eu: true
  }
}
```