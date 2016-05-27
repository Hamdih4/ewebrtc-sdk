# AT&T Enhanced WebRTC JS SDK Release Notes

This SDK includes the following components:

* JavaScript library - a client library to access the AT&T Enhanced WebRTC API.
* Node.js sample app - a web app demonstrating the features of the JavaScript library and managing app configuration elements such as the App Key and App Secret. **Please refer to `node-sample/RELEASE.md` for sample app-specific notes**.
* Developer Hosted Server (DHS) library - a Node.js library for generating OAuth access tokens and E911 IDs. **Please refer to  `node-sample/lib/RELEASE.md` for DHS library-specific notes**.

## Features of the JavaScript Library

The following features and functionality are available in the current SDK release for all three supported calling types (Virtual Number and Account ID):

### Chrome

*	**Basic audio and video call management** – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls.
*	**Basic audio and video conferencing** – create a conference, add and remove participants, hold, resume, mute, unmute, and end conference.
  *	Supports dialing out to add participants.
*	**Advanced call management** – move, transfer, add a second call, switch between two calls, upgrade and downgrade, reject downgrade and reject upgrade requests.
  *	Audio and video calls can be moved Web-to-Web
  *	Calls can be moved from the Web to an AT&T mobile phone

####  Chrome v47 Impact
  Google released Chrome v47 on Dec 1, 2015. This version introduced the following changes that break backwards-compatibility for the Enhanced WebRTC API.
  1. `getUserMedia` now requires HTTPS
  2. `MediaStream.stop` removed
  3. Changes in SDP (Session Description Protocol) processing

**What you need to do**
  1. `getUserMedia` requires HTTPS

  `ACTION NEEDED:`

  Please be sure your Web Application is always used from a -secure (HTTPS) URL. If your user tries to use your app from an unsecured (HTTP) URL, it will automatically be redirected to an equivalent HTTPS URL.

  2. `MediaStream.stop` removed

  The following `phone` features will not work in Chrome v47 if you continue to use ewebrtc-sdk versions 1.0.5 or earlier:

  Methods: `Phone.hangup(), Phone.endConference()`

  Events:  `call:disconnected, conference:ended`

  `ACTION NEEDED:`

  Please update the ewebrtc-sdk JavaScript library in your HTML pages to the latest version v1.0.6.

  The latest version is available at https://raw.githubusercontent.com/attdevsupport/ewebrtc-sdk/master/js/ewebrtc-sdk.min.js.

  You don't have to make any other changes to your application code.

  ewebrtc-sdk v1.0.6 will also work correctly with Chrome v46, even if your users have not upgraded their browsers yet.

  3. Changes in SDP processing

  `NO ACTION NEEDED:`

  If you are using the ewebrtc-sdk library, you are not affected by this.


##### How to find out what version of ewebrtc-sdk your Web App is using

* Visit your Web App URL in Chrome.
* Go to a web page that uses `phone` methods from the `ewebrtc-sdk` library.
* Right-click anywhere on the page. In the pop-up menu, click `Inspect`.
* In the DevTools window, click `Console`.
* In Console, type the command: `ATT.rtc.Phone.getPhone().getVersion()`.

### Firefox

  *	**No SDK features were tested with Firefox.**

### Upcoming features

The following features will be added soon:

* Firefox browser support
* AT&T Mobile Number support

# v1.1.2
May 26, 2016

* **Fix:** User not found error when trying to start conference on Chrome v51.
* **Fix:** Cannot put conference on hold on Chrome v51.

## Known Issues

### SDK Issues

#### Basic Call
* After the caller has upgraded the media, there is no audio from the recipient when resuming a call. 
* Redirect URIs with invalid values need a better error message. 
* Auto-resume fails when dialing a second call and that call is canceled or rejected. 

#### Basic Conference
* If a user logs out during a conference, the `disconnectConference` method is not getting called. 

