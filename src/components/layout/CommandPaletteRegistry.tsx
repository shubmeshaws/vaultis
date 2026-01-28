'use client'

import React from 'react'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'

export function CommandPaletteRegistry() {
    const { isOpen, close } = useCommandPalette()

    return <CommandPalette isOpen={isOpen} onClose={close} />
}
