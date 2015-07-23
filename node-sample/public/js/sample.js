/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ATT, console, log, loadConfiguration, loadDefaultView, clearMessage, clearError, onSessionDisconnected,
  validateAddress, associateE911Id, getE911Id, loginVirtualNumberOrAccountIdUser, loginEnhancedWebRTC,
  onError, phoneLogout, loadView, switchView, dialCall, answer, answer2ndCall,
  hold, resume, startConference, joinConference, addParticipant, virtual_numbers,
  getParticipants, removeParticipant, move, switchCall, cleanPhoneNumber, ToggleDialPad, dialpad, sendDialTone*/

'use strict';

var sessionData = {},
  participantsVisible = false,
  holdInitiator;

function loadSampleApp() {
  loadConfiguration(function () {
    // load the default view into the browser
    loadDefaultView();
  });
}

function createE911AddressId(event, form) {
  event.preventDefault();

  clearError();

  if (!sessionData.access_token) {
    switchView('login');
    onError('No access token available to login to Enhanced WebRTC. Please create an access token first');
    return;
  }

  try {
    var address = validateAddress(form);

    getE911Id(address.base,
      address.is_confirmed,
      function (response) {
        if (typeof response === 'string') {
          response = JSON.parse(response);
        }
        loginEnhancedWebRTC(sessionData.access_token, response);
      },
      onError);

  } catch (err) {
    onError(err);
  }
}

function updateE911AddressId(event, form) {
  event.preventDefault();

  clearError();

  try {
    var address = validateAddress(form);

    getE911Id(address,
      function (e911Id) {
        associateE911Id(e911Id.e911Locations.addressIdentifier);
      },
      onError);

  } catch (err) {
    onError(err);
  }
}

function loginVirtualNumber(event, form) {
  loginVirtualNumberOrAccountIdUser(event, form, 'VIRTUAL_NUMBER');
}

function loginAccountIdUser(event, form) {
  loginVirtualNumberOrAccountIdUser(event, form, 'ACCOUNT_ID');
}

function hideView(obj) {
  if (!obj) {
    return;
  }
  obj.style.display = 'none';
}

function showLoginForm(form) {
  document.removeEventListener('click', hideView);
  document.addEventListener('click', hideView.bind(null, form));

  form.style.display = 'block';
}

function addOption(select, option, val) {
  var opt = document.createElement('option');
  opt.value = undefined === val ? option : val;
  opt.innerHTML = option;
  select.appendChild(opt);
}

function virtualNumberLogin(e) {
  e.stopPropagation();

  hideView(document.getElementById('login-account-id-form'));

  var i,
    form,
    select;

  form = document.getElementById('login-virtual-number-form');

  if (!form) {
    return;
  }

  if (form.children && form.children.length > 0) {
    for (i = 0; i < form.children.length; i = i + 1) {
      if (form.children[i].name === 'username') {
        select = form.children[i];
        break;
      }
    }
  }

  if (select && select.children.length === 0 && virtual_numbers && virtual_numbers.length > 0) {
    addOption(select, '-select-', '');

    virtual_numbers.forEach(function (virtual_number) {
      addOption(select, virtual_number);
    });
  }

  showLoginForm(form);
}

function accountIdUserLogin(e) {
  e.stopPropagation();

  hideView(document.getElementById('login-virtual-number-form'));

  var form;

  form = document.getElementById('login-account-id-form');

  if (!form) {
    return;
  }

  showLoginForm(form);
}

function updateAddress(e) {
  e.stopPropagation();

  var addressDiv =  document.getElementById("address-box");

  document.removeEventListener('click', hideView);
  document.addEventListener('click', hideView.bind(null, addressDiv));

  addressDiv.style.display = 'block';

  loadView('address', function (response) {
    addressDiv.innerHTML = response.responseText;

    var addressForm = document.getElementById('addressForm');
    if (addressForm) {
      addressForm.onsubmit = function (e) {
        updateE911AddressId(e, addressForm);
      };
    }
  });
}

function logout() {
  if (sessionData.sessionId) {
    phoneLogout();
    return;
  }
  onSessionDisconnected();
}

function showCall(event) {
  event.stopPropagation();

  clearError();

  // dial takes destination, mediaType, local and remote media HTML elements

  var callForm = document.getElementById('callForm'),
    confForm = document.getElementById('confForm'),
    that = event.currentTarget,
    callee,
    audioOnly,
    btnConf = document.getElementById('btn-show-conference'),
    btnDial = document.getElementById('btn-dial'),
    localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  callForm.classList.remove('hidden');
  callForm.classList.add('shown');

  confForm.classList.remove('shown');
  confForm.classList.add('hidden');

  btnConf.classList.remove('active');
  that.classList.add('active');

//  if (!window.dialer) {
//    createDialPad({
//      onPress: function (key) {
//        console.log('a key was pressed', key);
//      },
//      onCallableNumber: function (number) {
//        console.log('we have a number that seems callable', number);
//      },
//      onHide: function () {
//        console.log('removed it');
//      },
//      onCall: function (number) {
//        console.log('The call button was pressed', number);
//        audioOnly = document.getElementById('callAudioOnly').checked;
//        callee = document.getElementById('callee').value;
//        //util method to clean phone number
//        callee = appendDomainToAccountIDCallee(callee);
//
//        dialCall(callee, (audioOnly ? 'audio' : 'video'), localVideo, remoteVideo);
//      }
//    });
//  }

  btnDial.onclick = function () {
    audioOnly = document.getElementById('callAudioOnly').checked;
    callee = document.getElementById('callee').value;
    //util method to clean phone number
    callee = cleanPhoneNumber(callee);

    dialCall(callee, (audioOnly ? 'audio' : 'video'), localVideo, remoteVideo);
  };
}

