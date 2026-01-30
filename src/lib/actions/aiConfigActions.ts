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
        // If a new provider is being saved as active, deactivate others
        const existingConfig = await (prisma as any).aIConfig.findUnique({
            where: { provider }
        })

        const config = await (prisma as any).aIConfig.upsert({
            where: { provider },
            update: {
                apiKey,
                model,
                endpoint,
                updatedAt: new Date()
            },
            create: {
                provider,
                apiKey,
                model,
                endpoint,
                isActive: false
            }
        })

        return { success: true, config }
    } catch (error) {
        console.error('Save AI config error:', error)
        return { success: false, error: 'Failed to save AI configuration' }
    }
}

export async function setActiveProvider(provider: string) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized access. Admin privileges required.' }
    }

    try {
        // Deactivate all providers
        await (prisma as any).aIConfig.updateMany({
            where: {},
            data: { isActive: false }
        })

        // Activate the selected provider
        const config = await (prisma as any).aIConfig.update({
            where: { provider },
            data: { isActive: true }
        })

        return { success: true, config }
    } catch (error) {
        console.error('Set active provider error:', error)
        return { success: false, error: 'Failed to set active provider' }
    }
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
        const config = await (prisma as any).aIConfig.findFirst({
            where: { isActive: true }
        })

        if (!config) {
            return { success: false, error: 'No active AI provider configured' }
        }

        return { success: true, config }
    } catch (error) {
        console.error('Get active AI config error:', error)
        return { success: false, error: 'Failed to fetch active AI configuration' }
    }
}