#### Move
* If a move is done twice from the recipient's side, the result is one-way audio/video. 
* When move is initiated, the caller's devices start ringing. However, if the recipient  disconnects, the caller received no notification of the disconnection, and his/her devices keep ringing. 
* There is one-way audio after successfully transferring a video call from a browser to a mobile number handset. 

#### Transfer
* Camera not released after a successful transfer. 

### Platform  Defects

#### Scenarios affected by Conference Issue:
* When a user starts a conference and invites a mobile device user, and the mobile device user rejects the invitation, user does not receive an invitation rejected event. 
* Adding a mobile device user as a participant to a video conference results in one-way audio. 
* When a participant leaves a conference by using the `endConference` method, the platform does not generate the necessary event to inform the host. 

#### Scenarios affected by the SSL role Issue:
* Hold-resume from the recipient fails after the recipient does the upgrade. 
* An SSL-role error is given when trying to upgrade request from the the recipient's side after the recipient has rejected a previous upgrade request from the caller. 
* Reject downgrade from the recipient fails with an SSL-role error. 
* Reject upgrade from the caller fails when the call has previously been upgraded by the recipient. 
* Hold, move failed from the caller's side after a successful upgrade from the recipient. 
* Upgrade from the recipient, after a successful reject upgrade, fails with an SSL-role error. 
* Upgrade, hold, resume, and move fail with an SSL-role error after a downgrade is rejected  by the caller. 
* Upgrade from the caller fails after the upgrade request has been rejected by the caller.  
* Move/hold call from the recipient fails after a successful upgrade reject from the caller side. 
* SSL-role error when the recipient puts the caller on hold after a successful upgrade. 
* SSL-role error when accepting a media modification initiated by the recipient. 

#### Scenarios affected by the ICE-ufrag Issue:
* Hold from the recipient returns ICE-ufrag error after downgrade from the caller or the recipient. 
* Upgrade the recipient's media after downgrading the recipient's media returns an ICE-ufrag error. 
* Reject, upgrade doesn't work from the recipient's side after a downgrade from the caller. 
* Hold after reject from the recipient fails. 
* Modifying the call multiple times from the recipient's side throws the error: Failed to set remote offer SDP: Called with SDP without ICE-ufrag and ICE-pwd. 
* Resume from transferee results in the transfer target returning the error: Failed to set remote offer SDP: Called with SDP without ICE-ufrag and ICE-pwd. 

#### Scenarios affected by the Move Issue:
* After a successful downgrade, a move from the recipient shows as a downgrade request. 
* Move caller after downgrade caller fails. 
* If a call originates from a Virtual Number or an Account ID, and a call move is attempted by the caller, the call will drop. If the call is moved by the recipient, the move is successful. 

#### Media Issues:
* Video streaming issues occur when the caller downgrades and then upgrades the call. 
* Video switching between the participants is sometimes inconsistent. If you turn off your microphone while the other participant speaks, the video will be switched to the speaking participant. 
* After rejecting an upgrade or downgrade, putting a call on hold and then resuming the call results in no video. 

#### IPv6 media Issue:
* The media stream may not function correctly unless IPv6 is disabled. The default behavior is to use IPv4, so the developer doesn't need to explicitly disable IPv6. 

## Notes
* Establishing calls with Firefox is notably slower than doing so with Chrome.
* Transferring to a non-provisioned mobile device target fails while in a video call. The transfer fails with this error: `There was an error transferring the call. Forbidden`.  (Platform unsupported)

## Tested Environments

* Chrome Version v47.0 for OSX v10.11.1 and Windows 8

**_The SDK may also work for other operating systems and browsers but they were not tested or supported._**


# Changelog

## v1.1.1                                    

April 29, 2016

* **Fix:** Undefined event's attributes value.
* **NEW:** SDK: Provide New Method to Refresh & Invoke Token in OAuth-v4.

## v1.1.0                                     

April 8, 2016

