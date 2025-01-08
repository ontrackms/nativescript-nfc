//
//  NfcNativeHelper.h
//  NfcNativeHelper
//
//  Copyright © 2020 Dumitru Andronache.
//

#import <Foundation/Foundation.h>
#import <CoreNFC/CoreNFC.h>

@interface NfcNativeHelper : NSObject
-(NSData*)getTagUID:(id<NFCTag>)tag;
-(NSString*)tagUIDToString:(NSData*)uid;
@end
