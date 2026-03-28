'use client'

import React, { useState, useEffect } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-mongodb'
import { Play, AlertTriangle, Command, Save, Share2, Database } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useDatabase } from '@/contexts/DatabaseContext'
import { useSearchParams } from 'next/navigation'

interface QueryEditorProps {
    initialValue?: string
    onRun?: (query: string) => Promise<void> | void
    onSave?: (query: string) => void
    onShare?: (query: string) => void
    onCancel?: () => void
    availableDatabases?: string[]
    selectedDatabase?: string
    onDatabaseChange?: (dbName: string) => void
}

export function QueryEditor({ 
    initialValue = '', 
    onRun, 
    onSave, 
    onShare, 
    onCancel,
    availableDatabases = [],
    selectedDatabase = '',
    onDatabaseChange
}: QueryEditorProps) {
    const { selectedDb } = useDatabase()
    const searchParams = useSearchParams()
    const urlQuery = searchParams.get('q')

    const defaultQueries: Record<string, string> = {
        redis: 'GET MESHRAM',
        mongo: 'db.collection.find({})\n// Or JSON command: { "ping": 1 }',
        postgres: 'SELECT * FROM MESHRAM LIMIT 10;',
        mysql: 'SELECT * FROM MESHRAM LIMIT 10;',
    }

    const [code, setCode] = useState(urlQuery || initialValue || defaultQueries[selectedDb?.type || 'postgres'] || 'SELECT 1;')

    // Sync with URL query param changes
    useEffect(() => {
        if (urlQuery) setCode(urlQuery)
    }, [urlQuery])

    const [isDestructive, setIsDestructive] = useState(false)
    const [isRunning, setIsRunning] = useState(false)

    // Check for destructive keywords
    useEffect(() => {
        const destructiveRegex = selectedDb?.type === 'redis'
            ? /\b(FLUSHALL|FLUSHDB|DEL|EXPIRE)\b/i
            : selectedDb?.type === 'mongo'
                ? /\b(drop|remove|delete|update|dropDatabase|deleteMany|deleteOne|updateOne|updateMany)\b/i
                : /\b(DROP|DELETE|TRUNCATE|ALTER)\b/i
        setIsDestructive(destructiveRegex.test(code))
    }, [code, selectedDb?.type])

    // Custom Key Handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleRun()
        }
    }

    const handleRun = async () => {
        setIsRunning(true)
        if (onRun) {
            try {
                await onRun(code)
            } finally {
                setIsRunning(false)
            }
        } else {
            setIsRunning(false)
        }
    }

    const handleStop = () => {
        setIsRunning(false)
        if (onCancel) onCancel()
    }

    // Map database type to Prism language
    const getLanguage = () => {
        switch (selectedDb?.type) {
            case 'mongo': return languages.mongodb || languages.javascript
            case 'redis': return languages.bash
            default: return languages.sql
        }
    }

    const getLanguageName = () => {
        switch (selectedDb?.type) {
            case 'postgres': return 'sql'
            case 'mysql': return 'sql'
            case 'mongo': return 'mongodb'
            case 'redis': return 'bash'
            default: return 'sql'
        }
    }

    // Custom Highlighter with Danger Zone detection
    const highlightWithLineNumbers = (input: string) => {
        const lang = getLanguage()
        const langName = getLanguageName()
        const highlighted = highlight(input, lang, langName)
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
                        <span className="text-[9px] font-mono text-foreground/40 dark:text-white/30 uppercase tracking-widest font-black">
                            {selectedDb?.type?.toUpperCase() || 'DATABASE'} Editor
                        </span>
                        {selectedDb && (
                            <>
                                <div className="h-1 w-1 rounded-full bg-foreground/20 dark:bg-white/20 mx-1" />
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                    {(() => {
                                        const logoMap: Record<string, string> = {
                                            redis: '/database-logos/redis.svg',
                                            mongo: '/database-logos/mongodb.svg',
                                            mysql: '/database-logos/mysql.svg',
                                            postgres: '/database-logos/postgresql.svg',
                                        }
                                        const logo = logoMap[selectedDb.type]
                                        return logo
                                            ? <Image src={logo} alt={selectedDb.type} width={14} height={14} className="object-contain" />
                                            : <Database className="w-2.5 h-2.5 text-indigo-500" />
                                    })()}
                                    <span className="text-[9px] font-bold text-indigo-500/80 tracking-tight">{selectedDb.name}</span>
                                </div>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ml-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Connected</span>
                                </div>

                                {availableDatabases.length > 0 && (
                                    <div className="flex items-center ml-1">
                                        <div className="h-3 w-px bg-foreground/10 dark:bg-white/10 mx-1.5" />
                                        <select
                                            value={selectedDatabase}
                                            onChange={(e) => onDatabaseChange?.(e.target.value)}
                                            className="bg-foreground/5 dark:bg-white/5 text-[9px] font-bold text-indigo-500/80 border border-indigo-500/20 rounded-full px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 cursor-pointer hover:bg-indigo-500/10 transition-all appearance-none pr-4 relative"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 4px center',
                                                backgroundSize: '8px'
                                            }}
                                        >
                                            {availableDatabases.map(dbName => (
                                                <option key={dbName} value={dbName} className="bg-background dark:bg-zinc-900 text-foreground text-xs">
                                                    {dbName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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

                        {/* Syntax Guide Button */}
                        <div className="relative group/guide">
                            <button
                                className="p-1.5 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/10 text-foreground/30 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Command className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-wider pr-1">Guide</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-background dark:bg-black/90 border border-foreground/10 dark:border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-[110] opacity-0 invisible group-hover/guide:opacity-100 group-hover/guide:visible transition-all">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Syntax Guide</h4>
                                <div className="space-y-3">
                                    {selectedDb?.type === 'mongo' && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">Discover Collections:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">{"show collections"}</code>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">Switch Database:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">{"use admin; db.users.find({})"}</code>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">Find documents:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">{"db.users.find({ age: 10 })"}</code>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">Run command:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">{'{ "ping": 1 }'}</code>
                                            </div>
                                        </>
                                    )}
                                    {selectedDb?.type === 'redis' && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">Get/Set values:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">GET user_1</code>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">List keys:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">KEYS *</code>
                                            </div>
                                        </>
                                    )}
                                    {(selectedDb?.type === 'postgres' || selectedDb?.type === 'mysql') && (
                                        <>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-foreground/60">Select data:</p>
                                                <code className="block p-2 bg-foreground/5 dark:bg-white/5 rounded text-[11px] text-foreground/80">SELECT * FROM table;</code>
                                            </div>
                                        </>
                                    )}
                                    <p className="text-[9px] text-muted-foreground italic mt-2">
                                        Hint: Use Ctrl+Enter to run.
                                    </p>
                                </div>
                            </div>
                        </div>

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

                {/* Code Area — auto-resizes with content */}
                <div className="relative font-mono text-sm leading-6" style={{ minHeight: Math.min(Math.max(code.split('\n').length, 2) * 24 + 40, 500) }}>
                    <Editor
                        value={code}
                        onValueChange={setCode}
                        highlight={input => highlight(input, getLanguage(), getLanguageName())}
                        padding={20}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "font-mono text-[13px] bg-transparent !outline-none",
                            "search-editor-textarea",
                        )}
                        textareaClassName="focus:outline-none"
                        style={{
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            fontSize: 13,
                            backgroundColor: 'transparent',
                            color: isDestructive ? '#ef4444' : 'hsl(var(--foreground))',
                            textShadow: isDestructive ? '0 0 10px rgba(239,68,68,0.2)' : 'none',
                            minHeight: Math.min(Math.max(code.split('\n').length, 5) * 26 + 40, 500)
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
