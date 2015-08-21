/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ATT, RESTClient, console, log, loadConfiguration, phone, eWebRTCDomain, currentConferenceHost,
 sessionData, defaultHeaders, onError, getCallerInfo, Dialpad, dialer,
 loginMobileNumber, createAccessToken, associateAccessToken, createE911Id, ewebrtc_domain,
 loginEnhancedWebRTC, hideParticipants, showParticipants, acceptModification, rejectModification*/

'use strict';

var buttons,
  defaultHeaders,
  autoRejectTimer,
  muted = false,
  currentCallType = null,
  autoRejectWaitingTime = 10000;

defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

function setCaretPosition(elemId, caretPos) {
  var elem,
    range;

  elem = document.getElementById(elemId);

  if (elem !== null) {
    if (elem.createTextRange) {
      range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      if (elem.selectionStart) {
        elem.focus();
        elem.setSelectionRange(caretPos, caretPos);
      } else {
        elem.focus();
      }
    }
  }
}

// all the ajax request passes via this method it sets Callbacks and other parameters
// it takes args as a parameter it contains end url details
/**
 * @param args
 * ajax Call for sample app
 */
function ajaxRequest(args) {
  var rc = new ATT.RESTClient({
    method: args.method || 'GET',
    url: args.url,
    data: args.data,
    headers: args.headers || defaultHeaders,
    success: args.success,
    error: args.error || onError
  });
  rc.ajax();
}

function clearSessionData() {
  if (!sessionData) {
    return;
  }
  var key;
  for (key in sessionData) {
    if (sessionData.hasOwnProperty(key)) {
      sessionData[key] = null;
    }
  }
}

function clearError() {
  var errMsgDiv = document.getElementById("errormessage");
  if (!errMsgDiv) {
    return;
  }
  errMsgDiv.innerHTML = "";
}

function clearMessage() {
  var messageDiv = document.getElementById('message');

  if (!messageDiv) {
    return;
  }
  messageDiv.innerHTML = "";
}

function setError(errText) {
  var errMsgDiv = document.getElementById("errormessage"),
    closeMessage = '<button id="btn-msg-close" type="button" class="btn btn-default btn-xs" onclick="clearError()">x</button>';
  if (!errMsgDiv) {
    return;
  }
  clearMessage();
  errMsgDiv.innerHTML = errText + closeMessage;
}

function setMessage(msg, cls) {
  var messageDiv = document.getElementById('message'),
    closeMessage = '<button id="btn-msg-close" type="button"'
      + 'class="btn btn-default btn-xs" onclick="clearMessage()">x</button>',
    oldMsgs = '<div class="old-msgs">' + messageDiv.innerHTML + '</div>';

  cls = cls || '';

  if (!messageDiv) {
    return;
  }
  clearError();
  messageDiv.innerHTML = '';
  messageDiv.innerHTML = '<div class="clearfix msg ' + cls + '">' + msg + '</div><hr>' + oldMsgs + closeMessage;
}

function setCallInfo(msg) {
  var messageDiv = document.getElementById('call-info');

  messageDiv.innerHTML = msg;
}

function clearCallInfo() {
  setCallInfo('');
}

function setBackgroundCallInfo(msg) {
  var messageDiv = document.getElementById('background-call-info');

  messageDiv.innerHTML = msg;
}

function clearBackgroundCallInfo() {
  setBackgroundCallInfo('');
}

