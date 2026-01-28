'use client'

import { useState, useEffect, useCallback } from 'react'

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    const toggle = useCallback(() => setIsOpen(open => !open), [])
    const close = useCallback(() => setIsOpen(false), [])
    const open = useCallback(() => setIsOpen(true), [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                toggle()
            }
            if (e.key === 'Escape') {
                close()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggle, close])

    return { isOpen, open, close, toggle }
}
