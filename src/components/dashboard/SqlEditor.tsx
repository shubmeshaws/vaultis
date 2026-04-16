'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Note: Using raw SVG fallbacks for icons if lucide is confirmed missing again, 
// but I'll use the ones I defined for the previous component for reliability.
const EditorIcons = {
    Play: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Alert: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Terminal: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
}

const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'AND', 'OR', 'IN', 'IS', 'NULL', 'NOT', 'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'SET']
const DANGEROUS = ['DELETE', 'DROP', 'TRUNCATE', 'UPDATE']

interface SqlEditorProps {
    initialValue?: string
    onRun?: (query: string) => void
}

export function SqlEditor({ initialValue = '', onRun }: SqlEditorProps) {
    const [code, setCode] = useState(initialValue)
    const [dangerousKeywords, setDangerousKeywords] = useState<string[]>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const preRef = useRef<HTMLPreElement>(null)

    useEffect(() => {
        setCode(initialValue)
    }, [initialValue])

    useEffect(() => {
        const foundDangerous = DANGEROUS.filter(k =>
            new RegExp(`\\b${k}\\b`, 'gi').test(code)
        )
        setDangerousKeywords(prev => {
            if (JSON.stringify(prev) === JSON.stringify(foundDangerous)) return prev
            return foundDangerous
        })
    }, [code])

    const handleHighlight = useCallback((text: string) => {
        // Escape HTML
        let escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

        // Tokenization
        // 1. Comments
        escaped = escaped.replace(/(--.*$)/gm, '<span class="text-muted-foreground italic">$1</span>')

        // 2. Strings
        escaped = escaped.replace(/('.*?')/g, '<span class="text-emerald-400">$1</span>')
        escaped = escaped.replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>')

        // 3. Keywords (Standard)
        KEYWORDS.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'gi')
            escaped = escaped.replace(regex, '<span class="text-primary font-bold">$1</span>')
        })

        // 4. Keywords (Dangerous)
        DANGEROUS.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'gi')
            escaped = escaped.replace(regex, '<span class="text-red-500 font-bold bg-red-500/10 px-1 rounded animate-pulse">$1</span>')
        })

        return escaped
    }, [])

    const syncScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop
            preRef.current.scrollLeft = textareaRef.current.scrollLeft
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            onRun?.(code)
        }
        // Handle tab
        if (e.key === 'Tab') {
            e.preventDefault()
            const start = textareaRef.current!.selectionStart
            const end = textareaRef.current!.selectionEnd
            const newCode = code.substring(0, start) + '  ' + code.substring(end)
            setCode(newCode)
            setTimeout(() => {
                textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = start + 2
            }, 0)
        }
    }

    const lineNumbers = code.split('\n').map((_, i) => i + 1).join('\n')

    return (
        <div className="relative group">
            {/* Editor Container */}
            <div className="bg-background dark:bg-card/95 backdrop-blur-xl border border-foreground/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-foreground/20 dark:group-hover:border-white/20">

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/5 dark:border-white/5 bg-foreground/[0.02] dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <div className="w-2 h-2 rounded-full bg-red-500/40" />
                            <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                        </div>
                        <div className="h-3 w-[1px] bg-foreground/20 dark:bg-white/40" />
                        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/60 dark:text-muted-foreground uppercase tracking-widest">
                            <EditorIcons.Terminal className="w-2.5 h-2.5" />
                            SQL Editor
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <AnimatePresence>
                            {dangerousKeywords.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase"
                                >
                                    <EditorIcons.Alert className="w-3 h-3" />
                                    Safety Warning: {dangerousKeywords.join(', ')} detected
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="text-[10px] text-muted-foreground font-normal hidden sm:block">
                            UTF-8 | PostgreSQL
                        </div>
                    </div>
                </div>

                <div className="flex relative min-h-[400px]">
                    {/* Line Numbers Gutter */}
                    <div className="w-10 py-4 bg-foreground/[0.03] dark:bg-black/20 text-right pr-3 select-none pointer-events-none border-r border-foreground/5 dark:border-white/5">
                        <pre className="text-[10px] font-mono leading-6 text-foreground/20 dark:text-muted-foreground/40 text-right">
                            {lineNumbers}
                        </pre>
                    </div>

                    {/* Code Area */}
                    <div className="flex-1 relative overflow-hidden">
                        {/* Syntax Highlighting Layer */}
                        <pre
                            ref={preRef}
                            aria-hidden="true"
                            className="absolute inset-0 p-4 m-0 text-[13px] font-mono leading-6 whitespace-pre-wrap break-all pointer-events-none text-foreground"
                            dangerouslySetInnerHTML={{ __html: handleHighlight(code) + '\n' }}
                        />
                        {/* Input Layer */}
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onScroll={syncScroll}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            className="absolute inset-0 p-4 m-0 text-[13px] font-mono leading-6 bg-transparent text-transparent caret-primary outline-none resize-none whitespace-pre-wrap break-all w-full h-full"
                            placeholder="-- Execute your command here&#10;SELECT * FROM users LIMIT 10;"
                        />
                    </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-1.5 border-t border-foreground/10 dark:border-white/5 bg-foreground/[0.04] dark:bg-black/20 flex items-center justify-between text-[9px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                    <div>{code.length} characters | {code.split('\n').length} lines</div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="opacity-50">Shortcut:</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-sans text-[9px]">⌘ + Enter</kbd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Run Button */}
            <motion.button
                onClick={() => onRun?.(code)}
                whileHover={{ scale: 1.05, translateY: -5 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-10 right-8 z-20 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_40px_rgba(var(--primary),0.5)] transition-all"
            >
                <EditorIcons.Play className="w-5 h-5" />
                Run Query
            </motion.button>

            {/* Background Accent */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    )
}