function formatError(error) {
  if (undefined === error) {
    return 'Unknown error occurred';
  }

  // String error
  if ('object' !== typeof error) {
    return error.toString();
  }

  // Error object errors
  if (error instanceof Error) {
    return error.message;
  }

  // SDK errors
  return ((error.ErrorCode ? "<br/>Error Code: " + error.ErrorCode : "") +
      (error.JSObject ? "<br/>JSObject: " + error.JSObject : "") +
      (error.JSMethod ? "<br/>JSMethod: " + error.JSMethod : "") +
      (error.ResourceMethod ? "<br/>Resource Method: " + error.ResourceMethod : "") +
      (error.ErrorMessage ? "<br/>Error Message: " + error.ErrorMessage : "") +
      (error.APIError ? "<br/>API Error: " + error.APIError : "") +
      (error.Cause ? "<br/>Cause: " + error.Cause : "") +
      (error.AdditionalInformation ? "<br/>Additional Information: " + error.AdditionalInformation : "") +
      (error.Resolution ? "<br/>Resolution: " + error.Resolution : "") +
      (error.HttpStatusCode ? "<br/>Http Status Code: " + error.HttpStatusCode : "") +
      (error.MessageId ? "<br/>MessageId: " + error.MessageId : ""));
}

function setupHomeView() {
  var videoWrap = document.getElementById('video-wrap'),
    callActions = document.getElementById('call-actions');

  videoWrap.addEventListener('mouseenter', function () {
    callActions.style.opacity = '1';
  });

  videoWrap.addEventListener('mouseleave', function () {
    callActions.style.opacity = '0';
  });

  document.getElementById('destination').value = '@' + ewebrtc_domain;
  setCaretPosition('destination', 0);
}

function createView(view, data, response) {
  var viewDiv,
    div,
    message,
    username,
    updateAddress,
    logout;

  viewDiv = document.getElementById('view');
  if (!viewDiv) {
    return;
  }

  div = document.createElement('div');

  if (response) {
    div.innerHTML = response.responseText;
  }

  viewDiv.innerHTML = '';
  viewDiv.appendChild(div);

  // message
  message = document.getElementById("message");
  // username
  username = document.getElementById("username");
  // update_address
  updateAddress = document.getElementById("update_address");
  // logout
  logout = document.getElementById("logout");

  switch (view) {
  case 'home':
    setupHomeView();

    if (username && data.user_name) {
      username.innerHTML = data.user_name;
      username.style.display = 'block';
    }
    if (updateAddress && data.user_type !== 'ACCOUNT_ID') {
      updateAddress.style.display = 'block';
    }
    if (logout) {
      logout.style.display = 'block';
    }
    break;
  case 'login':
    if (username) {
      username.innerHTML = "Guest";
      username.style.display = 'none';
    }
    if (updateAddress) {
      updateAddress.style.display = 'none';
    }
    if (logout) {
      logout.style.display = 'none';
    }
    if (message && data && data.message) {
      message.innerHTML = data.message;
    }
    break;
  }
}

function loadView(view, success) {
  // The ajaxRequest method takes url and the callback to be called on success error
  ajaxRequest({
    url: 'views/' + view + '.html',
    success: success
  });
}

function loadAndCreateView(view, data) {
  loadView(view, createView.bind(this, view, data));
}

function switchView(view, data) {
  if (!view) {
    return;
  }

  clearError();
  clearMessage();

  if (view === 'home' || view === 'profile') {
    if (!data) {
      data = sessionData;
    }
    if (!data || (data && !data.sessionId)) {
      switchView('login', {
        message: 'Your session is invalid. Please login again.'
      });
      return;
    }
    loadAndCreateView(view, data);
    return;
  }
  loadAndCreateView(view, data);
}

// ### loads the default view into the landing page
function loadDefaultView() {
  var url = window.location.href,
    args;

  //initially checks the sessionStorage and gets AccessToken or switches to home page
  try {
    if (sessionStorage !== undefined) {
      args = sessionStorage.userConsentResult;
      sessionStorage.removeItem('userConsentResult');
    } else if (url.indexOf('?userConsentResult=') >= 0) {
      args = url.slice(url.indexOf('?userConsentResult=') + 19);
    }
    if (args) {
      loginMobileNumber(args);
    } else {
      switchView('login', {
        message: 'Please login to start making calls !!!'
      });
    }
  } catch (err) {
    onError(err);
  }
}

function unsupportedBrowserError() {
  var error = new Error('The web browser does not support Enhanced WebRTC. Please use a supported version of' +
      ' Chrome or Firefox. For more information on supported browsers, use method ATT.browser.getBrowserSupport');

  onError(error);

  createView('login');

  return error;
}

