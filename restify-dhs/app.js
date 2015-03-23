/*global require*/

// This file implements a standalone restify.js
// server that exposes the methods on the DHS
// module as REST endpoints. It is intended to
// demonstrate the implementation scenario where
// DHS functionality and app functionality are
// kept in two separate servers.

'use strict';

var dhs = require('att-dhs'),
    fs = require('fs'),
    restify = require('restify'),

    certificate,
    privateKey,
    server;

// Your app's credentials (assigned on the AT&T developer portal) should be inserted here,
// in place of the dummy strings "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".
dhs.configure({
    app_key:    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    app_secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    virtual_numbers_pool: ["7135701322", "7135701323"],
    ewebrtc_domain: "cotoblue.com",
    app_token_url: "https://localhost:9001/token",
    app_e911id_url: "https://localhost:9001/e911id"
});

/*jslint stupid: true*/
certificate = fs.readFileSync('sample.cert', 'utf8');
privateKey = fs.readFileSync('sample.key', 'utf8');
/*jslint stupid: false*/

server = restify.createServer({
    certificate: certificate,
    key: privateKey,
    name: 'DHS',
    version: '1.0.0'
});

// Don't make us manually parse the POST request parameters from the message body - do it for us.
server.use(restify.bodyParser());

// ## Redirect to AT&T so the user can authorize your app
// Navigating to this endpoint will redirect you to the AT&T authorization page.
//
// Use this when you need to obtain a user consent auth token. Note that when the user
// finishes authorizing the app, they will be redirected back to your application. This
// final redirection will go to the page you registered on the developer site as your
// app's OAuth callback URL.
//
// This endpoint exposes the DHS module method dhs.getAuthorizeUrl.

/*jslint unparam: false*/
server.get('/auth', function auth(req, res, next) {
    /*jslint unparam: true*/
    res.header('Location', dhs.getAuthorizeUrl());
    res.send(302);
    return next();
});

// ## Get the URL of the AT&T auth page
// Calling this endpoint will return the URL of the AT&T authorization page, without
// actually navigating to that page.
//
// Contrast this with the /auth endpoint above, which immediately redirects to that
// page. Use this endpoint when you need more control over the authorization
// navigation; for example, if you want to open the auth page in an iframe, or add
// a querystring parameter.
//
// This endpoint exposes the DHS module method dhs.getAuthorizeUrl.

/*jslint unparam: false*/
server.get('/authurl', function authurl(req, res, next) {
    /*jslint unparam: true*/
    res.contentType = "text/plain"; // needed so the platform doesn't add superfluous quotation marks around the URL in the response body
    res.send(dhs.getAuthorizeUrl());
    return next();
});

// ## Get the Enhanced WebRTC configuration
// This endpoint exposes the DHS module method dhs.getConfiguration.

/*jslint unparam: false*/
server.get('/config', function config(req, res, next) {
    /*jslint unparam: true*/
    res.json(dhs.getConfiguration());
    return next();
});

// ## Create an E911 ID
// Some Enhanced WebRTC operations require an E911 ID, which represents
// a physical address. This endpoint takes the physical address and
// generates an associated E911 ID.
//
// This endpoint exposes the DHS module method dhs.createE911Id.
//
// * _token_   An access token valid for the E911 scope.
// * _address_ A JSON object representing the physical address to associate with the returned E911 id. Please refer to the documentation for the createE911Id method in the DHS module for details of the required JSON format.

server.post('e911id', function e911id(req, res, next) {

    var options = {
        token: req.params.token,
        address: req.params.address,
        is_confirmed: 'false',
        success: function success(result) {
            res.json(result);
            return next();
        },
        error: function error(err) {
            res.send(err);
            return next(err);
        }
    };

    return dhs.createE911Id(options);
});

// ## Request an access token
// This endpoint exposes DHS module method dhs.createAccessToken.
//
// * _scope_ The service for which we are requesting an access token ('E911' or 'MOBILE_NUMBER', for example).
// * _code_  A user consent authorization code; use only for scopes that require one ('MOBILE_NUMBER', for example).

server.post('/token', function token(req, res, next) {

    var options = {
        app_scope: req.params.scope,
        success: function success(result) {
            res.json(result);
            return next();
        },
        error: function error(err) {
            res.send(err);
            return next(err);
        }
    };

    if (req.params.code) {
        options.auth_code = req.params.code;
    }

    return dhs.createAccessToken(options);
});

server.listen(9001);
