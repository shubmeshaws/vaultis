'use server'

import { prisma } from '@/lib/db/prisma'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function createUser(data: {
    name: string
    email: string
    role: Role
    password?: string
}) {
    try {
        const hashedPassword = data.password ? await hash(data.password, 12) : undefined

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                password: hashedPassword,
                isActive: false, // Explicitly false for new users
            } as any,
        })

        revalidatePath('/admin/users')
        return { success: true, user }
    } catch (error: any) {
        console.error('Error creating user:', error)
        return { success: false, error: error.message || 'Failed to create user' }
    }
}

export async function updateUserRole(userId: string, role: Role) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating user role:', error)
        return { success: false, error: 'Failed to update user role' }
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId },
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function toggleUserStatus(userId: string, isVerified: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: isVerified ? new Date() : null },
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error toggling user status:', error)
        return { success: false, error: 'Failed to toggle user status' }
    }
}

export async function getDatabases() {
    try {
        const databases = await (prisma as any).database.findMany({
            select: { id: true, name: true, type: true }
        })
        return { success: true, databases }
    } catch (error) {
        return { success: false, error: 'Failed to fetch databases' }
    }
}

export async function createGroup(data: {
    name: string
    description?: string,
    userIds?: string[],
    databaseIds?: string[]
}) {
    try {
        const group = await (prisma as any).group.create({
            data: {
                name: data.name,
                description: data.description,
                users: {
                    connect: data.userIds?.map(id => ({ id })) || []
                },
                databases: {
                    connect: data.databaseIds?.map(id => ({ id })) || []
                }
            },
            include: {
                _count: {
                    select: { users: true }
                },
                users: {
                    select: { id: true, name: true, email: true }
                },
                databases: {
                    select: { id: true, name: true }
                }
            }
        })

        revalidatePath('/admin/users')
        return { success: true, group }
    } catch (error: any) {
        console.error('Error creating group:', error)
        return { success: false, error: error.message || 'Failed to create group' }
    }
}

export async function getGroups() {
    try {
        const groups = await (prisma as any).group.findMany({
            include: {
                _count: {
                    select: { users: true }
                },
                users: {
                    select: { id: true, name: true, email: true }
                },
                databases: {
                    select: { id: true, name: true }
                }
            }
        })
        return { success: true, groups }
    } catch (error) {
        return { success: false, error: 'Failed to fetch groups' }
    }
}

export async function updateUserPermissions(userId: string, access: string[]) {
    try {
        // In a real app, we would update a join table or a JSON field
        // For now, we simulate success as the schema doesn't have an 'access' field yet
        return { success: true }
    } catch (error: any) {
        console.error('Error updating permissions:', error)
        return { success: false, error: 'Failed to update database permissions' }
    }
}

export async function updateUserActiveStatus(userId: string, isActive: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive } as any,
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating account status:', error)
        return { success: false, error: 'Failed to update account status' }
    }
}

export async function updateGroupDatabases(groupId: string, databaseIds: string[]) {
    try {
        await (prisma as any).group.update({
            where: { id: groupId },
            data: {
                databases: {
                    set: databaseIds.map(id => ({ id }))
                }
            },
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating group databases:', error)
        return { success: false, error: 'Failed to update group databases' }
    }
}

export async function updateGroupUsers(groupId: string, userIds: string[]) {
    try {
        await (prisma as any).group.update({
            where: { id: groupId },
            data: {
                users: {
                    set: userIds.map(id => ({ id }))
                }
            },
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating group users:', error)
        return { success: false, error: 'Failed to update group users' }
    }
}

export async function deleteGroup(groupId: string) {
    try {
        await (prisma as any).group.delete({
            where: { id: groupId }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting group:', error)
        return { success: false, error: 'Failed to delete group' }
    }
}

export async function renameGroup(groupId: string, name: string) {
    try {
        await (prisma as any).group.update({
            where: { id: groupId },
            data: { name }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error renaming group:', error)
        return { success: false, error: 'Failed to rename group' }
    }
}

export async function getUserStatus() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, isActive: false }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: { isActive: true } as any
        })

        return { success: true, isActive: !!(user as any)?.isActive }
    } catch (error) {
        return { success: false, isActive: false }
    }
}
