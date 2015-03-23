# JavaScript SDK for AT&T Enhanced WebRTC API

# SDK Contents

* `/js/ewebrtc-sdk.min.js`: JavaScript client library for the AT&T Enhanced WebRTC API
* `/node-sample/`: Node.js Sample application
* `/node-sample/lib`: Node.js Developer Hosted Server (DHS) Library
* `/node-sample/public/tutorial/index.html`: AT&T Enhanced WebRTC JavaScript SDK tutorial
* `/node-sample/public/api-docs/index.html`: JS SDK API reference documentation

# Using the Sample Application

The following section is an overview for setting up the AT&T Enhanced WebRTC sample application. The sample app can be used as a reference and starting point for your own applications.

For full instructions on deploying this SDK and sample app, see the [Enhanced WebRTC JavaScript SDK page](http://developer.att.com/sdks-plugins/enhanced-webrtc) on the AT&T Developer Program Web site.

## Summary

* Enroll in the [AT&T Developer Program](http://developer.att.com/)
  * Set up your org domain, CORS domains
  * Create your app
      * Use app scopes that you want (WEBRTCMOBILE and/or WEBRTC)
      * Setup your virtual numbers if you want
      * Choose a oAuth callback URL for MOBILE NUMBER user consent
      * This will provide you an app key and secret.
* Configure the Node.js sample app package.json with you app_key, app_secret, ewebrtc_domain (org domain),
  virtual_numbers_pool, oauth_callback
* Install the Node.js sample app dependencies by running `$ npm install` in the `node-sample` directory.
* Install the Node.js DHS library dependencies by running `$ npm install` in the `node-sample/lib` directory.
* Start the sample application web server: Run `$ npm start` from the `node-sample` directory
* Launch a browser to run the sample application: `https://localhost:9001/`
  * When initially loading the sample app you will see the error: `NET::ERR_CERT_AUTHORITY_INVALID`
  	* Workaround: Add a security exception by clicking `Advanced` and then click on `Proceed to localhost (unsafe)`

## System Requirements

* [Node.js](http://nodejs.org/download/)
* Google Chrome version 40.x or later, Mozilla Firefox version 33.1 (tested).
* Node.js (quick-start deployment), available from [Nodejs.org](http://nodejs.org/download/)
* Ruby, Java or PHP (production environment). For more information on a production deployment see [Enhanced WebRTC JavaScript SDK page](http://developer.att.com/sdks-plugins/enhanced-webrtc).  

# Further reading

* AT&T Enhanced WebRTC JavaScript SDK configuration, deployment and samples: http://developer.att.com/sdks-plugins/enhanced-webrtc
* DHS Library ReadMe: [`/node-sample/lib/README.md`](/node-sample/lib/README.md)
* DHS Library Release Notes: [`/node-sample/RELEASE.md`](/node-sample/lib/RELEASE.md)
* Sample App ReadMe: [`/node-sample/README.md`](/node-sample/README.md)
* Sample App Release Notes: [`/node-sample/RELEASE.md`](/node-sample/RELEASE.md)