function answerCall(action) {
  document.getElementById('ringtone').pause();
  clearMessage();

  var localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  if (undefined !== action) {
    answer2ndCall(localVideo, remoteVideo, action);
  } else {
    answer(localVideo, remoteVideo);
  }
}

function holdAndAnswer() {
  answerCall('hold');
}

function endAndAnswer() {
  answerCall('end');
}

function showDialPad() {
  toggleDialPad({
    onPress: function (key) {
      sendDTMFTone(key);
      console.log('Key ' + key + ' was pressed');
    },
    onCall: function () {
      dialpad.hide();
      dialpad.visible = false;
    }
  });
}

function holdCall() {
  holdInitiator = true;
  hold();
}

function resumeCall() {
  holdInitiator = false;
  resume();
}

function showConference(event) {
  clearError();

  var callForm = document.getElementById('callForm'),
    confForm = document.getElementById('confForm'),
    confAudioOnly,
    btnCreateConference = document.getElementById('btn-create-conference'),
    that = event.currentTarget,
    btnCall = document.getElementById('btn-show-call'),
    localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  callForm.classList.remove('shown');
  callForm.classList.add('hidden');

  confForm.classList.remove('hidden');
  confForm.classList.add('shown');

  that.classList.add('active');
  btnCall.classList.remove('active');

//  if (!window.dialer) {
//    createDialPad({
//      onPress: function (key) {
//        console.log('a key was pressed', key);
//      },
//      onCallableNumber: function (number) {
//        console.log('we have a number that seems callable', number);
//      },
//      onHide: function () {
//        console.log('removed it');
//      },
//      onCall: function (number) {
//        console.log('The call button was pressed', number);
//        confAudioOnly = document.getElementById('confAudioOnly').checked;
//        startConference((confAudioOnly ? 'audio' : 'video'), localVideo, remoteVideo);
//      }
//    });
//  }

  btnCreateConference.onclick = function () {
    confAudioOnly = document.getElementById('confAudioOnly').checked;
    startConference((confAudioOnly ? 'audio' : 'video'), localVideo, remoteVideo);
  };
}

function join() {
  document.getElementById('ringtone').pause();
  clearMessage();

  var localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  joinConference(localVideo, remoteVideo);
}

function getListOfInvitees(partcpnts) {
  var noSpacesString = partcpnts.replace(/ +?/g, '');
  partcpnts = noSpacesString.split(',');
  return partcpnts;
}

function participant() {
  var partcpnt;

  partcpnt = document.getElementById('participant').value;

  addParticipant(partcpnt);
}

function showParticipants() {
  var participantsPanel,
    partcpnts,
    expandParticipants,
    participantsList,
    key,
    html;

  participantsPanel = document.getElementById('panel-participants');
  participantsList = document.getElementById('participants-list');
  expandParticipants = document.getElementById('expand-participants');

  partcpnts = getParticipants();

  html = '';

  for (key in partcpnts) {
    if (partcpnts.hasOwnProperty(key)) {
      html += '<div class="row"></div><div class="participant glyphicon glyphicon-user"> ' + key +
        ' &nbsp; <span class="remove-participant glyphicon glyphicon-remove" onclick="removeUser()" id="' + key +
        '"></span></div></div>';
    }
  }

  if (participantsPanel
      && participantsList
      && expandParticipants
      && partcpnts) {
    participantsPanel.style.display = 'block';

    expandParticipants.innerHTML = '<span class="glyphicon glyphicon-chevron-up"> </span>';
    participantsList.innerHTML = html;
    participantsVisible = true;
  }
}

function hideParticipants() {
  var participantsPanel,
    expandParticipants;

  participantsPanel = document.getElementById('panel-participants');
  expandParticipants = document.getElementById('expand-participants');

  if (participantsPanel) {
    participantsPanel.style.display = 'none';
    expandParticipants.innerHTML = '<span class="glyphicon glyphicon-chevron-down"> </span>';
    participantsVisible = false;
  }
}

function toggleParticipants() {
  if (participantsVisible) {
    hideParticipants();
  } else {
    showParticipants();
  }
}

function removeUser() {
  var user = event.currentTarget.id;

  removeParticipant(user);
}

function moveCall() {
  move();
}

function switchCalls() {
  switchCall();
}

// ## load the sample app
// ---------------------------------
loadSampleApp();