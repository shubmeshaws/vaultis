'use client'

import React, { useState, useEffect } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-sql'
import { Play, AlertTriangle, Command, Save, Share2, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useDatabase } from '@/contexts/DatabaseContext'
import { useSearchParams } from 'next/navigation'

interface QueryEditorProps {
    initialValue?: string
    onRun?: (query: string) => void
    onSave?: (query: string) => void
    onShare?: (query: string) => void
    onCancel?: () => void
}

export function QueryEditor({ initialValue = '', onRun, onSave, onShare, onCancel }: QueryEditorProps) {
    const { selectedDb } = useDatabase()
    const searchParams = useSearchParams()
    const urlQuery = searchParams.get('q')

    const [code, setCode] = useState(urlQuery || initialValue || 'SELECT * FROM users LIMIT 10;')
    const [isDestructive, setIsDestructive] = useState(false)
    const [isRunning, setIsRunning] = useState(false)

    // Check for destructive keywords
    useEffect(() => {
        const destructiveRegex = /\b(DROP|DELETE|TRUNCATE|ALTER)\b/i
        setIsDestructive(destructiveRegex.test(code))
    }, [code])

    // Custom Key Handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleRun()
        }
    }

    const handleRun = () => {
        setIsRunning(true)
        if (onRun) onRun(code).finally(() => setIsRunning(false))
    }

    const handleStop = () => {
        setIsRunning(false)
        if (onCancel) onCancel()
    }

    // Custom SQL Highlighter with Danger Zone detection
    const highlightWithLineNumbers = (input: string) => {
        const highlighted = highlight(input, languages.sql, 'sql')
            .split('\n')
            .map((line: string, i: number) =>
                `<span class="line-number text-foreground/20 dark:text-white/20 select-none mr-4 text-[10px] font-mono w-5 inline-block text-right border-r border-foreground/5 dark:border-white/10 pr-2">${i + 1}</span>${line}`
            )
            .join('\n')
        return highlighted
    }

    return (
        <div className="relative group">
            {/* Editor Card */}
            <div className={cn(
                "relative rounded-2xl overflow-hidden backdrop-blur-xl border transition-all duration-500",
                isDestructive
                    ? "bg-red-500/[0.02] border-red-500/30 shadow-[0_0_30px_-5px_rgba(239,68,68,0.1)]"
                    : "bg-background dark:bg-black/40 border-foreground/10 dark:border-white/10 shadow-2xl shadow-indigo-500/5 group-hover:border-foreground/20 dark:group-hover:border-white/20"
            )}>

                {/* Visual Header / Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/5 dark:border-white/5 bg-foreground/[0.02] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 opacity-60">
                            <div className="w-2 h-2 rounded-full bg-red-500/40 border border-red-500/60" />
                            <div className="w-2 h-2 rounded-full bg-amber-500/40 border border-amber-500/60" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                        </div>
                        <div className="h-3 w-px bg-foreground/10 dark:bg-white/10 mx-2" />
                        <span className="text-[9px] font-mono text-foreground/40 dark:text-white/30 uppercase tracking-widest font-black">SQL Editor</span>
                        {selectedDb && (
                            <>
                                <div className="h-1 w-1 rounded-full bg-foreground/20 dark:bg-white/20 mx-1" />
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                    <Database className="w-2.5 h-2.5 text-indigo-500" />
                                    <span className="text-[9px] font-bold text-indigo-500/80 tracking-tight">{selectedDb.name}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Access Toolbar */}
                    <div className="flex items-center gap-2">
                        {isDestructive && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400"
                            >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-black uppercase tracking-wide">Danger Zone</span>
                            </motion.div>
                        )}
                        <div className="h-3 w-px bg-foreground/10 dark:bg-white/10 mx-1" />
                        <button
                            onClick={() => onSave?.(code)}
                            className="p-1.5 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/10 text-foreground/30 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors"
                        >
                            <Save className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onShare?.(code)}
                            className="p-1.5 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/10 text-foreground/30 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors"
                        >
                            <Share2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Code Area */}
                <div className="relative min-h-[300px] font-mono text-sm leading-6">
                    <Editor
                        value={code}
                        onValueChange={setCode}
                        highlight={input => highlight(input, languages.sql, 'sql')}
                        padding={20}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "font-mono text-[13px] bg-transparent !outline-none min-h-[300px]",
                            "search-editor-textarea", // Custom class for global styles if needed
                        )}
                        textareaClassName="focus:outline-none"
                        style={{
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            fontSize: 13,
                            backgroundColor: 'transparent',
                            color: isDestructive ? '#ef4444' : 'hsl(var(--foreground))', // Slight red tint if destructive
                            textShadow: isDestructive ? '0 0 10px rgba(239,68,68,0.2)' : 'none'
                        }}
                    />

                    {/* Floating Action Button */}
                    <motion.button
                        onClick={isRunning ? handleStop : handleRun}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "absolute bottom-6 right-6 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all z-20 group/run",
                            isDestructive
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                                : isRunning
                                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30"
                        )}
                    >
                        {isRunning ? (
                            <div className="w-3.5 h-3.5 rounded-sm bg-white animate-pulse" />
                        ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span className="tracking-wide">{isRunning ? 'STOP' : (isDestructive ? 'EXECUTE DANGER' : 'RUN QUERY')}</span>
                        {!isRunning && (
                            <div className="ml-1 pl-2 border-l border-white/20 text-[9px] font-mono opacity-60 flex items-center gap-0.5">
                                <Command className="w-2.5 h-2.5" />
                                <span>Ent</span>
                            </div>
                        )}
                    </motion.button>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-1.5 bg-foreground/[0.04] dark:bg-black/40 border-t border-foreground/10 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[9px] text-foreground/50 dark:text-white/30 font-mono font-bold">
                        <span>Line 1, Col 1</span>
                        <span>UTF-8</span>
                        <span>{code.length} chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                        <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-wider">Ready</span>
                    </div>
                </div>
            </div>

            {/* Global Style Injection for Prism (Scoped) */}
            <style jsx global>{`
                /* Custom Light/Dark Prism Theme for SQL */
                code[class*="language-"],
                pre[class*="language-"] {
                    color: inherit;
                    text-shadow: none;
                }
                
                .token.comment,
                .token.prolog,
                .token.doctype,
                .token.cdata {
                    color: slategray;
                }

                .token.punctuation {
                    color: #94a3b8;
                }

                .token.namespace {
                    opacity: .7;
                }

                .token.property,
                .token.tag,
                .token.boolean,
                .token.number,
                .token.constant,
                .token.symbol,
                .token.deleted {
                    color: #d946ef; /* Magenta numbers */
                }

                .token.selector,
                .token.attr-name,
                .token.string,
                .token.char,
                .token.builtin,
                .token.inserted {
                    color: #4f46e5; /* Indigo strings */
                }
                
                .dark .token.string {
                    color: #a5b4fc;
                }

                .token.operator,
                .token.entity,
                .token.url,
                .language-css .token.string,
                .style .token.string {
                    color: inherit;
                }

                .token.atrule,
                .token.attr-value,
                .token.keyword {
                    color: #6366f1; /* Indigo keywords */
                    font-weight: 700;
                }
                
                .dark .token.keyword {
                    color: #818cf8;
                }
                
                .token.function,
                .token.class-name {
                    color: #0891b2; /* Cyan functions */
                }
                
                .dark .token.function {
                    color: #38bdf8;
                }

                .token.regex,
                .token.important,
                .token.variable {
                    color: #d97706;
                }
            `}</style>
        </div>
    )
}