* **Removed:** Merged associatedAccessToken and Login function into one Login function which takes userId as optional parameter.
* **Fix:** Remove domains other than `127.0.0.1` from domain CORS header.
* **Fix:** Fixed the media:established event not fired from the callee side.

## v1.0.6

December 4, 2015

* **Fix:** `MediaStream.stop()` is deprecated and is removed in Chrome v47.
* **Fix:** When hold-resume by the caller is followed by another hold-resume by the recipient, it results in no media.
* **Fix:** The SDK fails to refresh the session after expire.

## v1.0.4                                       

October 12, 2015

* **New:** Handle Network Disconnection and Reconnection.
* **New:** connectivity:on and connectivity:off event for network detection.

## v1.0.3

September 11, 2015

* **Fix:** When rejecting a conference invitation, the host gets an 'unrecognized error' notification.
* **Fix:** SDK doesn't fire `call:rejected` event for the caller.
* **Fix:** Adding a participant to the conference logs __"Successfully added participant"__ instead of __"Successfully sent invitation to participant"__.
* **Fix:** The list of participants is not cleared when ending a conference.
* **Fix:** An audio feedback loop occurs when making calls in v1.0.2.

## v1.0.2

August 28, 2015

* **Fix:** The method `phone.on` throws an error but does not publishing it.
* **Fix:** gitHub-hosted tutorial documentation links are broken.
* **Fix:** No timestamp for error messages.
* **Fix:** No documentation for transfer events: `call:transferring` and `call:transferred`.
* **Fix:** `call:hold` and `call:resume` events are not triggered when caller/recipient does hold and resume more than once.

## v1.0.1

August 21, 2015

* **Fix:** Standardize errors that the SDK publishes
* **Fix:** Add SDK error codes to the API docs
* **Fix:** Add all API errors to the SDK - API error dictionary.
* **Fix:** API error not caught for SVC001 when dialing yourself as the account ID user.
* **Fix:** Publish a `call:resumed` event for the party who was put on hold.
* **Fix:** Auto resume fails when dialing a second call and the call is canceled or rejected.
* **Fix:** There is no timestamp on `error` and `session:ready` events.
* **Fix:** One-way media after transferring users with video media to target users with audio media.
* **Fix:** Recipient user on the browser is not publishing `media:established` event.

## v1.0.0

August 14, 2015

* **Fix:** A move from the recipient side has one way audio video when done twice.
* **New:** New method `Phone.getVersion` to retrieve the SDK version.
* **New:** New event 'gateway-unreachable' on phone to capture '502' and '503' errors.
* **New:** Handling conference invitations when there is an active call or conference.

## v1.0.0-rc.27

July 31, 2015

* **Fix:** Adding a second call doesn't work after putting the first call on hold.
* **Fix:** Dial method should return an error when there is an active call.
* **Fix:** Error for phone.acceptModifications should be handled gracefully if there is no modification data on the current call.
* **Fix:** Media fails when canceling second outgoing call.
* **Fix:** Media fails if rejecting an incoming call while another call is in progress.
* **Fix:** The original call from first user (already on hold) when a second call is cancelled should be resumed successfully with media on both sides.
* **Fix:** Two Way Hold: When the caller put the recipient on hold, the recipient cannot put the caller on hold.
* **Fix:** Move after being put on hold is not working.


## v1.0.0-rc.26

July 22, 2015

* **Fix:** SDK error occurs when trying to send a DTMF tone while a call is on hold.
* **Fix:** SDK should put the current call on hold while dialing a new number using `phone.dial`.

## v1.0.0-rc.25

July 16, 2015

* **New:** Ability to send DTMF (dialing) tones.
* **New:** API for setting and resetting audio codecs to the user during the call.
* **Fix:** Upgrading a muted call re-enables audio on both sides.
* **Fix:** Downgrading a muted call re-enables audio on both sides.
* **Fix:** When moving a call using `Phone.move`, the error message `Unrecognized event state: move-terminated` appears in the browser console. The move operation is successful.
* **Fix:** Switching to the background call results in no media.
* **Fix:** Inability to put a muted call on hold.

