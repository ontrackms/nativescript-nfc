"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nfc = void 0;
var nfc_common_1 = require("./nfc.common");
var core_1 = require("@nativescript/core");
var Nfc = /** @class */ (function () {
    function Nfc() {
        this.writeMode = false;
        this.shouldUseTagReaderSession = false;
        this.traceCategory = core_1.Trace.categories.Debug;
    }
    Nfc._available = function () {
        var isIOS11OrUp = NSObject.instancesRespondToSelector("accessibilityAttributedLabel");
        if (isIOS11OrUp) {
            try {
                return NFCNDEFReaderSession.readingAvailable;
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    };
    Nfc.prototype.setTraceCategory = function (category) {
        this.traceCategory = category;
    };
    Nfc.prototype.available = function () {
        return new Promise(function (resolve, reject) {
            resolve(Nfc._available());
        });
    };
    Nfc.prototype.enabled = function () {
        return new Promise(function (resolve, reject) {
            resolve(Nfc._available());
        });
    };
    Nfc.prototype.setOnTagDiscoveredListener = function (callback, options) {
        var _this = this;
        core_1.Trace.write('nativescript-nfc ios: setOnTagDiscoveredListener', this.traceCategory);
        return new Promise(function (resolve, reject) {
            if (!Nfc._available()) {
                reject();
                return;
            }
            if (callback === null) {
                core_1.Trace.write('nativescript-nfc ios: setOnTagDiscoveredListener no callback, invalidating session', _this.traceCategory);
                _this.invalidateSession();
                resolve();
                return;
            }
            _this.writeMode = false;
            _this.shouldUseTagReaderSession = true;
            try {
                _this.startScanSession(callback, options);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    Nfc.prototype.setOnNdefDiscoveredListener = function (callback, options) {
        var _this = this;
        core_1.Trace.write('nativescript-nfc ios: setOnNdefDiscoveredListener', this.traceCategory);
        return new Promise(function (resolve, reject) {
            if (!Nfc._available()) {
                reject();
                return;
            }
            if (callback === null) {
                core_1.Trace.write('nativescript-nfc ios: setOnNdefDiscoveredListener no callback, invalidating session', _this.traceCategory);
                _this.invalidateSession();
                resolve();
                return;
            }
            _this.writeMode = false;
            _this.shouldUseTagReaderSession = false;
            try {
                _this.startScanSession(callback, options);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    Nfc.prototype.invalidateSession = function () {
        if (this.session) {
            this.session.invalidateSession();
            this.session = undefined;
        }
    };
    Nfc.prototype.stopListening = function () {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    };
    Nfc.prototype.writeTag = function (arg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.writeMode = true;
                _this.shouldUseTagReaderSession = false;
                _this.messageToWrite = NfcHelper.jsonToNdefRecords(arg);
                _this.startScanSession(function () { }, {
                    stopAfterFirstRead: false,
                    scanHint: "Hold near writable NFC tag to update."
                });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    Nfc.prototype.eraseTag = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.writeMode = true;
                _this.shouldUseTagReaderSession = false;
                _this.messageToWrite = NfcHelper.ndefEmptyMessage();
                _this.startScanSession(function (data) { }, {
                    stopAfterFirstRead: false,
                    scanHint: "Hold near writable NFC tag to erase."
                });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    /* Common Processing */
    Nfc.prototype.startScanSession = function (callback, options) {
        var _this = this;
        if (this.shouldUseTagReaderSession) {
            core_1.Trace.write("Create and start NFCTagReaderSession", this.traceCategory);
            this.tagDelegate = NFCTagReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(new WeakRef(this), core_1.Utils.mainThreadify(function (data) {
                if (!callback) {
                    core_1.Trace.write("Tag discovered, but no listener was set via setOnTagDiscoveredListener. Ndef: " + JSON.stringify(data), _this.traceCategory);
                }
                else {
                    // execute on the main thread with this trick, so UI updates are not broken
                    Promise.resolve().then(function () { return callback(data); });
                }
            }), options);
            this.session = NFCTagReaderSession.alloc().initWithPollingOptionDelegateQueue(1 /* NFCPollingOption.ISO14443 */ | 2 /* NFCPollingOption.ISO15693 */, this.tagDelegate, null);
        }
        else {
            core_1.Trace.write("Create and start NFCNDEFReaderSession", this.traceCategory);
            this.delegate = NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(new WeakRef(this), core_1.Utils.mainThreadify(function (data) {
                if (!callback) {
                    core_1.Trace.write("Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: " + JSON.stringify(data), _this.traceCategory);
                }
                else {
                    // execute on the main thread with this trick, so UI updates are not broken
                    Promise.resolve().then(function () { return callback(data); });
                }
            }), options);
            this.session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(this.delegate, null, options && options.stopAfterFirstRead);
        }
        if (options && options.scanHint) {
            core_1.Trace.write('Setting scan hint: ' + options.scanHint, this.traceCategory);
            this.session.alertMessage = options.scanHint;
        }
        core_1.Trace.write('Begin scanning session', this.traceCategory);
        this.session.beginSession();
    };
    return Nfc;
}());
exports.Nfc = Nfc;
var NfcHelper = /** @class */ (function () {
    function NfcHelper() {
    }
    NfcHelper.getTagUIDAsInt8Array = function (tag) {
        return this.nsDataToInt8Array(this.getTagUID(tag));
    };
    NfcHelper.getTagUID = function (tag) {
        var nfcNHelper = NfcNativeHelper.new();
        var uid = nfcNHelper.getTagUID(tag);
        return uid;
    };
    NfcHelper.ndefEmptyMessage = function () {
        var type = this.uint8ArrayToNSData([]);
        var id = this.uint8ArrayToNSData([]);
        var payload = this.uint8ArrayToNSData([]);
        var record = NFCNDEFPayload.alloc().initWithFormatTypeIdentifierPayload(0 /* NFCTypeNameFormat.Empty */, type, id, payload);
        var records = NSMutableArray.new();
        records.addObject(record);
        return NFCNDEFMessage.alloc().initWithNDEFRecords(records);
    };
    NfcHelper.jsonToNdefRecords = function (arg) {
        var _this = this;
        var records = NSMutableArray.new();
        if (arg.textRecords !== null) {
            arg.textRecords.forEach(function (textRecord) {
                var type = _this.uint8ArrayToNSData([0x54]);
                var ids = [];
                if (textRecord.id) {
                    for (var j = 0; j < textRecord.id.length; j++) {
                        ids.push(textRecord.id[j]);
                    }
                }
                var id = _this.uint8ArrayToNSData(ids);
                var langCode = textRecord.languageCode || "en";
                var encoded = _this.stringToBytes(langCode + textRecord.text);
                encoded.unshift(langCode.length);
                var payloads = [];
                for (var n = 0; n < encoded.length; n++) {
                    payloads[n] = encoded[n];
                }
                var payload = _this.uint8ArrayToNSData(payloads);
                var record = NFCNDEFPayload.alloc().initWithFormatTypeIdentifierPayload(1 /* NFCTypeNameFormat.NFCWellKnown */, type, id, payload);
                records.addObject(record);
            });
        }
        // TODO: implement for URI records
        return NFCNDEFMessage.alloc().initWithNDEFRecords(records);
    };
    NfcHelper.ndefToJson = function (message) {
        if (message === null) {
            return null;
        }
        return {
            message: this.messageToJSON(message)
        };
    };
    NfcHelper.messageToJSON = function (message) {
        var result = [];
        for (var i = 0; i < message.records.count; i++) {
            result.push(this.recordToJSON(message.records.objectAtIndex(i)));
        }
        return result;
    };
    NfcHelper.recordToJSON = function (record) {
        var payloadAsHexArray = this.nsdataToHexArray(record.payload);
        var payloadAsString = this.nsdataToASCIIString(record.payload);
        var payloadAsStringWithPrefix = payloadAsString;
        var recordType = this.nsdataToHexArray(record.type);
        var decimalType = this.hexToDec(recordType[0]);
        if (decimalType === 84) {
            var languageCodeLength = +payloadAsHexArray[0];
            payloadAsString = payloadAsStringWithPrefix.substring(languageCodeLength + 1);
        }
        else if (decimalType === 85) {
            var prefix = nfc_common_1.NfcUriProtocols[payloadAsHexArray[0]];
            if (!prefix) {
                prefix = "";
            }
            payloadAsString = prefix + payloadAsString.slice(1);
        }
        return {
            tnf: record.typeNameFormat, // "typeNameFormat" (1 = well known) - see https://developer.apple.com/documentation/corenfc/nfctypenameformat?changes=latest_major&language=objc
            type: decimalType,
            id: this.hexToDecArray(this.nsdataToHexArray(record.identifier)),
            payload: this.hexToDecArray(payloadAsHexArray),
            payloadAsHexString: this.nsdataToHexString(record.payload),
            payloadAsStringWithPrefix: payloadAsStringWithPrefix,
            payloadAsString: payloadAsString
        };
    };
    NfcHelper.stringToBytes = function (input) {
        var bytes = [];
        for (var n = 0; n < input.length; n++) {
            var c = input.charCodeAt(n);
            if (c < 128) {
                bytes[bytes.length] = c;
            }
            else if ((c > 127) && (c < 2048)) {
                bytes[bytes.length] = (c >> 6) | 192;
                bytes[bytes.length] = (c & 63) | 128;
            }
            else {
                bytes[bytes.length] = (c >> 12) | 224;
                bytes[bytes.length] = ((c >> 6) & 63) | 128;
                bytes[bytes.length] = (c & 63) | 128;
            }
        }
        return bytes;
    };
    NfcHelper.uint8ArrayToNSData = function (array) {
        var data = NSMutableData.alloc().initWithCapacity(array.count);
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            data.appendBytesLength(new interop.Reference(interop.types.uint8, item), 1);
        }
        return data;
    };
    NfcHelper.nsDataToInt8Array = function (data) {
        var buffer = interop.bufferFromData(data);
        return new Int8Array(buffer);
    };
    NfcHelper.nsdataToHexString = function (data) {
        var b = interop.bufferFromData(data);
        return this.buf2hexString(b);
    };
    NfcHelper.nsdataToHexArray = function (data) {
        var b = interop.bufferFromData(data);
        return this.buf2hexArray(b);
    };
    NfcHelper.nsdataToASCIIString = function (data) {
        return this.hex2a(this.nsdataToHexString(data));
    };
    NfcHelper.hex2a = function (hexx) {
        var hex = hexx.toString(); // force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    };
    NfcHelper.hexToDecArray = function (hexArray) {
        var resultArray = [];
        for (var i = 0; i < hexArray.length; i++) {
            var result = 0, digitValue = void 0;
            var hex = hexArray[i].toLowerCase();
            for (var j = 0; j < hex.length; j++) {
                digitValue = '0123456789abcdefgh'.indexOf(hex[j]);
                result = result * 16 + digitValue;
            }
            resultArray.push(result);
        }
        return JSON.stringify(resultArray);
    };
    NfcHelper.buf2hexArray = function (buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), function (x) { return ('00' + x.toString(16)).slice(-2); });
    };
    NfcHelper.buf2hexString = function (buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), function (x) { return ('00' + x.toString(16)).slice(-2); }).join('');
    };
    NfcHelper.hexToDec = function (hex) {
        if (hex === undefined) {
            return undefined;
        }
        var result = 0, digitValue;
        hex = hex.toLowerCase();
        for (var i = 0; i < hex.length; i++) {
            digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
            result = result * 16 + digitValue;
        }
        return result;
    };
    return NfcHelper;
}());
/* NFCTagReaderSessionDelegate */
var NFCTagReaderSessionDelegateImpl = /** @class */ (function (_super) {
    __extends(NFCTagReaderSessionDelegateImpl, _super);
    function NFCTagReaderSessionDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NFCTagReaderSessionDelegateImpl.new = function () {
        try {
            NFCTagReaderSessionDelegateImpl.ObjCProtocols.push(NFCTagReaderSessionDelegate);
        }
        catch (ignore) {
        }
        return _super.new.call(this);
    };
    NFCTagReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions = function (owner, callback, options) {
        var delegate = NFCTagReaderSessionDelegateImpl.new();
        delegate._owner = owner;
        delegate.options = options;
        delegate.resultCallback = callback;
        return delegate;
    };
    NFCTagReaderSessionDelegateImpl.prototype.tagReaderSessionDidDetectTags = function (session, tags) {
        var ids = NfcHelper.getTagUIDAsInt8Array(tags[0]);
        var nfcTagData = {
            id: ids,
            techList: []
        };
        session.invalidateSession();
        this.resultCallback(nfcTagData);
    };
    NFCTagReaderSessionDelegateImpl.prototype.tagReaderSessionDidInvalidateWithError = function (session, error) {
        this._owner.get().invalidateSession();
        this.resultCallback(error);
    };
    NFCTagReaderSessionDelegateImpl.ObjCProtocols = [];
    return NFCTagReaderSessionDelegateImpl;
}(NSObject));
/* NFCNDEFReaderSessionDelegate */
var NFCNDEFReaderSessionDelegateImpl = /** @class */ (function (_super) {
    __extends(NFCNDEFReaderSessionDelegateImpl, _super);
    function NFCNDEFReaderSessionDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NFCNDEFReaderSessionDelegateImpl.new = function () {
        try {
            NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate);
        }
        catch (ignore) {
        }
        return _super.new.call(this);
    };
    NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions = function (owner, callback, options) {
        var delegate = NFCNDEFReaderSessionDelegateImpl.new();
        delegate._owner = owner;
        delegate.options = options;
        delegate.resultCallback = callback;
        return delegate;
    };
    NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidBecomeActive = function (session) { };
    NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidDetectNDEFs = function (session, messages) {
        var _this = this;
        if (this.options && this.options.stopAfterFirstRead) {
            setTimeout(function () { return _this._owner.get().invalidateSession(); });
        }
        if (!this._owner.get().writeMode) {
            var firstMessage = messages[0];
            this.resultCallback(NfcHelper.ndefToJson(firstMessage));
        }
    };
    NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidInvalidateWithError = function (session /* NFCNDEFReaderSession */, error) {
        this._owner.get().invalidateSession();
        this.resultCallback(error);
    };
    NFCNDEFReaderSessionDelegateImpl.ObjCProtocols = [];
    return NFCNDEFReaderSessionDelegateImpl;
}(NSObject));
