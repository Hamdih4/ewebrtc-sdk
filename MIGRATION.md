# JavaScript SDK for AT&T Enhanced WebRTC API
> #### Web SDK Migration Guide from older versions to newer versions

### Methods By Release Summary Table

<table>
  <th>#</th>
  <th>Release</th>
  <th>Feature</th>
  <th>Deprecated Method</th>
  <th>Replacement Method</th>

  <tr>
    <td>1</td>
    <td>v1.0.0-rc.24</td>
    <td>Basic Conference Management</td>
    <td>Phone.addParticipants</td>
    <td>Phone.addParticipant</td>
  </tr>

  <tr>
    <td>2</td>
    <td>v1.1.0</td>
    <td>Session Management</td>
    <td>Phone.associateAccessToken</td>
    <td>Phone.login</td>
  </tr>

</table>

## v1.0.0-rc.24

#### Methods Summary Table

<table>
  <th>#</th>
  <th>Feature</th>
  <th>Deprecated Method</th>
  <th>New Method</th>

  <tr>
    <td>1</td>
    <td>Basic Conference Management</td>
    <td>Phone.addParticipants</td>
    <td>Phone.addParticipant</td>

  </tr>
</table>

#### Basic Conference Management
>##### 1. Phone.addParticipants
 `Phone.addParticipants` was deprecated in this release, and replaced by `Phone.addParticipant` to perform the same functionality by adding a single participant at a time to the Conference. Adding multiple participants is no longer supported, it can be done by following below example.

##### Examples:
* Using the deprecated method: `addParticipants`
```
phone.addParticipants(['11231231234', 'john@domain.com']);
```

* Using the new method: `addParticipant`
```
phone.addParticipant('11231231234');
```
* The example below explains how to achieve the same old behavior:
```
var index = 0,
    participants_list = ['11231231234','1234567890','1987654321'];
// Create a function to add next participant in the list
function addNextParticipant() {
    index++;
    phone.addParticipant(participants_list[index]);
}
// Once the first participant was successfully added, add the next one
phone.on('conference:invitation-sent', addNextParticipant);
// Executing the first addParticipant
Phone.addParticipant(participants_list[0]);
```

## v1.1.0

#### Methods Summary Table

<table>
  <th>#</th>
  <th>Feature</th>
  <th>Deprecated Method</th>
  <th>Alternative Method</th>

  <tr>
    <td>1</td>
    <td>Session Management</td>
    <td>Phone.associateAccessToken</td>
    <td>Phone.login</td>

  </tr>
</table>

#### Session Management
>##### 1. Phone.associateAccessToken
 `Phone.associateAccessToken` was deprecated in this release, and replaced by `Phone.login` to perform the same functionality by associating the token with the user at the time when `Phone.login()` is invoked.

##### Examples:
* Using the deprecated method: `associateAccessToken`
```
phone.associateAccessToken({
    userId: 'john',
    token: 'access_token',
    success: success,
    error: error
});
```

* Using the existing method: `login`
```
phone.login({
    userId: 'john',
    token: 'access_token',
    e911Id: 'e911_id',
});
```
