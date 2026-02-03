import { NextRequest, NextResponse } from 'next/server'
import { getActiveAIConfig } from '@/lib/actions/aiConfigActions'
import { getCurrentUser } from '@/lib/auth/middleware'

const MESHY_SYSTEM_INSTRUCTIONS = `You are an AI SQL Query Builder Agent named "Meshy" integrated into a database query platform.

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

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { message, databases, schemaContext, selectedDatabase } = await req.json()

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
        }

        // Get active AI configuration
        const configResult = await getActiveAIConfig()
        if (!configResult.success || !configResult.config) {
            return NextResponse.json({
                success: false,
                error: 'No AI provider configured. Please configure an AI provider in Settings.'
            }, { status: 400 })
        }

        const { provider, apiKey, model, endpoint } = configResult.config

        // Add database/schema context to system instructions
        const databaseInfo = schemaContext || (databases && databases.length > 0
            ? `Available databases: ${databases.map((db: any) => db.name).join(', ')}`
            : '')

        const selectionInfo = selectedDatabase
            ? `\n\nUSER HAS SELECTED DATABASE: "${selectedDatabase.name}" (${selectedDatabase.type})\nPrioritize this database for generating queries.`
            : ''

        const schemaSection = schemaContext
            ? `\n\n====================\nAVAILABLE SCHEMA\n====================\n${schemaContext}\n\nUse ONLY the tables and columns listed above.\nDO NOT assume or invent tables/columns that aren't shown.${selectionInfo}`
            : databaseInfo ? `\n\n${databaseInfo}${selectionInfo}` : ''

        const userContext = `\n\nYou are chatting with a user named "${user.name}". When appropriate, address them by name.`

        const fullSystemInstructions = MESHY_SYSTEM_INSTRUCTIONS + schemaSection + userContext

        let response
        switch (provider) {
            case 'openai':
                response = await callOpenAI(apiKey, model || 'gpt-4-turbo-preview', fullSystemInstructions, message)
                break
            case 'anthropic':
                response = await callAnthropic(apiKey, model || 'claude-3-5-sonnet-20241022', fullSystemInstructions, message)
                break
            case 'google':
                response = await callGoogle(apiKey, model || 'gemini-1.5-flash-001', fullSystemInstructions, message)
                break
            case 'groq':
                response = await callGroq(apiKey, model || 'llama-3.1-70b-versatile', fullSystemInstructions, message)
                break
            default:
                return NextResponse.json({ success: false, error: 'Unsupported provider' }, { status: 400 })
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 })
    }
}

async function callOpenAI(apiKey: string, model: string, systemInstructions: string, userMessage: string) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemInstructions },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        })

        if (response.ok) {
            const data = await response.json()
            return { success: true, message: data.choices[0].message.content }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'OpenAI API error' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to OpenAI' }
    }
}

async function callAnthropic(apiKey: string, model: string, systemInstructions: string, userMessage: string) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model,
                system: systemInstructions,
                messages: [{ role: 'user', content: userMessage }],
                max_tokens: 1024
            })
        })

        if (response.ok) {
            const data = await response.json()
            return { success: true, message: data.content[0].text }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Anthropic API error' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to Anthropic' }
    }
}

async function callGoogle(apiKey: string, model: string, systemInstructions: string, userMessage: string) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemInstructions}\n\nUser: ${userMessage}` }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000
                    }
                })
            }
        )

        if (response.ok) {
            const data = await response.json()
            return { success: true, message: data.candidates[0].content.parts[0].text }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Google API error' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to Google' }
    }
}

async function callGroq(apiKey: string, model: string, systemInstructions: string, userMessage: string) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemInstructions },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        })

        if (response.ok) {
            const data = await response.json()
            return { success: true, message: data.choices[0].message.content }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Groq API error' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to Groq' }
    }
}
