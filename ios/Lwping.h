#ifdef RCT_NEW_ARCH_ENABLED

#import <LwpingSpec/LwpingSpec.h>

#else

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#endif

@interface Lwping :
#ifdef RCT_NEW_ARCH_ENABLED
                    NativeLwpingSpecBase <NativeLwpingSpec>
#else
                    RCTEventEmitter <RCTBridgeModule> {
    bool pingListening;
}

- (void)emitPingListener:(NSDictionary *)dictionary;

#endif
@end
