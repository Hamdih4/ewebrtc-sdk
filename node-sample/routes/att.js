/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150, unparam: true*/
/*global require, module, get */

'use strict';

/**
 *---------------------------------------------------------
 * routes/att.js
 *---------------------------------------------------------
 * Implements Routes for Administration functions.
 *
 * Needed only if you are planning to let AT&T Mobile
 * Subscribers to use your App.
 *
 * Following routes are available:
 *
 * GET /config
 * GET /authorize
 * GET /callback
 * POST /tokens
 * POST /e911ids
 *
 * Ultimately, Express app exposes these routes as:
 *
 * GET <your_app_url>/config
 * GET <your_app_url>/authorize
 * GET <your_app_url>/callback
 * POST <your_app_url>/tokens
 * POST <your_app_url>/e911ids
 *
 * CAUTION:
 * Ensure that <your_app_url>/callback exactly
 * matches what you configured in the Dev Portal when
 * while you were creating app with WEBRTCMOBILE scope.
 *
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var dhs = require('att-dhs'),
  redirect_uri;

function getConfig(req, res) {
  try {
    var env_config = dhs.getConfiguration();

    console.log('Env configuration:', env_config);

    res.json(env_config);

  } catch (error) {
    console.log('Error:', error.message);

    res.json(400, {
      error: error.message
    });
  }
}

/**
 * When browser client asks for AT&T subscriber's
 * authorization (aka user consent), simply redirect
 * to AT&T OAuth API for authorization
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

function getAuthorizationURL(req, res) {
  console.log('Got authorize request');

  var authorize_url;

  redirect_uri = req.query.redirect_uri;

  if (!redirect_uri) {
    console.log('No redirect URL');

    res.json(400, {
      message: 'No redirect URI provided. Authorize requires a redirect URI'
    });
    return;
  }

  try {
    authorize_url = dhs.getAuthorizeUrl();

    console.log('Redirecting to:', authorize_url);

    res.redirect(authorize_url);

  } catch (error) {
    console.log('Error: ', error.message);

    res.json(400, {
      error: error.message
    });
  }

}

/**
 * IMPORTANT:
 * Fully-qualified URL for this route should match
 * what you have configured in the Developer Portal
 * when you created an App with WEBRTCMOBILE scope.
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */
function getCallback(req, res) {
  console.log('Got callback request');

  var auth_code = req.query.code;

  console.log('Authorization code:', auth_code);

  if (auth_code) {
    console.log('Redirecting uri:', redirect_uri);

    if (redirect_uri) {
      console.log('Redirecting to:', redirect_uri);

      //redirect to the URI relative to the root
      res.redirect(redirect_uri + '?code=' + auth_code);
      return;
    }

    res.json(400, { message: 'No redirect URI. Unable to redirect' });
    return;
  }

  res.json(400, { message: 'Unable to retrieve authorization code' });
}

function postToken(req, res) {
  console.log('Got token request');

  var app_scope = req.body.app_scope,
    auth_code = req.body.auth_code;

  console.log('App scope:', req.body.app_scope);
  console.log('Auth code:', req.body.auth_code);

  console.log('Creating access token');

  try {
    dhs.createAccessToken({
      app_scope: app_scope,
      auth_code: auth_code,
      success: function (response) {
        console.log('Success in creating access token:', response);

        res.json(200, response);
      },
      error: function (error) {
        console.log('Error in creating access token:', error);

        res.json(400, error);
      }
    });
  } catch (error) {
    console.log('Error: ', error.message);

    res.json(400, {
      error: error.message
    });
  }
}

function postE911Id(req, res) {
  console.log('Got e911id request');

  var token = req.body.token,
    address = req.body.address,
    is_confirmed = req.body.is_confirmed;

  console.log('Token:', req.body.token);
  console.log('Address:', req.body.address);
  console.log('Is Address Confirmed:', req.body.is_confirmed);

  console.log('Creating e911 id');

  try {
    dhs.createE911Id({
      token: token,
      address: address,
      is_confirmed: is_confirmed,
      success: function (response) {
        console.log('Success in creating e911 id: ', response);

        res.json(200, response);
      },
      error: function (error) {
        console.log('Error in creating e911 id: ', error);

        res.json(400, error);
      }
    });
  } catch (error) {
    console.log('Error: ', error.message);

    res.json(400, {
      error: error.message
    });
  }
}

// Configure the server with environment configuration
// before it can be used
function initialize(env_config, app) {
  dhs.configure(env_config);

  app.get('/config', getConfig);
  app.get('/oauth/authorize', getAuthorizationURL);
  app.get('/oauth/callback', getCallback);
  app.post('/tokens', postToken);
  app.post('/e911ids', postE911Id);
}

module.exports = {
  initialize: initialize
};

//-----------------------------------------------------------
// END: routes/att.js
//-----------------------------------------------------------

