'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/middleware'

export async function getAIConfigs() {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized access. Admin privileges required.' }
    }

    try {
        const configs = await (prisma as any).aIConfig.findMany({
            orderBy: { createdAt: 'desc' }
        })

        // Mask API keys for security (show only last 4 characters)
        const maskedConfigs = configs.map((config: any) => ({
            ...config,
            apiKey: `****${config.apiKey.slice(-4)}`
        }))

        return { success: true, configs: maskedConfigs }
    } catch (error) {
        console.error('Get AI configs error:', error)
        return { success: false, error: 'Failed to fetch AI configurations' }
    }
}

export async function saveAIConfig(provider: string, apiKey: string, model?: string, endpoint?: string) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized access. Admin privileges required.' }
    }

    try {
        const config = await (prisma as any).aIConfig.upsert({
            where: { provider },
            update: {
                apiKey,
                model,
                endpoint,
                isActive: true, // Auto-enable when saving/updating
                updatedAt: new Date()
            },
            create: {
                provider,
                apiKey,
                model,
                endpoint,
                isActive: true // Auto-enable on creation
            }
        })

        return { success: true, config }
    } catch (error) {
        console.error('Save AI config error:', error)
        return { success: false, error: 'Failed to save AI configuration' }
    }
}

export async function toggleProviderActive(provider: string, isActive: boolean) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized access. Admin privileges required.' }
    }

    try {
        const config = await (prisma as any).aIConfig.update({
            where: { provider },
            data: { isActive }
        })

        return { success: true, config }
    } catch (error) {
        console.error('Toggle provider status error:', error)
        return { success: false, error: 'Failed to update provider status' }
    }
}

// Deprecated: Use toggleProviderActive instead, but kept for backward compatibility if needed
export async function setActiveProvider(provider: string) {
    return toggleProviderActive(provider, true)
}

export async function deleteAIConfig(provider: string) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized access. Admin privileges required.' }
    }

    try {
        await (prisma as any).aIConfig.delete({
            where: { provider }
        })

        return { success: true }
    } catch (error) {
        console.error('Delete AI config error:', error)
        return { success: false, error: 'Failed to delete AI configuration' }
    }
}

export async function getActiveAIConfig() {
    try {
        // Fetch ALL active configurations
        const configs = await (prisma as any).aIConfig.findMany({
            where: { isActive: true }
        })

        if (!configs || configs.length === 0) {
            return { success: false, error: 'No active AI provider configured' }
        }

        // Priority Order: Anthropic > OpenAI > Google > Groq
        const priority = ['anthropic', 'openai', 'google', 'groq']

        // Sort configs based on priority index
        const sortedConfigs = configs.sort((a: any, b: any) => {
            const indexA = priority.indexOf(a.provider)
            const indexB = priority.indexOf(b.provider)
            // If provider not in list (unexpected), push to end
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
        })

        // Return the highest priority config
        return { success: true, config: sortedConfigs[0] }
    } catch (error) {
        console.error('Get active AI config error:', error)
        return { success: false, error: 'Failed to fetch active AI configuration' }
    }
}
