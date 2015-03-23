# Sample Web App for AT&T Enhanced WebRTC JavaScript SDK

This sample app is a Node.js Web application for demonstrating the features of AT&T Enhanced WebRTC, and includes the following functionality:

* OAuth endpoint for Mobile Number authorization and callback
* App configuration (app key, app secret, redirect_uri, etc.)
* Login and logout functionality for Virtual Number and Account ID users


## System requirements

* Chrome v40 - Windows, OS X
* Firefox v33 - Windows, OS X

## Contents of this Package

This package contains the software necessary to run the sample app:

- `/package.json` - Configuration options
- `/app.js` - Main Node.js program

## Configuring the Sample Server

Sample app configuration options are located in the file `/package.json`:

The following configuration options are located in `/package.json`:

### Sample Server-Specific Configuration

```javascript
"http_port": 9000,
"https_port": 9001,
"cert_file": "sample.cert",
"key_file": "sample.key",
"logs_dir": "logs",
"cors_domains": [
  "your.test.com:9001",
  "*.prod.com:9001",
  "*.sandbox.myapp.com:9001",
  "0.0.0.0:9001",
  "localhost:9001",
  "127.0.0.1:9001"
]

```

### WebRTC-API Specific Configuration

```javascript
"sandbox": {
  "api_endpoint": "https://api.att.com",
  "app_key": "YourAppKey",
  "app_secret": "YourAppSecret",
  "oauth_callback": "https://127.0.0.1:20021/oauth/callback",
  "virtual_numbers_pool": ["number1", "number2" ],
  "ewebrtc_domain": "your.ewebrtc_domain.com"
}
```

## Running the Server

**Note:** the sample app requires an Internet connection that is not restricted. If you’re using a VPN, you must enable media streaming for the applicable ports.

### Installing Node.js dependencies

```bash
$ npm install
```

### Using the NPM `start` script

```bash
$ npm start
```

**Note**: The `start` script uses the sandbox environment by default. To start the server for other environments:

  * `sandbox` - Use this environment for your testing.

  ```bash
  $ node app.js sandbox
  ```

  * `prod` - Use this environment when you are ready for production deployment.

  ```bash
  $ node app.js prod
  ```

## Loading the Sample App

1. Open a Chrome browser window or new tab.
2. Enter the URL for the sample app in your browser. If you're running the sample app on the local computer, use the URL https://127.0.0.1:9001 to load the application.

//TODO : Check for all the restful methods and update the documentation

# RESTful API Information

## Login
```
POST /login
```
### Parameters

```Javascript
{
  "user_id": "user_id",
}
```

### Response

``` javascript
{
  "user_id": "user_id",
  "user_name": "user_name",
  "user_type": "user_type",
  "role_type": "role_type"
}
```

## Logout
```
DELETE /logout
```

### Parameters
None

### Response

``` javascript
{
  message: 'User logged out successfully'
}
```

## Authorize

Endpoint for authorizing Mobile Number users using AT&T OAuth.


```
GET /oauth/authorize
```

### Parameters
None

### Response
`HTTP 302`


## Authorize Callback

Endpoint for the OAuth Authorize callback.

```
GET /oauth/callback
```

### Parameters

* `code=auth_code`

### Response

`HTTP 302`
