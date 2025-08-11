import {
    NativeEventEmitter,
    type NativeModule as LegacyNativeModule,
    type EventSubscription,
} from 'react-native'

import NativeModule from '../NativeLwping'

import {
	isTurboModuleCompat,
} from '../native-module/is-turbo-module-compat'

import {
	PingStatus,
} from '../PingStatus'

import type {
	ICMPConstructorData,
} from './ICMPConstructorData'

import type {
	ICMPResult,
} from './ICMPResult'

const isTurboModuleEnabled = isTurboModuleCompat()

export class ICMP {

	private eventId: string = new Date().getTime().toString() + Math.random().toString()
	readonly host: string
	readonly count: number = 0
	readonly packetSize: number = 56
	readonly timeout: number = 1000
	readonly ttl: number = 54
	readonly interval: number = 1000

	static NO_ECHO_RTT = -1
	static NO_ECHO_TTL = -1

    private pingEventSubscriptionTurbo: EventSubscription | null = null
    private pingEventSubscriptionLegacy: EventSubscription | null = null
	private pingEventHandler: ((result: ICMPResult) => void) | null = null

	constructor(data: ICMPConstructorData) {
		this.host = data.host
		this.count = data.count ?? this.count
		this.packetSize = data.packetSize ?? this.packetSize
		this.timeout = data.timeout ?? this.timeout
		this.ttl = data.ttl ?? this.ttl
		this.interval = data.interval ?? this.interval
	}

	ping(
		onPing: (
			result: ICMPResult,
		) => void,
	) {
		if(!this.pingEventHandler) {
			NativeModule.icmp(
				this.eventId,
				this.host,
				this.count,
				this.packetSize,
				this.timeout,
				this.ttl,
				this.interval,
			)

			this.pingEventHandler = onPing

            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            // Subscribe to both Turbo (new arch) and Legacy emitters; filter by eventId to avoid cross-talk
            try {
                if(isTurboModuleEnabled && typeof (NativeModule as any).pingListener === 'function') {
                    this.pingEventSubscriptionTurbo = (NativeModule as any).pingListener((result: Record<string, any>) => {
                        if(result.eventId !== this.eventId) return
                        this.pingEventHandler?.({
                            rtt: result.rtt,
                            status: result.status,
                            ttl: result.ttl,
                            isEnded: result.isEnded,
                        })
                        if(result.isEnded) this.stop()
                    }) as unknown as EventSubscription
                }
            } catch {
                // ignore
            }
            try {
                this.pingEventSubscriptionLegacy = new NativeEventEmitter(NativeModule as unknown as LegacyNativeModule).addListener('PingListener', (result: any) => {
                    if((result as any).eventId !== this.eventId) return
                    this.pingEventHandler?.({
                        rtt: result.rtt,
                        status: result.status,
                        ttl: result.ttl,
                        isEnded: result.isEnded,
                    })
                    if(result.isEnded) this.stop()
                })
            } catch {
                // ignore
            }
            /* eslint-enable @typescript-eslint/no-unsafe-member-access */
		} else {
			onPing({
				rtt: ICMP.NO_ECHO_RTT,
				ttl: ICMP.NO_ECHO_TTL,
				status: PingStatus.ECHOING,
				isEnded: true,
			})
		}
	}

	stop() {
        if(this.pingEventHandler) {
            try { NativeModule.icmpRemove(this.eventId) } catch { /* noop */ }
            try { this.pingEventSubscriptionTurbo?.remove() } catch { /* noop */ }
            try { this.pingEventSubscriptionLegacy?.remove() } catch { /* noop */ }
            this.pingEventSubscriptionTurbo = null
            this.pingEventSubscriptionLegacy = null
            this.pingEventHandler = null
        }
	}

	isRunning() {
		return !!this.pingEventHandler
	}

}