function loadSampleApp() {
  try {
    loadConfiguration(function () {
      // load the default view into the browser
      loadDefaultView();
    });
  } catch (err) {
    onError(err);
  }
}

function getE911Id(address, is_confirmed, success, error) {
  createAccessToken('E911',
    null,
    function (response) {
      try {
        var data = response;
        createE911Id(data.access_token, address, is_confirmed, success, error);
      } catch (err) {
        error(err);
      }
    },
    error);
}

//Callback function which invokes SDK login method once access token is created/associated
function accessTokenSuccess(data) {
  try {
    if (!data) {
      throw 'No create token response data received';
    }

    if (data.user_type === 'MOBILE_NUMBER' ||
        data.user_type === 'VIRTUAL_NUMBER') {
      switchView('address');
    } else { // Account ID
      // if access token obtained successfully, create web rtc session
      loginEnhancedWebRTC(data.access_token);
    }
  } catch (err) {
    onError(err);
  }
}

function login(userType, authCode, userName) {
  createAccessToken(userType,
    authCode,
    function (response) {
      //TODO remove this after fixinf the DHS
      if (typeof response === 'string') {
        response = JSON.parse(response);
        if (typeof response === 'string') {
          response = JSON.parse(response);
        }
      }
      var data = response;
      data.user_type = userType;

      if (userType !== 'MOBILE_NUMBER') { // VIRTUAL_NUMBER and ACCOUNT_ID
        data.user_name = userType === 'VIRTUAL_NUMBER' ? userName : userName + '@' + ewebrtc_domain;

        ATT.utils.extend(sessionData, data); // save token/user data locally

        if (userType === 'VIRTUAL_NUMBER' &&
            userName.length === 11 &&
            userName.charAt(0).localeCompare('1') === 0) {
          userName = userName.substr(1);
        }

        userName = (userType === 'VIRTUAL_NUMBER') ? ('vtn:' + userName) : userName;

        associateAccessToken(userName,
          data.access_token,
          accessTokenSuccess.bind(null, data),
          onError);

      } else { // MOBILE_NUMBER
        ATT.utils.extend(sessionData, data); // save token/user data locally
        accessTokenSuccess.call(null, data);
      }
    },
    onError);
}

function loginMobileNumber(args) {
  args = JSON.parse(decodeURI(args));

  if (!args || !args.code) {
    throw new Error('Failed to retrieve the user consent code.');
  }

  if (args.error) {
    throw args.error;
  }

  login('MOBILE_NUMBER', args.code);
}

function loginUser(userType, userName) {
  try {
    if (!userType) {
      throw new Error('User type is required to login a user');
    }
    if (!userName) {
      throw new Error('User name is required to login a ' + userType + ' user');
    }

    login(userType, null, userName);

  } catch (err) {
    onError(err);
  }
}

function loginVirtualNumberOrAccountIdUser(event, form, userType) {
  if (event) {
    event.preventDefault();
  }

  loginUser(userType, form.username.value);
}

function validateAddress(form) {
  if (!form) {
    return;
  }

  var i,
    e,
    address = {
      base: {}
    },
    addressFormat = {
      'first_name': {
        display: 'First Name',
        required: true
      },
      'last_name': {
        display: 'Last Name',
        required: true
      },
      'house_number': {
        display: 'House Number',
        required: true
      },
      'street': {
        display: 'Street',
        required: true
      },
      'unit': {
        display: 'Unit/Apt/Suite',
        required: false
      },
      'city': {
        display: 'City',
        required: true
      },
      'state': {
        display: 'State',
        required: true
      },
      'zip': {
        display: 'Zip Code',
        required: true
      }
    };

  // Gather all the fields from the address form.
  for (i = 0; i < form.elements.length; i = i + 1) {
    e = form.elements[i];
    if (e.type !== 'button' && e.type !== 'submit') {
      if (addressFormat.hasOwnProperty(e.name)) {
        if (addressFormat[e.name].required === true && !e.value) {
          throw new Error(addressFormat[e.name].display + ' is a required field');
        }
        address.base[e.name] = e.value;
      } else if (e.type === 'checkbox') {
        address[e.name] = (e.checked).toString();
      }
    }
  }
  return address;
}

