'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, X } from 'lucide-react'

interface DangerConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    actionName: string
    confirmationText?: string
    details?: {
        label: string
        value: string
    }[]
}

export function DangerConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    actionName,
    confirmationText = 'DELETE',
    details = []
}: DangerConfirmationModalProps) {
    const [inputValue, setInputValue] = useState('')
    const [isConfirming, setIsConfirming] = useState(false)

    const handleConfirm = async () => {
        if (inputValue !== confirmationText) return

        setIsConfirming(true)
        await onConfirm()
        setIsConfirming(false)
        setInputValue('')
        onClose()
    }

    const handleClose = () => {
        setInputValue('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-background/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden">
                {/* Red Accent Bar */}
                <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />

                {/* Header */}
                <div className="p-6 border-b border-foreground/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-500">
                                        Dangerous Action
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-foreground">{title}</h2>
                                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Details */}
                    {details.length > 0 && (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3">
                            <div className="flex items-center gap-2 text-red-500">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Action Details</span>
                            </div>
                            <div className="space-y-2">
                                {details.map((detail, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {detail.label}
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {detail.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warning Message */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-foreground">This action cannot be undone</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This will permanently {actionName.toLowerCase()}. All associated data will be irreversibly removed from the system. Please verify this is the intended action before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Type <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-xs">{confirmationText}</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={`Type "${confirmationText}" here`}
                                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-sm font-medium focus:outline-none focus:border-red-500/50 focus:bg-foreground/10 transition-all"
                                autoComplete="off"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This confirmation ensures you understand the severity of this action.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-foreground/10 bg-foreground/[0.02] flex items-center justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-sm font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={inputValue !== confirmationText || isConfirming}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${inputValue === confirmationText && !isConfirming
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'bg-foreground/5 text-muted-foreground cursor-not-allowed'
                            }`}
                    >
                        {isConfirming ? 'Processing...' : `Confirm ${actionName}`}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Example usage component
export function DangerConfirmationModalExample() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="p-8">
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
            >
                Delete User
            </button>

            <DangerConfirmationModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={async () => {
                    // Perform dangerous action
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    console.log('User deleted')
                }}
                title="Delete User Account"
                description="You are about to permanently delete this user account"
                actionName="Delete"
                confirmationText="DELETE"
                details={[
                    { label: 'User', value: 'dexter@queryflow.io' },
                    { label: 'Role', value: 'Administrator' },
                    { label: 'Databases', value: '5 connections' }
                ]}
            />
        </div>
    )
}
