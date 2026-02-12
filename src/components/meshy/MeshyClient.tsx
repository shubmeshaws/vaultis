'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Copy, Check, Bot, User, Sparkles, Table } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'
import { getActiveAIConfig } from '@/lib/actions/aiConfigActions'
import { getDatabaseSchema } from '@/lib/actions/databaseActions'

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
    const [databaseSchemas, setDatabaseSchemas] = useState<any[]>([])
    const [isLoadingSchemas, setIsLoadingSchemas] = useState(false)
    const [schemaContext, setSchemaContext] = useState<string>('')
    const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null)
    const [selectedTableName, setSelectedTableName] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch active AI config on mount
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

    // Auto-fetch database schemas on mount
    useEffect(() => {
        const fetchSchemas = async () => {
            if (databases.length === 0) return

            setIsLoadingSchemas(true)
            const schemas: any[] = []

            for (const db of databases) {
                try {
                    const result = await getDatabaseSchema(db.id)
                    if (result.success) {
                        schemas.push({
                            ...result,
                            id: db.id,
                            name: db.name
                        })
                    }
                } catch (error) {
                    console.error(`Failed to fetch schema for ${db.name}:`, error)
                }
            }

            setDatabaseSchemas(schemas)
            setIsLoadingSchemas(false)

            // Build formatted schema context
            const formatted = schemas.map(dbSchema => {
                const dbInfo = `📦 ${dbSchema.database?.name || dbSchema.name} (${dbSchema.database?.type || 'Unknown'})`
                const tables = dbSchema.schema?.tables?.map((table: any) => {
                    const cols = table.columns?.map((col: any) => {
                        const constraints = [
                            col.isPrimaryKey && 'PK',
                            col.isForeignKey && 'FK',
                            col.isUnique && 'UNIQUE',
                            !col.nullable && 'NOT NULL'
                        ].filter(Boolean).join(', ')
                        const constraintStr = constraints ? ` [${constraints}]` : ''
                        return `    - ${col.name}: ${col.type}${constraintStr}`
                    }).join('\n') || '    (no columns)'
                    return `  └─ ${table.name}\n${cols}`
                }).join('\n') || '  (no tables)'
                return `${dbInfo}\n${tables}`
            }).join('\n\n')

            setSchemaContext(formatted)
        }

        fetchSchemas()
    }, [databases])


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (overrideMessage?: string) => {
        const messageText = overrideMessage || input.trim()
        if (!messageText || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        if (!overrideMessage) setInput('')
        setIsLoading(true)

        try {
            // Check if Puter is active
            if (activeConfig?.provider === 'puter') {
                if (!(window as any).puter) {
                    // Fallback if script not loaded
                    throw new Error('Puter.js not loaded')
                }

                const selectedDb = databases.find(db => db.id === selectedDatabaseId)
                const schemaInfo = schemaContext || `Available databases: ${databases.map((db: any) => db.name).join(', ')}`
                const activeDbInfo = selectedDb ? `\n\nUSER HAS SELECTED DATABASE: "${selectedDb.name}" (${selectedDb.type})\nFocus on this database unless asked otherwise.` : ''

                const systemWithContext = `${SYSTEM_INSTRUCTIONS}\n\n====================\nAVAILABLE SCHEMA\n====================\n${schemaInfo}${activeDbInfo}\n\nUse ONLY the tables and columns listed above.\nDO NOT assume or invent tables/columns that aren't shown.\n\nUser: ${userName}`

                // Call Puter directly (Client Side)
                const resp = await (window as any).puter.ai.chat(
                    systemWithContext + '\n\n' + messageText,
                    { model: activeConfig.model }
                )

                if (resp) {
                    // Extract text content from Puter response
                    let textContent = ''

                    // Handle Anthropic content blocks format: [{"type":"text","text":"..."}]
                    if (Array.isArray(resp) && resp.length > 0 && resp[0].type === 'text') {
                        textContent = resp.map((block: any) => block.text || '').join('')
                    } else if (typeof resp === 'string') {
                        textContent = resp
                    } else if (resp.message?.content) {
                        // Handle nested content that might be an array of blocks
                        if (Array.isArray(resp.message.content) && resp.message.content.length > 0 && resp.message.content[0]?.type === 'text') {
                            textContent = resp.message.content.map((block: any) => block.text || '').join('')
                        } else {
                            textContent = typeof resp.message.content === 'string'
                                ? resp.message.content
                                : JSON.stringify(resp.message.content)
                        }
                    } else if (resp.content) {
                        // Handle content that might be an array of blocks
                        if (Array.isArray(resp.content) && resp.content.length > 0 && resp.content[0]?.type === 'text') {
                            textContent = resp.content.map((block: any) => block.text || '').join('')
                        } else {
                            textContent = typeof resp.content === 'string'
                                ? resp.content
                                : JSON.stringify(resp.content)
                        }
                    } else if (resp.text) {
                        textContent = resp.text
                    } else {
                        textContent = JSON.stringify(resp)
                    }

                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: textContent,
                        timestamp: new Date()
                    }
                    setMessages(prev => [...prev, aiMessage])
                    setIsLoading(false)
                    return // EXIT EARLY, do not call server API
                }
            }

            const selectedDb = databases.find(db => db.id === selectedDatabaseId)

            // Call real AI API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    databases: databases,
                    schemaContext: schemaContext,
                    selectedDatabase: selectedDb ? { name: selectedDb.name, type: selectedDb.type } : null
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

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy)
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement("textarea")
                textArea.value = textToCopy
                textArea.style.position = "fixed"
                textArea.style.left = "-9999px"
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }
            
            setCopiedId(id)
            toast({
                title: 'Copied',
                description: sqlMatch ? 'SQL query copied to clipboard' : 'Message copied to clipboard',
                type: 'success'
            })
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            toast({
                title: 'Error',
                description: 'Failed to copy to clipboard',
                type: 'error'
            })
        }
    }

    const handleDatabaseSelect = (db: any) => {
        setSelectedDatabaseId(db.id)
        setSelectedTableName(null)
        handleSend(`I want to query the "${db.name}" (${db.type}) database.`)
    }

    const handleTableSelect = (tableName: string) => {
        setSelectedTableName(tableName)
        handleSend(`I want to query the "${tableName}" table.`)
    }

    const handleExampleClick = (example: string) => {
        handleSend(example)
    }

    // Enhanced SQL syntax highlighter with vibrant colors
    const SyntaxHighlight = ({ code }: { code: string }) => {
        const lines = code.split('\n')

        const highlightLine = (line: string) => {
            // SQL Keywords (purple)
            const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AS', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS', 'NULL', 'NOT', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'HAVING', 'WITH', 'RECURSIVE']

            // Aggregate Functions (cyan)
            const functions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'STDDEV', 'VARIANCE', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT', 'SUBSTRING', 'CONCAT', 'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DATE', 'TIME', 'TIMESTAMP', 'INTERVAL', 'EXTRACT', 'DATE_TRUNC', 'TO_CHAR', 'TO_DATE', 'TO_TIMESTAMP']

            // DML/DDL Keywords (red - for emphasis on modification)
            const modificationKeywords = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'VALUES', 'SET', 'INTO']

            // Table context keywords
            const tableContextKeywords = ['FROM', 'JOIN']

            // Check for comments first
            if (line.trim().startsWith('--')) {
                return <span className="text-gray-500 italic">{line}</span>
            }

            // Split by spaces and special characters while preserving them
            const tokens = line.split(/(\s+|[(),;=<>!+\-*/%])/)

            // Track if the next identifier should be highlighted as a table name
            let nextIsTableName = false

            return tokens.map((token, i) => {
                const upperToken = token.toUpperCase()
                const trimmedToken = token.trim()

                // Skip empty tokens
                if (!trimmedToken) {
                    return <span key={i}>{token}</span>
                }

                // Check if this token is a table context keyword (FROM or JOIN)
                if (tableContextKeywords.some(k => upperToken.includes(k))) {
                    nextIsTableName = true
                }

                // If we just saw FROM/JOIN and this is an identifier, it's a table name!
                if (nextIsTableName && trimmedToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) && !keywords.includes(upperToken) && !functions.includes(upperToken) && !modificationKeywords.includes(upperToken)) {
                    nextIsTableName = false
                    return <span key={i} className="text-amber-400 font-bold">{token}</span>
                }

                // Reset if we hit something that's not whitespace or an identifier
                if (trimmedToken && !trimmedToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                    nextIsTableName = false
                }

                // Keywords (purple/violet)
                if (keywords.includes(upperToken)) {
                    return <span key={i} className="text-violet-400 font-semibold">{token}</span>
                }

                // Functions (cyan)
                if (functions.includes(upperToken)) {
                    return <span key={i} className="text-cyan-400 font-semibold">{token}</span>
                }

                // Modification keywords (red/pink)
                if (modificationKeywords.includes(upperToken)) {
                    return <span key={i} className="text-rose-400 font-bold">{token}</span>
                }

                // Strings (green)
                if (token.match(/^'[^']*'$/)) {
                    return <span key={i} className="text-emerald-400">{token}</span>
                }

                // Numbers (orange)
                if (token.match(/^\d+(\.\d+)?$/)) {
                    return <span key={i} className="text-orange-400">{token}</span>
                }

                // Operators (yellow)
                if (token.match(/^[=<>!+\-*\/%]+$/)) {
                    return <span key={i} className="text-yellow-400">{token}</span>
                }

                // Special characters/punctuation (gray)
                if (token.match(/^[(),;]$/)) {
                    return <span key={i} className="text-gray-400">{token}</span>
                }

                // Table/column names and identifiers (blue/light)
                if (token.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) && !keywords.includes(upperToken) && !functions.includes(upperToken)) {
                    return <span key={i} className="text-blue-300">{token}</span>
                }

                // Whitespace and everything else
                return <span key={i} className="text-gray-300">{token}</span>
            })
        }

        return (
            <code className="text-[10px] font-mono leading-relaxed block">
                {lines.map((line, idx) => (
                    <div key={idx}>
                        {highlightLine(line)}
                    </div>
                ))}
            </code>
        )
    }

    const renderMessageContent = (content: string) => {
        // Ensure content is a string
        if (typeof content !== 'string') {
            content = String(content)
        }

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
                        {isLoadingSchemas && (
                            <p className="text-xs text-purple-500 mb-2 flex items-center gap-1.5 justify-center">
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                Loading database schemas...
                            </p>
                        )}
                        {!isLoadingSchemas && databaseSchemas.length > 0 && (
                            <p className="text-xs text-emerald-500 mb-2">
                                ✓ Loaded {databaseSchemas.length} database{databaseSchemas.length !== 1 ? 's' : ''} with full schema
                            </p>
                        )}

                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                            I&apos;ll help you build secure, read-only SQL queries. Try one of these examples:
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
                {/* Contextual Suggestions */}
                <div className="mb-4">
                    {!selectedDatabaseId ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Select database for which you want query :</p>
                            <div className="flex flex-wrap gap-2">
                                {databases.map((db: any) => (
                                    <button
                                        key={db.id}
                                        onClick={() => handleDatabaseSelect(db)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-muted-foreground hover:text-foreground transition-all"
                                    >
                                        {db.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : !selectedTableName ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground font-medium">Select table for which you want query :</p>
                                <button
                                    onClick={() => setSelectedDatabaseId(null)}
                                    className="text-[10px] text-purple-500 hover:underline"
                                >
                                    Change Database
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {databaseSchemas.find(s => s.id === selectedDatabaseId)?.schema?.tables?.map((table: any) => (
                                    <button
                                        key={table.name}
                                        onClick={() => handleTableSelect(table.name)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 text-purple-400 hover:text-purple-300 transition-all"
                                    >
                                        {table.name}
                                    </button>
                                )) || (
                                        <p className="text-[10px] text-muted-foreground italic">
                                            {isLoadingSchemas ? "Loading tables..." : "No tables found"}
                                        </p>
                                    )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-medium">
                                Database: {databases.find(db => db.id === selectedDatabaseId)?.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium">
                                Table: {selectedTableName}
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedTableName(null)
                                }}
                                className="text-[10px] text-muted-foreground hover:text-foreground ml-auto"
                            >
                                Reset Selection
                            </button>
                        </div>
                    )}
                </div>

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
                        onClick={() => handleSend()}
                        disabled={isLoading || !activeConfig}
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
                                <span className="uppercase tracking-wider text-[9px]">
                                    {activeConfig.provider === 'puter' ? 'PUTER.JS (CLIENT)' : activeConfig.provider} • {activeConfig.model}
                                </span>
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}