function callExists() {
  return phone.isCallInProgress();
}

function resetUI() {
  document.getElementById('ringtone').pause();
  document.getElementById('calling-tone').pause();

  // No calls or conferences
  document.getElementById('btn-mute').disabled = true;
  document.getElementById('btn-unmute').disabled = true;
  document.getElementById('btn-hold').disabled = true;
  document.getElementById('btn-resume').disabled = true;
  document.getElementById('btn-upgrade').disabled = true;
  document.getElementById('btn-downgrade').disabled = true;
  document.getElementById('btn-hangup').disabled = true;
  document.getElementById('btn-add-participant').disabled = true;
  document.getElementById('btn-participants-list').disabled = true;
  document.getElementById('panel-participants').display = 'none';
  document.getElementById('btn-move').disabled = true;
  document.getElementById('btn-transfer').disabled = true;
  document.getElementById('btn-switch').disabled = true;

  // 1 or more calls or conferences
  if (0 < phone.getCalls().length) {
    document.getElementById('btn-mute').disabled = muted;
    document.getElementById('btn-unmute').disabled = !muted;
    document.getElementById('btn-hold').disabled = false;
    document.getElementById('btn-resume').disabled = true;
    document.getElementById('btn-hangup').disabled = false;

    // 1 or more calls
    if ('call' === currentCallType) {
      document.getElementById('btn-move').disabled = false;

      // video call
      document.getElementById('btn-upgrade').disabled = true;
      document.getElementById('btn-downgrade').disabled = false;

      // audio call
      if ('audio' === phone.getMediaType()) {
        document.getElementById('btn-upgrade').disabled = false;
        document.getElementById('btn-downgrade').disabled = true;
      }
    }

    // 1 or more conferences
    if ('conference' === currentCallType && currentConferenceHost) {
      document.getElementById('btn-add-participant').disabled = false;
      document.getElementById('btn-participants-list').disabled = false;
    }

    // 2 calls or conferences
    if (1 < phone.getCalls().length) {

      // 2 calls
      if ('call' === currentCallType) {
        document.getElementById('btn-transfer').disabled = false;
      }

      document.getElementById('btn-switch').disabled = false;
    }

  }
}

function onError(error) {
  setError(formatError(error));
}

function onWarning(data) {
  if (undefined !== data.message) {
    setMessage(data.message, 'warning');
  }
}

function onSessionReady(data) {
  ATT.utils.extend(sessionData, data);
  switchView('home', sessionData);
}

function onNotification(data) {
  if (callExists()) {
    setMessage('Notification: ' + data.message, 'warning');
  }
  resetUI();
}

function onSessionDisconnected() {
  resetUI();
  clearSessionData();
  switchView('login', {
    message: 'Your enhanced WebRTC session has ended'
  });
}

function onSessionExpired() {
  resetUI();
  clearSessionData();
  switchView('login', {
    message: 'Your enhanced WebRTC session has expired. Please login again.'
  });
}

function onGatewayUnreachable() {
  setMessage('Currently the gateway is unreachable. Please try again.');
}

function checkEnhancedWebRTCSession() {
  return sessionData.sessionId;
}

function onAddressUpdated() {
  document.getElementById("address-box").style.display = 'none';
  setMessage('Updated E911 address successfully');
}