## v1.0.0-rc.24

July 13, 2015

* **Fix:** One-way audio after holding and resuming a call from the recipient's side.
* **Fix:** No error is thrown when trying to modify a call that's in a hold state.
* **Fix:** No error is thrown when trying to move a call that's in a hold state.
* **Fix:** When the recipient in an audio-only call puts the caller on hold and tries to move the call, the phone doesn't ring and both users get disconnected.
* **Fix:** When the recipient in an audio-only call puts the caller on hold and caller tries to move the call, the phone doesn't ring and there is no media flow between both the caller and the recipient.
* **Fix:** Recipient is allowed to upgrade when put on hold by the caller.
* **Fix:** Moving a second call will display a `connecting` notification after a call is connected for a user with two calls.
* **Fix:** If Bob puts Alice on hold successfully, the state of Alice's call should be on hold.
* **Fix:** Foreground call loses media if the background call is disconnected by the other party.
* **Fix:** SDP Parsing Error: c= connection line not specified for every media level, validation failed when moving a call to a mobile phone.
* **Fix:** The SDK does not generate a `media:established` event on the recipient's side when answering an incoming call.

## v1.0.0-rc.23

July 2, 2015

* **Fix:** Upgrade after downgrade doesn't work due a known issue with the underlying platform.
* **Fix:** Moving Video Call from Browser to Browser fails when in call with a provisioned Mobile Device.
* **Fix:** Transfer from Browser to a Provisioned non-VoLTE Mobile device fails with different reasons.
* **Fix:** When holding a call after successfully downgrading it, the `Phone.hold` method fails with error message: `SVC0001:A service error has occurred. Error code is Parameter 'sdp' has invalid format.,Variables=Parameter 'sdp' has invalid format`.
* **Fix:** When downgrading a call after successfully resuming it, the `Phone.downgrade` method fails with error message: `SVC0001:A service error has occurred. Error code is Parameter 'sdp' has invalid format.,Variables=Parameter 'sdp' has invalid format`.
* **Fix:** Downgrade fails after successful Call Move.
* **Fix:** Recipient can resume a call that has been held by hold initiator.

## v1.0.0-rc.22

June 12, 2015

* **Fix:** Improved documentation on number format when dialing and adding participants to a conference.
* **Fix:** Wrong video media type shown when making calls from the browser to mobile devices.
* **New:** New method: `Phone.rejectModification`. This method allows the user to reject media modification requests such as upgrade requests generated by the `Phone.upgrade` method or downgrade requests generated by the `Phone.downgrade` method.
* **New:** The ability to automatically reject a call modification in the sample app if it’s not accepted after five seconds.

## v1.0.0-rc.21

June 5, 2015

* **Fix:** One-way audio on a non-provisioned VoLTE handset following call transfer.

## v1.0.0-rc.20

June 2, 2015

* **New:** The ability to upgrade an audio call to video call.

## v1.0.0-rc.19

May 29, 2015

* **Fix:** The object returned by `getCallerInfo()` is improperly formatted for Account ID users.
* **Fix:** The sample app shows a username encoded as a number for Account ID users.
* **Fix:** Intermittent `ice-ufrag` error occurs when answering a call.

## v1.0.0-rc.18

May 22, 2015

* **Fix:** Mobile Number users with VoLTE devices are unable to answer incoming calls. The call keeps ringing and eventually goes to voicemail.

## v1.0.0-rc.17

May 15, 2015

* **Fix:** Setting the global logging level to trace generates a JavaScript error while making a call.
* **Fix:** An error occurs when transferring a call.
* **Fix:** The video call quality on a call holder's side is extremely poor when the recipient is taken off of hold.
* **Fix:** Transfer to a provisioned phone fails when in a video call with a non-provisioned phone.
* **Fix:** Transferring a call fails with HTTP Status Code `409`, when an Account ID user transfers to a mobile device.


