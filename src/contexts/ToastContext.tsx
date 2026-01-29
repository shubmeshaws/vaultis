'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Toast, ToastType } from '@/components/ui/Toast'

interface ToastRequest {
    title: string
    description?: string
    type?: ToastType
    duration?: number
}

interface ToastContextType {
    toast: (request: ToastRequest) => void
    dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<{ id: string; request: ToastRequest }[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const toast = useCallback(({ title, description, type = 'info', duration = 4000 }: ToastRequest) => {
        const id = uuidv4()
        const newToast = {
            id,
            request: { title, description, type, duration }
        }

        setToasts((prev) => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id)
            }, duration)
        }
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[300] flex flex-col gap-3 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-3 items-end overflow-visible p-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {toasts.map(({ id, request }) => (
                            <Toast
                                key={id}
                                id={id}
                                type={request.type || 'info'}
                                title={request.title}
                                description={request.description}
                                onDismiss={dismiss}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
