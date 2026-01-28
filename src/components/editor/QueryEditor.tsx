'use client'

import React, { useState, useEffect } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-sql'
import { Play, AlertTriangle, Command, Save, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface QueryEditorProps {
    initialValue?: string
    onRun?: (query: string) => void
}

export function QueryEditor({ initialValue = '', onRun }: QueryEditorProps) {
    const [code, setCode] = useState(initialValue || 'SELECT * FROM users LIMIT 10;')
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
        if (onRun) onRun(code)
        // Simulate execution delay
        setTimeout(() => setIsRunning(false), 800)
    }

    // Custom SQL Highlighter with Danger Zone detection
    const highlightWithLineNumbers = (input: string) => {
        const highlighted = highlight(input, languages.sql, 'sql')
            .split('\n')
            .map((line: string, i: number) =>
                `<span class="line-number text-white/20 select-none mr-4 text-xs font-mono w-6 inline-block text-right border-r border-white/10 pr-2">${i + 1}</span>${line}`
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
                    : "bg-black/40 border-white/10 shadow-2xl"
            )}>

                {/* Visual Header / Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                        </div>
                        <span className="text-[10px] font-mono text-white/30 ml-2 uppercase tracking-widest">SQL Editor</span>
                    </div>

                    {/* Quick Access Toolbar */}
                    <div className="flex items-center gap-2">
                        {isDestructive && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400"
                            >
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-[9px] font-bold uppercase tracking-wide">Danger Zone</span>
                            </motion.div>
                        )}
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <Save className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <Share2 className="w-3.5 h-3.5" />
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
                            "font-mono text-sm bg-transparent !outline-none min-h-[300px]",
                            "search-editor-textarea", // Custom class for global styles if needed
                        )}
                        textareaClassName="focus:outline-none"
                        style={{
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            fontSize: 14,
                            backgroundColor: 'transparent',
                            color: isDestructive ? '#fca5a5' : '#e2e8f0', // Slight red tint if destructive
                            textShadow: isDestructive ? '0 0 10px rgba(239,68,68,0.2)' : 'none'
                        }}
                    />

                    {/* Floating Action Button */}
                    <motion.button
                        onClick={handleRun}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "absolute bottom-6 right-6 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all z-20 group/run",
                            isDestructive
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30"
                        )}
                    >
                        {isRunning ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span className="tracking-wide">{isDestructive ? 'EXECUTE DANGER' : 'RUN QUERY'}</span>
                        <div className="ml-1 pl-2 border-l border-white/20 text-[9px] font-mono opacity-60 flex items-center gap-0.5">
                            <Command className="w-2.5 h-2.5" />
                            <span>Ent</span>
                        </div>
                    </motion.button>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-1.5 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono">
                        <span>Line 1, Col 1</span>
                        <span>UTF-8</span>
                        <span>{code.length} chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                        <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider">Ready</span>
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
                    color: #ec4899; /* Pink numbers */
                }

                .token.selector,
                .token.attr-name,
                .token.string,
                .token.char,
                .token.builtin,
                .token.inserted {
                    color: #a5b4fc; /* Indigo strings */
                }

                .token.operator,
                .token.entity,
                .token.url,
                .language-css .token.string,
                .style .token.string {
                    color: #e2e8f0;
                }

                .token.atrule,
                .token.attr-value,
                .token.keyword {
                    color: #818cf8; /* Indigo/Blue keywords */
                    font-weight: bold;
                }
                
                .token.function,
                .token.class-name {
                    color: #38bdf8; /* Cyan functions */
                }

                .token.regex,
                .token.important,
                .token.variable {
                    color: #fbbf24;
                }
            `}</style>
        </div>
    )
}