## v1.0.0-rc.16

April 16, 2015

* **New:** New `ATT.logManager` features:
  * `getLogLevels`: Method to get all defined log levels for the log manager.
  * `getCurrentModuleLogLevels`: Method to get the current modules with their defined log levels.
  * `getGlobalLogLevel`: Method to get the current log level for all modules.
  * `setGlobalLogLevel`: Method to set a log level for all the modules.
  * `resetLogLevels`: Method to reset log levels to default for all modules.
  * `getLoggers`: Method to get the log manager's list of modules.
  * `getModuleDefaults`: Method to get the modules with defined default log levels.
  * `createCustomLogger`: Method to create a custom logger by passing a module name.
  * `deleteCustomLogger`: Method to delete a custom logger by passing a module name.
* **Changed:** Changed `ATT.logManager` feature
    * `getLogger`: Method to get the logger object by passing the module name.
* **Removed:** Removed from `ATT.logManager`
  * `addLoggerForModule`
  * `configureLogger`
  * `getLoggerByName`
  * `logLevel`
  * `loggerType`
  * `LOG_LEVEL`
  * `LOGGER_TYPE`
* **New:** New `ATT.logManager.Logger` features:
  * `isCustomType`: Returns true if a custom Logger
  * `setLogLevel`: Sets log level of Logger
  * `getLogLevel`: Gets log level of Logger
* **Removed:** Removed from `ATT.logManager.Logger`
  * `level`
  * `setLevel`
  * `setType`
  * `Type`
* **New:** Methods to manage configuration for `RTCPeerConnection`.
  * `getIceServers`: Function to get the current ICE servers that the SDK uses for creating peer connections.
  * `setIceServers`: Method to set the list of ICE servers that the SDK uses for creating peer connections.
  * `resetIceServers`: Method to reset the list of ICE servers to default list for peer connection configuration.
  * `getIceTransport`: Function to get the current ICE transport value that the SDK uses for creating peer connections.
  * `setIceTransport`: Method to set the ICE transport that the SDK uses for creating peer connections.
  * `resetIceTransport`: Method to reset the ICE transport value to the value for peer connection configuration.
  * `getIpv6`: Function to get the ipv6 value that the SDK uses for creating peer connections.
  * `setIpv6`: Method to set the ipv6 value that the SDK uses for creating peer connections.
  * `resetIpv6`: Method to reset the ipv6 to the default value for peer connection configuration.

## v1.0.0-rc.15

April 3, 2015

* **Fix:** Users cannot log in again using the same access token.
* **Fix:** The SDK can dial a second call by putting the previous call on hold automatically.
* **Fix:** The Video stream is dropped when a video call is on hold for 15 minutes or more before the call is resumed.

## v1.0.0-rc.14

March 22, 2015

* **New:** DHS functions are now available as a public module named `att-dhs`. You can use this as you would a regular node module.
* **Removed:**
 * The stand-alone node-dhs is removed. DHS functions are now available in the `att-dhs` public module. You can use these DHS functions in your own Node.js app. An illustrative example is provided in the /node-sample/ folder.
 * The ATT.rtc.dhs namespace is deleted. Use the migration guide for code snippets to invoke sample app DHS routes.
 * The  ATT.rtc.configure method is no longer needed.
* **Removed:**
 * DHS routes are now in /node-sample/.
 * `restify-dhs` is optional, use this only if you want a standalone DHS.
* **Fix:** The `phone.logout` method will always return after cleaning up session and call resources, if any.

## v1.0.0-rc.13

March 6, 2015