function onIncomingCall(data) {
  var from,
    callerInfo,
    answerBtn,
    rejectBtn,
    endAnswerBtn,
    holdAnswerBtn;

  callerInfo = getCallerInfo(data.from);

  from = callerInfo.callerId;

  if (callExists()) {

    endAnswerBtn = '<button type="button" id="end-answer-button" class="btn btn-success btn-sm" onclick="endAndAnswer()">'
      + '<span class="glyphicon glyphicon-remove"></span></button>';
    holdAnswerBtn = '<button type="button" id="hold-answer-button" class="btn btn-success btn-sm" onclick="holdAndAnswer()">'
      + '<span class="glyphicon glyphicon-pause"></span></button>';
    rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="reject()">' +
      '<span class="glyphicon glyphicon-thumbs-down"></span></button>';
    setMessage('<h6>Call from: ' + from + (data.mediaType ? '. Media type: '
      + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' + holdAnswerBtn + endAnswerBtn + rejectBtn, 'call:incoming');

  } else {
    answerBtn = '<button type="button" id="answer-button" class="btn btn-success btn-sm" onclick="answerCall()">'
      + '<span class="glyphicon glyphicon-thumbs-up"></span></button>';
    rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="reject()">' +
      '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

    setMessage('<h6>Call from: ' + from + (data.mediaType ? '. Media type: '
      + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' + answerBtn + rejectBtn, 'call:incoming');
  }

  document.getElementById('ringtone').play();
}

function onConferenceInvite(data) {
  var from,
    callerInfo,
    answerBtn,
    rejectBtn,
    endAnswerBtn,
    holdAnswerBtn;

  callerInfo = getCallerInfo(data.from);

  from = callerInfo.callerId;

  if (phone.isCallInProgress()) {
    endAnswerBtn = '<button type="button" id="end-answer-button" class="btn btn-success btn-sm" onclick="endAndJoin()">'
      + '<span class="glyphicon glyphicon-remove"></span></button>';
    holdAnswerBtn = '<button type="button" id="hold-answer-button" class="btn btn-success btn-sm" onclick="holdAndJoin()">'
      + '<span class="glyphicon glyphicon-pause"></span></button>';
    rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="reject()">' +
      '<span class="glyphicon glyphicon-thumbs-down"></span></button>';
    setMessage('<h6>Invitation to join conference from: ' + from + (data.mediaType ? '. Media type: '
      + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' + holdAnswerBtn + endAnswerBtn + rejectBtn,
      'conference:invitation-received');
  } else {
    answerBtn = '<button type="button" id="answer-button" class="btn btn-success btn-sm" onclick="join()">'
      + '<span class="glyphicon glyphicon-thumbs-up"></span></button>';
    rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="rejectConference()">' +
      '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

    setMessage('<h6>Invitation to join conference from: ' + from + (data.mediaType ? '. Media type: '
      + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' + answerBtn + rejectBtn,
      'conference:invitation-received');
  }

  document.getElementById('ringtone').play();
}

// Timestamp and the 'to' parameter is passed
function onDialing(data) {
  var to,
    callerInfo,
    cancelBtn;

  callerInfo = getCallerInfo(data.to);

  to = callerInfo.callerId;

  cancelBtn = '<button type="button" id="cancel-button" '
    + 'class="btn btn-danger btn-sm" onclick="cancel()">'
    + '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

  setMessage('<h6>Dialing: ' + to
    + (data.mediaType ? '. Media type: ' + data.mediaType : '')
    + '. Time: ' + data.timestamp + '</h6>'
    + cancelBtn, 'call-dialing');
}

// This event callback gets invoked when an outgoing call flow is initiated and the call state is changed to connecting state
function onConnecting(data) {
  var peer,
    callerInfo,
    cancelBtn;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  if (undefined !== data.to) {
    cancelBtn = '<button type="button" id="cancel-button" '
      + 'class="btn btn-danger btn-sm" onclick="cancel()">'
      + '<span class="glyphicon glyphicon-thumbs-down"></span></button>';
  }

  setMessage('<h6>Connecting to: ' + peer
    + (data.mediaType ? '. Media type: ' + data.mediaType : '')
    + '. Time: ' + data.timestamp + '</h6>'
    + (cancelBtn || ''), 'call:connecting');

  document.getElementById('calling-tone').play();
}

function onCallRingBackProvided() {
  document.getElementById('calling-tone').pause();
}

function onCallConnected(data) {
  var peer,
    callerInfo;

  currentCallType = data.callType;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('<h6>Connected to call ' + (data.from ? 'from ' : 'to ') + peer +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    (data.downgrade ? '. (Downgraded from video)' : '') +
    '. Time: ' + data.timestamp + '<h6>');

  setCallInfo('In ' + data.mediaType + ' ' + currentCallType + ' ' + data.index + ' with ' + peer + ' started by ' + (data.from ? 'them' : 'you'));

  resetUI();
}

function onConferenceConnected(data) {
  var peer;

  currentCallType = data.callType;

  if (data.from) {
    peer = getCallerInfo(data.from).callerId;
  }

  setMessage('<h6>In conference. Media type: ' + data.mediaType + '. Time: ' + data.timestamp + '</h6>');

  setCallInfo('In ' + data.mediaType + ' ' + currentCallType + ' ' + data.index + (peer ? ' with ' + peer : '') +
    ' started by ' + (data.from ? 'them' : 'you'));

  resetUI();
}

// This event callback gets invoked when an outgoing call flow is initiated and the call state is changed to call established state
function onMediaEstablished(data) {
  var msg = 'MediaEstablished.';

  if (data.mediaType) {
    msg += ' Media type: ' + data.mediaType + '.';
  }

  if (data.timestamp) {
    msg += ' Time: ' + data.timestamp;
  }

  setMessage(msg);
  resetUI();
}

function onAnswering(data) {
  var from,
    callerInfo;

  callerInfo = getCallerInfo(data.from);

  from = callerInfo.callerId;

  setMessage('<h6>Answering: ' + from +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('ringtone').pause();
}

function onInvitationSent() {
  setMessage('Invitation sent...');
}

function onInviteAccepted(data) {
  var peer, participants = [];

  if (data.participants) {
    Object.keys(data.participants).forEach(function (participant) {
      participants.push(getCallerInfo(participant).callerId);
    });
    peer = participants.join(', ');
  }

  setMessage('Invite accepted by ' + peer);

  setCallInfo('In ' + data.mediaType + ' ' + currentCallType + ' ' + data.index + (peer ? ' with ' + peer : '') + ' started by you');
}

function onInviteRejected() {
  setMessage('Invite rejected.');
  resetUI();
}

function onParticipantRemoved(data) {
  var peer, participants = [];

  if (data.participants) {
    Object.keys(data.participants).forEach(function (participant) {
      participants.push(getCallerInfo(participant).callerId);
    });
    peer = participants.join(', ');
  }

  setMessage('Participant removed from the ' + data.callType);

  setCallInfo('In ' + data.mediaType + ' ' + currentCallType + ' ' + data.index + (peer ? ' with ' + peer : '') + ' started by you');

  hideParticipants();
  showParticipants();
}

function onJoiningConference(data) {
  var from,
    callerInfo;

  callerInfo = getCallerInfo(data.from);

  from = callerInfo.callerId;

  setMessage('<h6>Joining conference initiated by: ' + from +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('ringtone').pause();
}

function onCallMuted(data) {
  muted = true;
  setMessage('Call muted. Time: ' + data.timestamp);
  resetUI();
  document.getElementById('btn-mute').disabled = true;
  document.getElementById('btn-unmute').disabled = false;
}

function onCallUnMuted(data) {
  muted = false;
  setMessage('Call umuted. Time: ' + data.timestamp);
  resetUI();
  document.getElementById('btn-unmute').disabled = true;
  document.getElementById('btn-mute').disabled = false;
}

function onCallHeld() {
}

function onCallResumed() {
}

function onConferenceHeld() {
}

function onConferenceResumed() {
}

function onCallDisconnecting(data) {
  setMessage('Disconnecting. Time: ' + data.timestamp);
}

function onConferenceDisconnecting(data) {
  setMessage('Disconnecting conference. Time: ' + data.timestamp);
}

function onCallDisconnected(data) {
  var peer,
    callerInfo;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to ' + peer)) + ' disconnected' +
    (data.message ? '. ' + data.message : '') + '. Time: ' + data.timestamp);

  if (data.background) {
    clearBackgroundCallInfo();
  } else {
    clearCallInfo();
    clearBackgroundCallInfo();
  }

  resetUI();
}

function onConferenceEnded(data) {
  var peer;

  if (data.from) {
    peer = getCallerInfo(data.from).callerId;
  }

  setMessage('Conference ' + data.index + ' started by ' + (peer || 'you') + ' disconnected' +
    (data.message ? '. ' + data.message : '') + '. Time: ' + data.timestamp);

  clearCallInfo();

  if (data.background) {
    clearBackgroundCallInfo();
  } else {
    clearCallInfo();
    clearBackgroundCallInfo();
  }

  resetUI();
}

function onCallSwitched(data) {
  var fromPeer,
    toPeer,
    fromParticipants = [],
    toParticipants = [];

  currentCallType = data.to.callType;

  if (data.from) {
    if ('conference' === data.from.callType && !data.from.to) { // background conference host
      if (data.from.participants) {
        Object.keys(data.from.participants).forEach(function (participant) {
          fromParticipants.push(getCallerInfo(participant).callerId);
        });

        fromPeer = fromParticipants.join(', ');
      }
    } else {
      fromPeer = data.from.from || data.from.to;
      fromPeer = getCallerInfo(fromPeer).callerId;
    }
  }

  if ('conference' === data.to.callType && !data.to.to) { // foreground conference host
    if (data.to.participants) {
      Object.keys(data.to.participants).forEach(function (participant) {
        toParticipants.push(getCallerInfo(participant).callerId);
      });

      toPeer = toParticipants.join(', ');
    }
  } else {
    toPeer = data.to.from || data.to.to;
    toPeer = getCallerInfo(toPeer).callerId;
  }

  setMessage('<h6>Switched ' + (data.from ? ('from ' + data.from.callType + (fromPeer ? ' with ' + fromPeer : '')) : '')
    + ' to ' + data.to.callType + (toPeer ? ' with ' + toPeer : '') + '. Time: ' + data.timestamp + '<h6>');

  setCallInfo('In ' + data.to.mediaType + ' ' + data.to.callType + ' ' + data.to.index + (toPeer ? ' with ' + toPeer : '') +
    ' started by ' + (data.to.from ? 'them' : 'you'));

  if (data.from) {
    setBackgroundCallInfo('to ' + data.from.callType + ' ' + data.from.index + (fromPeer ? ' with ' + fromPeer : '') +
      ' started by ' + (data.from.from ? 'them' : 'you'));
  } else {
    clearBackgroundCallInfo();
  }

  resetUI();
}

function onCallMoved(data) {
  setMessage('Call moved successfully. Time: ' + data.timestamp);

  resetUI();
}

function onTransferring(data) {
  setMessage('Call transfer initiated successfully. Time: ' + data.timestamp);
}

function onTransferred(data) {
  setMessage('Call transferred successfully. Time: ' + data.timestamp);

  resetUI();
}

function onModificationInProgress(data) {
  setMessage('A call modification of type ' + data.operation + ' is in progress. Time: ' + data.timestamp);
}

function onStateChanged(data) {

  if (data.background) { // don't do anything for background call state changes.
    return;
  }

  var peer = data.from || data.to,
    callType = 'call' === data.callType ? 'Call' : 'Conference';

  if (peer !== undefined) {
    peer = getCallerInfo(peer).callerId;
  }

  setMessage(callType + ' state changed from ' + data.oldState + ' to ' + data.newState + '. Time: ' + data.timestamp);

  if ('hold' === data.operation) {            // hold
    if ('initiator' === data.generator) {     // initiator side
      if ('held' === data.newState) {           // one way and two way hold
        setMessage(callType + ' to ' + peer + ' on hold. Time: ' + data.timestamp);
        document.getElementById('btn-hold').disabled = true;
        document.getElementById('btn-resume').disabled = false;
      }
    } else {                                // recvr side
      if ('connected' === data.newState) {    // one way hold initiated by other party
        setMessage(callType + ' is held by ' + peer + '. Time: ' + data.timestamp);
      } else if ('held' === data.newState) {  // two way hold initiated by other party
        setMessage(callType + ' is held by ' + peer + '. Time: ' + data.timestamp);
      }
    }
  } else if ('resume' === data.operation) {   // resume
    if ('initiator' === data.generator) {     // initiator side
      if ('connected' === data.newState) {      // one way and two way hold resumed
        setMessage(callType + ' to ' + peer + ' resumed. Time: ' + data.timestamp);
        document.getElementById('btn-hold').disabled = false;
        document.getElementById('btn-resume').disabled = true;
      }
    } else {                                // recvr side
      if ('connected' === data.newState) {    // one way hold resumed by other party
        setMessage(callType + ' is resumed by ' + peer + '. Time: ' + data.timestamp);
      } else if ('held' === data.newState) {  // two way hold resumed by other party
        setMessage(callType + ' is resumed by ' + peer + '. Time: ' + data.timestamp);
      }
    }
  } else if ('upgrade' === data.operation) {    // upgrade
    if ('connected' === data.newState) {
      setMessage(callType + ' with ' + peer + ' is modified to ' + data.mediaType + '. Time: ' + data.timestamp);
      resetUI();
    }
  } else if ('downgrade' === data.operation) {  // downgrade
    if ('connected' === data.newState) {
      setMessage(callType + ' with ' + peer + ' is modified to ' + data.mediaType + '. Time: ' + data.timestamp);
      resetUI();
    }
  } else {
    resetUI();
  }

  setCallInfo('In ' + data.mediaType + ' ' + data.callType + ' ' + data.index + (peer ? ' with ' + peer : '') +
    ' started by ' + (data.from ? 'them' : 'you'));

}

function onConferenceCanceled(data) {
  setMessage('Conference canceled. Time: ' + data.timestamp);
  resetUI();
}

function onCallCanceled(data) {
  var peer,
    callerInfo;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to ' + peer)) + ' canceled.' + ' Time: ' + data.timestamp);

  resetUI();
}

function onCallRejected(data) {
  var peer,
    callerInfo;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to ' + peer)) + ' rejected.' + ' Time: ' + data.timestamp);

  resetUI();
}

function autoRejectCallModification(time) {
  autoRejectTimer = setTimeout(function () {
    if (callExists()) {
      rejectModification();
      setMessage('Call modification automatically rejected!', 'warning');
    }
  }, time);
}

function disableAutoReject() {
  clearTimeout(autoRejectTimer);
}

function disableTimerAndAccept() {
  disableAutoReject();
  acceptModification();
}

function disableTimerAndReject() {
  disableAutoReject();
  rejectModification();
}

function onMediaModification(data) {
  var peer,
    callerInfo,
    acceptModButton,
    rejectModButton;

  autoRejectCallModification(autoRejectWaitingTime);

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  if (callExists()) {
    acceptModButton = '<button type="button" id="accept-mod-button" class="btn btn-success btn-sm" onclick="disableTimerAndAccept()">'
      + '<span class="glyphicon glyphicon-ok"></span></button>';
    rejectModButton = '<button type="button" id="reject-mod-button" class="btn btn-danger btn-sm" onclick="disableTimerAndReject()">'
      + '<span class="glyphicon glyphicon-remove"></span></button>';

    setMessage('<h6><bold>' + peer + '</bold>' + ' is requesting to modify the call from ' + data.mediaType + ' to '
      + data.newMediaType + '. Time: ' +
      data.timestamp + ' </h6>' + acceptModButton + rejectModButton, 'call:incoming');

  }
}

function onToneSent(data) {
  setMessage('dtmf tone insterted.Tone: ' + data.tone + ' Time: ' + data.timestamp);
}

function onToneSending(data) {
  setMessage('dtmf tone sending. Time: ' + data.timestamp);
}


