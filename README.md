<div align="center">
  
  # NativeScript NFC Plugin

  [![Static Badge](https://img.shields.io/badge/Ontrack-The_Smarter_Works_Management_Solution-B1BF21)][2]

  [![NPM](https://img.shields.io/npm/v/%40ontrackms%2Fnativescript-nfc)][0]
  [![GitHub License](https://img.shields.io/github/license/ontrackms/nativescript-nfc)][1]

  NativeScript plugin to discover, read, and write NFC tags

</div>

## Installation
From the command prompt go to your app's root folder and execute:

```
npm i @ontrackms/nativescript-nfc
```

## iOS Setup
iOS requires you to enable 'NFC Tag Reading' for your App ID [here](https://developer.apple.com/account/ios/identifier/bundle).

Also, add this to your `App_Resources/iOS/app.entitlements` (mind the name!) file:
 
```xml
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
	<string>NDEF</string>
</array>
```

## Usage
```js
import { Nfc } from '@ontrackms/nativescript-nfc';
const Nfc = new Nfc();
```

## API

### `Nfc.available`
Not all devices have an NFC chip we can tap in to (and on iOS you need to build with Xcode 9+), so check this beforehand:

```typescript
available(): Promise<boolean>
```

### `Nfc.enabled`
A device may have an NFC chip, but it needs to be turned on ✅ in order to be available for this plugin. So if `available` returns `true` and `enabled` returns `false` you should prompt the user to turn NFC on in the device settings.

```typescript
enabled(): Promise<boolean>
```

### `Nfc.setOnNdefDiscoveredListener`
You may want to get notified when an Ndef tag was discovered. You can pass in a callback function that gets invoked when that is the case.

Note that blank/erased NFC tags are not returned here, but through `setOnTagDiscoveredListener` instead.

See the [definition of NfcNdefData](https://github.com/ontrackms/nativescript-nfc/blob/master/nfc.common.d.ts#L27-L33) to learn what is returned to the callback function.

For iOS you can pass in these options (see the TypeScript example below):
* `stopAfterFirstRead: boolean` (default `false`): don't continue scanning after a tag was read. 
* `scanHint: string` (default `undefined`): Show a little hint in the scan UI.

```js
setOnNdefDiscoveredListener(callback: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<void>
```

##### TypeScript
```typescript
import { NfcNdefData } from "@ontrackms/nativescript-nfc";

nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
  // data.message is an array of records, so:
  if (data.message) {
    for (let m in data.message) {
      let record = data.message[m];
      console.log("Ndef discovered! Message record: " + record.payloadAsString);
    }
  }
}, {
  // iOS-specific options
  stopAfterFirstRead: true,
  scanHint: "Scan a tag, baby!"
}).then(() => {
    console.log("OnNdefDiscovered listener added");
});
```

You can pass in `null` instead of a callback function if you want to remove the listener.

##### TypeScript
```typescript
nfc.setOnNdefDiscoveredListener(null).then(() => {
    console.log("OnNdefDiscovered listener removed");
});
```

### `Nfc.setOnTagDiscoveredListener`
You may want to get notified when an NFC tag was discovered.
You can pass in a callback function that gets invoked when that is the case.

Note that Ndef tags (which you may have previously written data to) are not returned here,
but through `setOnNdefDiscoveredListener` instead.

See the [definition of NfcTagData](https://github.com/ontrackms/nativescript-nfc/blob/master/nfc.common.d.ts#L14-L17) to learn what is returned to the callback function.

```ts
setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<void>
```

##### TypeScript
```typescript
import { NfcTagData } from "@ontrackms/nativescript-nfc";

nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
  console.log("Discovered a tag with ID " + data.id);  
}).then(() => {
    console.log("OnTagDiscovered listener added");
});
```

You can pass in `null` instead of a callback function if you want to remove the listener.

##### TypeScript
```typescript
nfc.setOnTagDiscoveredListener(null).then(() => {
    console.log("OnTagDiscovered listener removed");
});
```

### `writeTag` (Android only)
You can write to a tag as well with this plugin. At the moment you can write either plain text or a Uri. The latter will launch the browser on an Android device if the tag is scanned (unless an app handling Ndef tags itself is active at that moment, like an app with this plugin - so just close the app to test this feature).

Note that you can write multiple items to an NFC tag so the input is an object with Arrays of various types (`textRecord` and `uriRecord` are currently supported). See the [TypeScript definition](https://github.com/ontrackms/nativescript-nfc/blob/master/nfc.common.d.ts#L10-L13) for details, but these examples should get you going:

##### Writing 2 textRecords in JavaScript
```js
nfc.writeTag({
    textRecords: [
        {
          id: [1],
          text: "Hello"
        },
        {
          id: [3,7],
          text: "Goodbye"
        }
    ]
}).then(function() {
    console.log("Wrote text records 'Hello' and 'Goodbye'");
}, function(err) {
    alert(err);
});
```

##### Writing a uriRecord in TypeScript
```typescript
nfc.writeTag({
    uriRecords: [
        {
          id: [100],
          uri: "https://www.progress.com"
        }
    ]
}).then(() => {
    console.log("Wrote Uri record 'https://www.progress.com");
}, (err) => {
    alert(err);
});
```

### `eraseTag` (Android only)
And finally, you can erase all content from a tag if you like.

##### JavaScript
```js
nfc.eraseTag().then(
  function() {
    console.log("Tag erased");
  }
);
```

##### TypeScript
```typescript
nfc.eraseTag().then(() => {
    console.log("Tag erased");
});
```

## Tips
### Writing to an empty tag
You first need to "discover" it with `setOnTagDiscoveredListener` (see below). While you're still "near" the tag you can call `writeTag`.

### Writing to a non-empty tag
Same as above, but discovery is done through `setOnNdefDiscoveredListener`.

## Demo app (those screenshots above)
Want to dive in quickly? Check out [the demo](https://github.com/EddyVerbruggen/nativescript-nfc/tree/master/demo)!

You can run the demo app from the root of the project by typing `npm run demo.ios.device` or `npm run demo.android`.

> [This is what it looks like in action on iOS](https://twitter.com/eddyverbruggen/status/899617497741185025)!

## Future work
* Peer to peer communication between two NFC-enabled devices.
* Support for writing other types in addition to 'text' and 'uri'.
  
[0]: https://www.npmjs.com/package/@ontrackms/nativescript-nfc
[1]: https://github.com/ontrackms/nativescript-nfc?tab=MIT-1-ov-file
[2]: https://ontrackms.com
