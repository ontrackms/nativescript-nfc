declare class NfcNativeHelper extends NSObject {

	static alloc(): NfcNativeHelper; // inherited from NSObject

	static new(): NfcNativeHelper; // inherited from NSObject

	getTagUID(tag: NFCTag): NSData;
	tagUIDToString(data: NSData): string;
}