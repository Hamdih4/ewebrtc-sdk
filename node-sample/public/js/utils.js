/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ATT, RESTClient, console, log, phone, holdInitiator, eWebRTCDomain,
  sessionData, defaultHeaders, onError, getCallerInfo, Dialpad, dialer,
  loginMobileNumber, createAccessToken, associateAccessToken, createE911Id, ewebrtc_domain,
  loginEnhancedWebRTC, hideParticipants, showParticipants, acceptModification, rejectModification*/

'use strict';

var buttons,
  defaultHeaders,
  autoRejectTimer, 
  dialpad,
  muted = false,
  dialerVisible = false,
  autoRejectWaitingTime = 5000;

defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

function unsupportedBrowserError() {
  var viewDiv = document.getElementById('view'),
    errorText = 'The web browser does not support Enhanced WebRTC. Please use latest Chrome or Firefox';

  if (viewDiv) {
    viewDiv.innerHTML = errorText;
  } else {
    alert(errorText);
  }
  return new Error(errorText);
}

// all the ajax request passes via this method it sets Callbacks and other parameters
// it takes args as a parameter it contains end url details
/**
 * @param args
 * ajax Call for sample app
 */
function ajaxRequest(args) {
  var rc = new ATT.RESTClient({
    method : args.method || 'GET',
    url : args.url,
    data: args.data,
    headers : args.headers || defaultHeaders,
    success : args.success,
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
    closeMessage =  '<button id="btn-msg-close" type="button" class="btn btn-default btn-xs" onclick="clearError()">x</button>';
  if (!errMsgDiv) {
    return;
  }
  clearMessage();
  errMsgDiv.innerHTML = errText + closeMessage;
}

function setMessage(msg, cls) {
  var messageDiv = document.getElementById('message'),
    closeMessage =  '<button id="btn-msg-close" type="button"'
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

function setupHomeView() {
  var videoWrap = document.getElementById('video-wrap'),
    callActions = document.getElementById('call-actions');

  videoWrap.addEventListener('mouseenter', function () {
    callActions.style.opacity = '1';
  });

  videoWrap.addEventListener('mouseleave', function () {
    callActions.style.opacity = '0';
  });

  document.getElementById('callee').value =  '@' + ewebrtc_domain;
}

function formatError(errObj) {
  var error,
    formattedError;

  if (undefined === errObj) {
    return '';
  }

  if (undefined !== errObj.getJson) {
    if (errObj.getJson()) {
      error = errObj.getJson();
    } else {
      error = errObj.responseText;
    }
  }
  if (undefined !== errObj.error) {
    error = errObj.error;
  }
  if (undefined !== errObj.data) {
    error.Message = errObj.data.message;
  }

  if (undefined !== error.JSObject
      || undefined !== error.APIError) {
    formattedError = (error ? (
      (error.JSObject ? "<br/>JSObject: " + error.JSObject : "") +
      (error.JSMethod ? "<br/>JSMethod: " + error.JSMethod : "") +
      (error.Resolution ? "<br/>Resolution: " + error.Resolution : "") +
      (error.ErrorCode ? "<br/>Error Code: " + error.ErrorCode : "") +
      (error.Cause ? "<br/>Cause: " + error.Cause : "") +
      (error.ErrorMessage ? "<br/>Error Message: " + error.ErrorMessage : "") +
      (error.PossibleCauses ? "<br/>Possible Causes: " + error.PossibleCauses : "") +
      (error.PossibleResolution ? "<br/>Possible Resolution: " + error.PossibleResolution : "") +
      (error.APIError ? "<br/>API Error: " + error.APIError : "") +
      (error.ResourceMethod ? "<br/>Resource Method: " + error.ResourceMethod : "") +
      (error.HttpStatusCode ? "<br/>Http Status Code: " + error.HttpStatusCode : "") +
      (error.MessageId ? "<br/>MessageId: " + error.MessageId : "") +
      (error.Message ? "<br/>Message: " + error.Message : "")
    ) : '');
  } else {
    formattedError = error.toString();
  }

  return formattedError;
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
  div.innerHTML = response.responseText;

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

function getE911Id(address, is_confirmed, success, error) {
  createAccessToken('E911',
    null,
    function (response) {
      try {
        //TODO remove this after fixinf the DHS
        if (typeof response === 'string') {
          response = JSON.parse(response);
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
        }
        var data = response;
        createE911Id(data.access_token, address, is_confirmed, success, error);
      } catch (error) {
        onError(error);
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

function loginVirtualNumberOrAccountIdUser(event, form, userType) {
  if (event) {
    event.preventDefault();
  }

  var username;

  username = form.username.value;

  try {
    if (!username) {
      throw new Error('User name is required in to login a ' + userType + ' user');
    }

    login(userType, null, username);

  } catch (err) {
    onError(err);
  }
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
      'last_name' : {
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
          throw addressFormat[e.name].display + ' is a required field';
        }
        address.base[e.name] = e.value;
      } else if (e.type === 'checkbox') {
        address[e.name] = (e.checked).toString();
      }
    }
  }
  return address;
}

function resetUI() {
  document.getElementById('ringtone').pause();
  document.getElementById('calling-tone').pause();

  if (0 === phone.getCalls().length) {
    document.getElementById('btn-hold').disabled = true;
    document.getElementById('btn-resume').disabled = true;
    document.getElementById('btn-move').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-mute').disabled = true;
    document.getElementById('btn-unmute').disabled = true;
    document.getElementById('btn-upgrade').disabled = true;
    document.getElementById('btn-downgrade').disabled = true;
    document.getElementById('btn-hangup').disabled = true;
    document.getElementById('participant').disabled = true;
    document.getElementById('btn-add-participant').disabled = true;
    document.getElementById('btn-end-conference').disabled = true;
    document.getElementById('btn-participants-list').disabled = true;
  }
}

function enableUI() {
  document.getElementById('btn-mute').disabled = muted;
  document.getElementById('btn-unmute').disabled = !muted;
  document.getElementById('btn-hold').disabled = false;
  document.getElementById('btn-resume').disabled = true;
  document.getElementById('btn-move').disabled = false;
  if ('audio' === phone.getMediaType()) {
    document.getElementById('btn-upgrade').disabled = false;
    document.getElementById('btn-downgrade').disabled = true;
  } else {
    document.getElementById('btn-upgrade').disabled = true;
    document.getElementById('btn-downgrade').disabled = false;
  }
  document.getElementById('btn-hangup').disabled = false;
}

function onError(err) {
  var errObj = err;

  if ('object' === typeof errObj) {
    errObj = formatError(errObj);
  }
  errObj = errObj.toString();

  setError(errObj);
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
  if (!phone.isCallInProgress()) {
    resetUI();
  }
  setMessage('Notification: ' + data.message, 'warning');
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

function checkEnhancedWebRTCSession() {
  return sessionData.sessionId;
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

  if (phone.isCallInProgress()) {

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
    rejectBtn;

  callerInfo = getCallerInfo(data.from);

  from = callerInfo.callerId;

  answerBtn = '<button type="button" id="answer-button" class="btn btn-success btn-sm" onclick="join()">'
    + '<span class="glyphicon glyphicon-thumbs-up"></span></button>';
  rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="rejectConference()">' +
    '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

  setMessage('<h6>Invitation to join conference from: ' + from + (data.mediaType ? '. Media type: '
    + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' +  answerBtn + rejectBtn, 'call:incoming');

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
    +  cancelBtn, 'call-dialing');
}

function onInvitationSent() {
  setMessage('Invitation sent...');
}

function onInviteAccepted() {
  setMessage('Invite accepted.');
}

function onInviteRejected() {
  setMessage('Invite rejected.');
  resetUI();
}

function onParticipantRemoved() {
  hideParticipants();
  showParticipants();
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
    +  (cancelBtn || ''), 'call:connecting');

  document.getElementById('calling-tone').play();
}

function onCallRingbackProvided() {
  document.getElementById('calling-tone').pause();
}

function onCallConnected(data) {
  var peer,
    callerInfo;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('<h6>Connected to call ' + (data.from ? 'from ' : 'to ') + peer +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    (data.downgrade ? '. (Downgraded from video)' : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('calling-tone').pause();

  enableUI();
}

function onCallSwitched(data) {
  setMessage('<h6>Switched call: from ' + data.from + ' to ' + data.to +
    '. Time: ' + data.timestamp + '<h6>');
  document.getElementById('btn-switch').disabled = false;
  document.getElementById('btn-transfer').disabled = false;
}

function onConferenceConnected(data) {
  setMessage('In conference. ' +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('calling-tone').pause();
  document.getElementById('participant').disabled = false;
  document.getElementById('btn-add-participant').disabled = false;
  document.getElementById('btn-end-conference').disabled = false;
  document.getElementById('btn-participants-list').disabled = false;
}

// This event callback gets invoked when an outgoing call flow is initiated and the call state is changed to call established state
function onMediaEstablished() {
  enableUI();
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
  document.getElementById('btn-mute').disabled = true;
  document.getElementById('btn-unmute').disabled = false;
}

function onCallUnmuted(data) {
  muted = false;
  setMessage('Call umuted. Time: ' + data.timestamp);
  document.getElementById('btn-unmute').disabled = true;
  document.getElementById('btn-mute').disabled = false;
}


// This event callback gets invoked when a call is put on hold
function onCallHeld(data) {
  resetUI();

  if (holdInitiator) {
    setMessage('Call on hold. Time: ' + data.timestamp);

    document.getElementById('btn-hold').disabled = true;
    document.getElementById('btn-resume').disabled = false;

  } else {
    setMessage('Call was held. Time: ' + data.timestamp);
  }
}

// This event callback gets invoked when a call is in resumed state.
function onCallResume(data) {
  setMessage('Call resumed. Time: ' + data.timestamp);
  enableUI();
}

function onConferenceHold(data) {
  setMessage('Conference on hold. Time: ' + data.timestamp);
  document.getElementById('btn-hold').disabled = true;
  document.getElementById('btn-resume').disabled = false;
}

function onConferenceResumed(data) {
  setMessage('Conference resumed. Time: ' + data.timestamp);
  enableUI();
}


function onToneSent(data) {
  setMessage('dtmf tone insterted.Tone: ' + data.tone + ' Time: ' + data.timestamp);
}

function onToneSending(data) {
  setMessage('dtmf tone sending. Time: ' + data.timestamp);
}

function onCallDisconnecting(data) {
  setMessage('Disconnecting. Time: ' + data.timestamp);
}

function onConferenceDisconnecting(data) {
  setMessage('Disconnecting conference. Time: ' + data.timestamp);
}

function onCallMoved(data) {
  setMessage('Call Moved Successfully. Time: ' + data.timestamp);
}

function onTransferring(data) {
  setMessage('Call Transfer Initiated Successfully. Time: ' + data.timestamp);
}

function onTransferred(data) {
  setMessage('Call Transfer Successfully. Time: ' + data.timestamp);
}

function onMediaModification(data) {
  setMessage('Call is being modified to ' + data.mediaType + '. Time: ' + data.timestamp);
}

function onStateChanged(data) {
  setMessage('Call state changed from ' + data.oldState + ' to ' + data.newState + '. Time: ' + data.timestamp);

  if ('modification-in-progress' === data.oldState && 'connected' === data.newState) {
    setMessage('Call modified to ' + data.mediaType + '. Time: ' + data.timestamp);
  }

  if ('connected' === data.newState) {
    enableUI();
  } else if ('hold' === data.newState) {
    document.getElementById('btn-hold').disabled = true;
    document.getElementById('btn-resume').disabled = false;
  }
}

function onCallDisconnected(data) {
  var peer,
    callerInfo,
    allCalls;

  peer = data.from || data.to;

  buttons = {
    hangup: document.getElementById('btn-hangup'),
    resume: document.getElementById('btn-resume'),
    switch: document.getElementById('btn-switch')
  };

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to '  + peer)) + ' disconnected' +
    (data.message ? '. ' + data.message : '') + '. Time: ' + data.timestamp);
  resetUI();

  allCalls = phone.getCalls();

  if (1 === allCalls.length && 'held' === allCalls[0].state) {
    buttons.hangup.disabled = false;
    buttons.resume.disabled = false;
    buttons.switch.disabled = true;
  }
}

function onConferenceCanceled(data) {
  setMessage('Conference canceled. Time: ' + data.timestamp);
  resetUI();
}

function onConferenceEnded(data) {
  setMessage('Conference ended. Time: ' + data.timestamp);
  resetUI();
}

function onCallCanceled(data) {
  var peer,
    callerInfo,
    allCalls;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to '  + peer)) + ' canceled.' + ' Time: ' + data.timestamp);
  resetUI();

  buttons = {
    resume: document.getElementById('btn-resume')
  };

  allCalls = phone.getCalls();
  if (1 === allCalls.length && 'held' === allCalls[0].state) {
    buttons.resume.disabled = false;
  }
}

function onCallRejected(data) {
  var peer,
    callerInfo;

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to '  + peer)) + ' rejected.' + ' Time: ' + data.timestamp);

  document.getElementById('ringtone').pause();
  document.getElementById('calling-tone').pause();
}

function autoRejectCallModification(time) {
  autoRejectTimer = setTimeout(function () {
    if (phone.isCallInProgress()) {
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

function onCallModification(data) {
  var peer,
    callerInfo,
    acceptModButton,
    rejectModButton;

  autoRejectCallModification(autoRejectWaitingTime);

  peer = data.from || data.to;

  callerInfo = getCallerInfo(peer);

  peer = callerInfo.callerId;

  if (phone.isCallInProgress()) {
    acceptModButton = '<button type="button" id="accept-mod-button" class="btn btn-success btn-sm" onclick="disableTimerAndAccept()">'
      + '<span class="glyphicon glyphicon-ok"></span></button>';
    rejectModButton = '<button type="button" id="reject-mod-button" class="btn btn-danger btn-sm" onclick="disableTimerAndReject()">'
      + '<span class="glyphicon glyphicon-remove"></span></button>';

    setMessage('<h6><bold>' + peer + '</bold>' + ' is requesting to modify the call from ' + data.mediaType + ' to '
      + data.newMediaType + '. Time: ' +
      data.timestamp + ' </h6>' + acceptModButton + rejectModButton, 'call:incoming');

  }
}

function onAddressUpdated() {
  document.getElementById("address-box").style.display = 'none';
  setMessage('Updated E911 address successfully');
}

function toggleDialPad(options) {
  if (!dialpad) {
    dialpad = new Dialpad(options);
  }

  if (!dialpad.visible) {
    document.getElementById('sample-dial-pad').appendChild(dialpad.render());
    dialpad.visible = true;
  } else {
    dialpad.hide();
    dialpad.visible = false;
  }
}

