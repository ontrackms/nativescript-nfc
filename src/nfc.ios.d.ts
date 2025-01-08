import { NdefListenerOptions, NfcApi, NfcNdefData, NfcTagData, WriteTagOptions } from "./nfc.common";
export interface NfcSessionInvalidator {
    invalidateSession(): void;
}
export declare class Nfc implements NfcApi, NfcSessionInvalidator {
    private session;
    private delegate;
    private tagDelegate;
    writeMode: boolean;
    shouldUseTagReaderSession: boolean;
    messageToWrite: NFCNDEFMessage;
    private traceCategory;
    private static _available;
    setTraceCategory(category: string): void;
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(callback: (data: NfcTagData | NSError) => void, options?: NdefListenerOptions): Promise<void>;
    setOnNdefDiscoveredListener(callback: (data: NfcNdefData | NSError) => void, options?: NdefListenerOptions): Promise<void>;
    invalidateSession(): void;
    stopListening(): Promise<void>;
    writeTag(arg: WriteTagOptions): Promise<void>;
    eraseTag(): Promise<void>;
    startScanSession(callback: (data: NfcTagData | NSError) => void, options?: NdefListenerOptions): void;
}
