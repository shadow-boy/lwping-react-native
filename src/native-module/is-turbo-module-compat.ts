/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const turboModuleProxy: boolean | undefined = global.__turboModuleProxy

/**
 * global.__turboModuleProxy doesn't exist anymore  
 * So this helper help this package to determine in the runtime either it's Turbo Modules or Legacy Native Modules the RN app is using
 */
export function isTurboModuleCompat() {
	if(typeof turboModuleProxy === 'undefined') {
		return global.RN$Bridgeless === true
	}

	return !!turboModuleProxy
}
