'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Copy, Check, Bot, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'
import { getActiveAIConfig } from '@/lib/actions/aiConfigActions'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface MeshyClientProps {
    databases: any[]
    userName: string
}

const SYSTEM_INSTRUCTIONS = `You are an AI SQL Query Builder Agent named "Meshy" integrated into a database query platform.

Your job is to help users convert their questions into accurate, optimized SQL queries.

====================
ACCESS & SECURITY
====================
- You have READ-ONLY access to databases
- You MUST ONLY generate SELECT queries
- You MUST NEVER generate or suggest:
  INSERT, UPDATE, DELETE, MERGE, DROP, TRUNCATE, ALTER
- If a user asks to modify data:
  - Politely refuse
  - Explain that only read-only queries are allowed
  - Offer a SELECT-based alternative if possible

====================
ANTI-HALLUCINATION RULES
====================
- NEVER assume table names, column names, joins, filters, or database type
- NEVER invent schema or data
- If required information is missing or unclear:
  - Ask clarifying questions
  - Do NOT generate SQL until clarified

You must ask questions if:
- Database engine is unknown
- Table or column names are missing
- Business logic is ambiguous
- Date ranges or filters are unclear

====================
QUERY GENERATION RULES
====================
- Use only SELECT statements
- Prefer explicit column names (avoid SELECT * unless requested)
- Use clear aliases and readable formatting
- Add SQL comments when helpful
- Optimize for correctness and clarity over complexity

====================
RESPONSE FORMAT
====================
When generating a query, respond in this order:

1. Brief explanation of what the query does
2. SQL query inside a code block for copy functionality
3. Optional notes (assumptions, performance tips)

Example:

**Explanation:**
This query retrieves active users created in the last 30 days.

\`\`\`sql
SELECT id, name, created_at
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND status = 'active';
\`\`\`

**Notes:**
- Assumes PostgreSQL syntax for date intervals
- Index on created_at recommended for performance`

const EXAMPLE_PROMPTS = [
    "Show me all active users from the last 7 days",
    "Get top 10 products by revenue this month",
    "Find users who haven't logged in for 30 days",
    "Calculate average order value by customer segment"
]

export function MeshyClient({ databases, userName }: MeshyClientProps) {
    const { toast } = useToast()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [activeConfig, setActiveConfig] = useState<{ provider: string, model: string } | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchActiveConfig = async () => {
            const res = await getActiveAIConfig()
            if (res.success && res.config) {
                setActiveConfig({
                    provider: res.config.provider,
                    model: res.config.model || 'Default'
                })
            }
        }
        fetchActiveConfig()
    }, [])


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Call real AI API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input.trim(),
                    databases: databases
                })
            })

            const data = await response.json()

            if (data.success) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `**Error**: ${data.error || 'Failed to get response from AI. Please check your AI configuration in Settings.'}`,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMessage])
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '**Error**: Failed to connect to AI service. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async (content: string, id: string) => {
        // Extract SQL from code blocks
        const sqlMatch = content.match(/```sql\n([\s\S]*?)\n```/)
        const textToCopy = sqlMatch ? sqlMatch[1] : content

        await navigator.clipboard.writeText(textToCopy)
        setCopiedId(id)
        toast({
            title: 'Copied',
            description: sqlMatch ? 'SQL query copied to clipboard' : 'Message copied to clipboard',
            type: 'success'
        })
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleExampleClick = (example: string) => {
        setInput(example)
    }

    // Simple SQL syntax highlighter
    const SyntaxHighlight = ({ code }: { code: string }) => {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'AS', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'NOT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'HAVING', 'DISTINCT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'VALUES', 'SET', 'INTO']

        const parts = code.split(new RegExp(`(${keywords.join('|')})`, 'g'))

        return (
            <code className="text-[10px] font-mono leading-relaxed">
                {parts.map((part, i) => {
                    if (keywords.includes(part.toUpperCase())) {
                        return <span key={i} className="text-purple-400 font-bold">{part}</span>
                    }
                    // Simple string highlighting
                    if (part.match(/'[^']*'/)) {
                        return <span key={i} className="text-emerald-400">{part}</span>
                    }
                    // Simple number highlighting
                    if (part.match(/\b\d+\b/)) {
                        return <span key={i} className="text-orange-400">{part}</span>
                    }
                    return <span key={i} className="text-muted-foreground">{part}</span>
                })}
            </code>
        )
    }

    const renderMessageContent = (content: string) => {
        // Simple markdown-like rendering
        const parts = content.split(/(```sql[\s\S]*?```)/g)

        return parts.map((part, index) => {
            if (part.startsWith('```sql')) {
                const code = part.replace(/```sql\n?/, '').replace(/\n?```$/, '')
                return (
                    <div key={index} className="mt-2 mb-2 relative group">
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopy(code, `code-${index}`)
                                }}
                                className="p-1 rounded-md bg-background/80 hover:bg-background border border-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {copiedId === `code-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <div className="bg-[#1e1e1e] border border-border/50 rounded-lg p-3 overflow-x-auto shadow-inner">
                            <SyntaxHighlight code={code} />
                        </div>
                    </div>
                )
            }

            // Render bold text
            const boldParts = part.split(/(\*\*.*?\*\*)/g)
            return (
                <span key={index} className="text-xs">
                    {boldParts.map((boldPart, boldIndex) => {
                        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                            return <strong key={boldIndex} className="font-bold">{boldPart.slice(2, -2)}</strong>
                        }
                        return <span key={boldIndex}>{boldPart}</span>
                    })}
                </span>
            )
        })
    }

    return (
        <div className="h-[calc(100vh-14rem)] flex flex-col bg-card/30 backdrop-blur-xl border border-foreground/10 rounded-3xl shadow-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-foreground mb-2">Hi {userName}, Ask Meshy Anything</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                            I'll help you build secure, read-only SQL queries. Try one of these examples:
                        </p>
                        <div className="grid gap-2 w-full max-w-2xl">
                            {EXAMPLE_PROMPTS.map((example, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleExampleClick(example)}
                                    className="p-3 text-left bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all group"
                                >
                                    <Sparkles className="w-3.5 h-3.5 inline mr-2 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    {example}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {messages.map((message, idx) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    "flex gap-3 group",
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-purple-500" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl p-4 relative",
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-foreground/5 border border-foreground/10'
                                )}>
                                    <div className={cn(
                                        "text-sm leading-relaxed whitespace-pre-wrap",
                                        message.role === 'assistant' && 'text-foreground'
                                    )}>
                                        {renderMessageContent(message.content)}
                                    </div>
                                    {message.role === 'assistant' && (
                                        <button
                                            onClick={() => handleCopy(message.content, message.id)}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all"
                                        >
                                            {copiedId === message.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
                        </div>
                        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-foreground/10 bg-card/50 backdrop-blur-xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me to build a SQL query..."
                        disabled={isLoading}
                        className="flex-1 h-12 px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="h-12 px-6 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-3">
                    <span>Meshy can only generate <span className="font-bold text-purple-500">read-only SELECT queries</span></span>
                    {activeConfig && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-foreground/20" />
                            <span className="flex items-center gap-1.5 opacity-50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="uppercase tracking-wider text-[9px]">{activeConfig.provider} • {activeConfig.model}</span>
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}
