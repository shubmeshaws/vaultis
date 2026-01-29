import { headers } from 'next/headers'

export function getClientIP(): string {
    try {
        const headersList = headers()

        // Try various headers that might contain the client IP
        const xForwardedFor = headersList.get('x-forwarded-for')
        const xRealIp = headersList.get('x-real-ip')
        const cfConnectingIp = headersList.get('cf-connecting-ip')

        if (xForwardedFor) {
            // x-forwarded-for can contain multiple IPs, take the first one
            return xForwardedFor.split(',')[0].trim()
        }

        if (xRealIp) {
            return xRealIp
        }

        if (cfConnectingIp) {
            return cfConnectingIp
        }
    } catch (error) {
        // headers() might not be available in all contexts
        console.warn('Unable to access request headers:', error)
    }

    // Fallback to localhost if no IP found
    return '127.0.0.1'
}

export function getUserAgent(): string {
    try {
        const headersList = headers()
        return headersList.get('user-agent') || 'Unknown'
    } catch (error) {
        return 'Unknown'
    }
}
