'use client'

import { useState, useEffect, useCallback } from 'react'

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    const toggle = useCallback(() => setIsOpen(open => !open), [])
    const close = useCallback(() => setIsOpen(false), [])
    const open = useCallback(() => setIsOpen(true), [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                toggle()
            }

            // Allow closing with Escape (redundant but safe)
            if (e.key === 'Escape' && isOpen) {
                close()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggle, close, isOpen])

    return { isOpen, open, close, toggle }
}
