import { NdefListenerOptions, NfcApi, NfcNdefData, NfcNdefRecord, NfcTagData, WriteTagOptions } from "./nfc.common";
export declare class NfcIntentHandler {
    savedIntent: android.content.Intent;
    constructor();
    parseMessage(): void;
    byteArrayToJSArray(bytes: any): Array<number>;
    byteArrayToJSON(bytes: any): string;
    bytesToHexString(bytes: any): string;
    bytesToString(bytes: any): string;
    techListToJSON(tag: any): Array<string>;
    ndefToJSON(ndef: android.nfc.tech.Ndef): NfcNdefData;
    messageToJSON(message: android.nfc.NdefMessage): Array<NfcNdefRecord>;
    recordToJSON(record: android.nfc.NdefRecord): NfcNdefRecord;
}
export declare const nfcIntentHandler: NfcIntentHandler;
export declare class Nfc implements NfcApi {
    private pendingIntent;
    private intentFilters;
    private techLists;
    private static firstInstance;
    private created;
    private started;
    private intent;
    private nfcAdapter;
    private traceCategory;
    constructor();
    setTraceCategory(category: string): void;
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<void>;
    setOnNdefDiscoveredListener(callback: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<void>;
    eraseTag(): Promise<void>;
    writeTag(arg: WriteTagOptions): Promise<void>;
    private initNfcAdapter;
    private writeNdefMessage;
    private jsonToNdefRecords;
    private stringToBytes;
}