* **Fix:** Call index is the same for two calls in phone.getCalls().
* **New:** DHS Library: A new server-side Node.js-based library to provide OAuth tokens and E911 ID methods.
    * This will replace a separate server for DHS.
    * The DHS-specific configuration (e.g., app key, app secret) can now be done on the sample server itself
    * Please refer to the DHS Library JSDocs and ReadMe for further information.
* **Change:** The following SDK methods are changed. **Please update your Web application accordingly.**
    * ATT.rtc.dhs.createAccessToken is now ATT.rtc.createAccessToken
    * ATT.rtc.dhs.createE911Id is now ATT.rtc.createE911Id
    * ATT.rtc.configure now has a new signature. Please refer to the SDK API JSDocs for updates to this method.
* **Change:** The sample app is now launched by navigating to `https://localhost:9001`.
    * You must still add a security exception for `https://localhost:9001` to your browser.
    * Please refer to the ReadMe for more information.



## v1.0.0-rc.12

February 20, 2015

* **Fix:** Multiple Login Failed errors appear in succession, concatenating when the page is not refreshed.
* **Fix:** No audio on handset following a call move.
* **Fix:** Move call unnecessarily fires call:connected and media:established events and throws a JS exception.

* **New:** The Call-id in the event object will be a complete URI instead of parsed numbers or ID.
  * Added the new method getCallerInfo(callerUri), to parse the raw URI to the return information such as callerId, protocol, domain, port, and other associated information.


## v1.0.0-rc.11

February 6, 2015

* **Fix:** The DHS and the Sample App now use the IP address `127.0.0.1` instead of the hostname `localhost` so that the developer only has to add one SSL security exception.
* **Fix:** The video camera remains on after disconnecting a call.
* **Fix:** Unable to uniquely track two calls to the same number. QC 74097.
  * Event data associated with a call/conference event now has an `index` that refers to the ordinal numbering of the call in the list of existing calls.
  * Public method `phone.getCalls` updated to return call `index`, `breed`, `type`, `state` and `peer`/`participants`.
* **New:** The Developer Hosted Server now uses AT&T OAuth v4.0.

## v1.0.0-rc.10

January 22, 2015

* **Fix:** The `Phone` object will publish an error event if an unsupported scenario for a second call occurs. The second call feature only supports simple two-call scenarios, with one call in the background (inactive) and one call in the foreground (active). Scenarios that would result in the user having one call and one conference are not supported and will generate an error.
* **Fix:** `Phone.transfer` fails with error `Transfer terminated by Network` when the transfer target is an Account ID or a Virtual Number user.
* **Fix:** Corrected various typos in log statements.
* **Fix:** Moving a call fails when the call is put on hold before invoking `Phone.move`.
* **Change:** Use a short user name on `Phone` events (`event.from` and `event.to`):
  * Account ID: `sip:user@domain.com` => `user`
  * Mobile Number: `sip:1234567890@domain.com` => `1234567890`
  * Virtual User: `tel:+1234567890` => `1234567890`
* **New:** The `phone` object will publish a `session:expired` event when the library detects that the current session has expired on the server. See the documentation for details in the payload of the event.
* **New:** Use method `ATT.browser.isNetworkConnected` to check for network connectivity.

## v1.0.0-rc.9

December 31, 2014

* **Enhancement:** Added 'session:expired' event to the `phone` object.
* **Enhancement:** Improved call establishment time.
* **Change:** Less verbose logging.
* **Change:** Provided full user name on event data for all phone events.

## v1.0.0-rc.7

### Features

#### Chrome v39

* Basic audio and video call management – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls.
* Basic audio and video conferencing – create a conference, add and remove participants, hold, resume, mute, unmute, and end conference.
* Advanced call management – move, transfer, add a second call, and switch between two calls
* Audio and video calls can be moved browser-to-browser.
* Audio calls can be moved from a browser to an AT&T mobile phone.

#### Firefox v33

* Basic audio and video call management – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls.
* Basic audio and video conferencing – create a conference, add and remove participants, hold, resume, mute, unmute, and end conference.
