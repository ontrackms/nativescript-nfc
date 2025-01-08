//
//  NfcNativeHelper.m
//  NfcNativeHelper
//

#import "NfcNativeHelper.h"

@implementation NfcNativeHelper
-(NSData*)getTagUID:(id<NFCTag>)tag {
    NSData* uid = nil;
    if (tag.type == NFCTagTypeMiFare){
        id<NFCMiFareTag> mifare = [tag asNFCMiFareTag];
        uid = mifare.identifier;
    } else if (tag.type == NFCTagTypeISO7816Compatible){
        id<NFCISO7816Tag> iso7816Tag = [tag asNFCISO7816Tag];
        uid = iso7816Tag.identifier;
    } else if (tag.type == NFCTagTypeISO15693) {
        id<NFCISO15693Tag> iso15693Tag = [tag asNFCISO15693Tag];
        uid = iso15693Tag.identifier;
    } else if (tag.type == NFCTagTypeFeliCa) {
        NSLog(@"%@", @"UID not available for FeliCa tags");
    }
    NSLog(@"%@", uid);
    
    return uid;
}

-(NSString*)tagUIDToString:(NSData*)uid {
    NSString* uidStr = nil;
    if (uid != nil){
        uidStr = [self getHexString:uid];
    }
    NSLog(@"%@", uid);
    return uidStr;
}

-(NSString*)getHexString:(NSData*)data {
    
    NSLog(@"%@", data);
    
    NSUInteger capacity = data.length * 2;
    NSMutableString *sbuf = [NSMutableString stringWithCapacity:capacity];
    const unsigned char *buf = data.bytes;
    NSInteger i;
    for (i=0; i<data.length; ++i) {
        [sbuf appendFormat:@"%02lX", (unsigned long)buf[i]];
    }
    
    NSLog(@"%@", sbuf);
    
    return sbuf;
}
@end
