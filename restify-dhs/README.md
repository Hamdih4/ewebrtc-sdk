# Sample Restify DHS for AT&T Enhanced WebRTC JavaScript SDK

This server is a standalone Developer Hosted Server (DHS) using Node.js® for demonstrating the features of AT&T Enhanced WebRTC. This folder does not include the Enhanced WebRTC Sample Apps.

For information on running the AT&T Enhanced WebRTC Sample Apps, see the [Enhanced WebRTC JavaScript SDK page](http://developer.att.com/sdks-plugins/enhanced-webrtc) on the AT&T Developer Program Web site.

The Restify DHS utilizes the Restify Node.js REST framework. 

## System requirements

* Windows, OS X

## Contents of this Package

This package contains the software necessary to run the sample app:

- `/package.json` - Configuration options
- `/app.js` - Main Node.js program

## Configuring the DHS Server

### Sample DHS-Specific Configuration

The following configuration options are located in `/package.json`:

```javascript
"http_port": 9001
```

### WebRTC-API Specific Configuration

The following configuration options are located in `/app.js`:

```javascript
{
    app_key:    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    app_secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    virtual_numbers_pool: ["number 1", "number 1"],
    ewebrtc_domain: "your-ewebrtc_domain.com",
    app_token_url: "https://your-app-url/tokens",
    app_e911id_url: "https://your-app-url/e911ids"
}
```

## Running the Server

**Note:** the DHS sample app requires an Internet connection that is not restricted.

### Installing Node.js dependencies

```bash
$ npm install
```

### Using the NPM `start` script

```bash
$ npm start
```

## Running the Sample DHS

1. Run the Sample DHS form a command line: `$ npm start`.
2. Run a CURL command provided in the `demo-script.cmd` file.


# RESTful API Information

## Get configuration
```
GET /config
```
### Parameters
None

### Response

``` javascript
{
  "api_endpoint":"ewebrtc-api-endpoint",
  "authorize_uri":"ewebrtc-authorize-uri",
  "info":
  {
    "dhs_platform": "node",
    "token_uri":"ewebrtc-token-uri",
    "e911id_uri":"ewebrtc-e911id-uri",
    "ewebrtc_uri":"ewebrtc-uri",
    "scope_map":
    {
      "MOBILE_NUMBER":"WEBRTCMOBILE",
      "VIRTUAL_NUMBER":"WEBRTC",
      "ACCOUNT_ID":"WEBRTC",
      "E911":"EMERGENCYSERVICES"
    },
    "api_env": "env-name",
    "dhs_name": "att-dhs",
    "dhs_version": "x.x.x"
  },
  "app_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "oauth_callback":"https://your-app-url/oauth/callback",
  "app_token_url":"https://your-app-url/tokens",
  "app_e911id_url":"https://your-app-url/e911ids",
  "virtual_numbers_pool":
  [
    "number 1",
    "number 2"
  ],
  "ewebrtc_domain": "your-app-domain.com"
}
```

## Create Access Token
```
POST /tokens
```

### Parameters

``` javascript
{
  "app_scope": "ACCOUNT_ID",
  "auth_code": "null"
}
```

### Response

``` javascript
{
  "access_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "bearer",
  "expires_in": 172800,
  "refresh_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

## Create E911 ID

```
POST /e911ids
```

### Parameters

``` javascript
{
  "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "address":
  {
    "first_name": "Enhanced WebRTC",
    "last_name": "Tester",
    "house_number": "16221",
    "street": "NE 72ndWay",
    "unit": "",
    "city": "Redmond",
    "state": "WA",
    "zip": "98052"
  },
  "is_confirmed":"false"
}
```

### Response

``` javascript
{
    "e911Locations": {
        "addressIdentifier": "xxxx:xxxx:xxxx:xxxx",
        "status": "Validated",
        "expirationDate": "-1"
    }
}
```
