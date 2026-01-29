'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Portal } from '../ui/Portal'
interface User {
    id: string
    name: string | null
    email: string
    role: any
    access: string[]
}

interface PermissionEditorProps {
    user: User | null
    isOpen: boolean
    onClose: () => void
    onSave?: (userId: string, access: string[]) => void
    availableDatabases: any[]
}

const Icons = {
    Close: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Check: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    Shield: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Save: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    Database: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
    ),
}

export function PermissionEditor({ user, isOpen, onClose, onSave, availableDatabases }: PermissionEditorProps) {
    const [selectedAccess, setSelectedAccess] = React.useState<string[]>([])

    React.useEffect(() => {
        if (user) {
            setSelectedAccess(user.access)
        }
    }, [user])

    const toggleAccess = (dbId: string) => {
        setSelectedAccess(prev =>
            prev.includes(dbId) ? prev.filter(a => a !== dbId) : [...prev, dbId]
        )
    }

    // Filter out databases that are already in user's groups to avoid confusion? 
    // Or just show all? Showing all with indication might be better, but for now simple list.
    // The user might want to give direct access even if in group (redundant but harmless),
    // or maybe the user IS NOT in the group yet. 

    // We'll show all available databases.

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && user && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md z-10"
                            style={{ zoom: 0.9 }}
                        >
                            <div className="bg-card border border-foreground/10 rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-foreground/5 flex items-center justify-between bg-foreground/[0.02] shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                            <Icons.Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground">Permissions</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editing for {user.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-foreground/5 text-muted-foreground transition-colors"
                                    >
                                        <Icons.Close className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                    {/* Database Selection - Mirroring CreateGroupModal structure */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Database Permissions</label>
                                        <div className="max-h-[60vh] overflow-y-auto border border-foreground/10 rounded-xl p-2 bg-foreground/5 space-y-1">
                                            {availableDatabases && availableDatabases.length > 0 ? (
                                                availableDatabases.map(db => (
                                                    <label key={db.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedAccess.includes(db.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-foreground/5 border border-transparent'}`}>
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedAccess.includes(db.id) ? 'bg-primary border-primary' : 'border-foreground/30'}`}>
                                                            {selectedAccess.includes(db.id) && <Icons.Check className="w-3 h-3 text-primary-foreground" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={selectedAccess.includes(db.id)}
                                                            onChange={() => toggleAccess(db.id)}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-left">{db.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{db.type} • {db.host}</span>
                                                        </div>
                                                    </label>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic p-4 text-center">No available databases found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-5 border-t border-foreground/5 bg-foreground/[0.02] flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 rounded-2xl bg-foreground/5 border border-foreground/10 text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-foreground/10 transition-all font-sans"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            onSave?.(user.id, selectedAccess)
                                            onClose()
                                        }}
                                        className="flex-[2] py-3 px-4 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_48px_rgba(var(--primary),0.5)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Icons.Save className="w-4 h-4" />
                                        Apply Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    )
}
