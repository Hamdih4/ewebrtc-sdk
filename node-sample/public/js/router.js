/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ajaxRequest, loadDefaultView
*/

'use strict';

var myDHS = 'https://localhost',
  virtual_numbers,
  ewebrtc_domain;

function loadConfiguration(callback) {
  ajaxRequest({
    url: myDHS + '/config',
    success: function (response) {
      var config = response.getJson();

      virtual_numbers = config.virtual_numbers_pool;
      ewebrtc_domain = config.ewebrtc_domain;

      callback();
    }
  });
}

// ### Create Access Token
function createAccessToken(appScope, authCode, success, error) {
  ajaxRequest({
    url: myDHS + '/tokens',
    method: 'POST',
    data: {
      app_scope: appScope,
      auth_code: authCode
    },
    success: success,
    error: error
  });
}

// ### Create e911 id
function createE911Id(accessToken, address, is_confirmed, success, error) {
  ajaxRequest({
    url: myDHS + '/e911ids',
    method: 'POST',
    data: {
      token: accessToken,
      address: address,
      is_confirmed: is_confirmed // On successful E911 Id creation
    },
    success: success,
    error: error
  });
}

// ### Create redirect_uri
function mobileNumberLogin() {
  // Attempt to authorize your mobile to make Enhanced WebRTC calls
  window.location.href = myDHS + '/oauth/authorize?redirect_uri=' + window.location.href + 'consent.html';
}
