import { NextRequest, NextResponse } from 'next/server'
import { getActiveAIConfig } from '@/lib/actions/aiConfigActions'

// Test API configuration by making a lightweight request
export async function POST(req: NextRequest) {
    try {
        const { provider, apiKey, endpoint } = await req.json()

        if (!provider || !apiKey) {
            return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 })
        }

        let testResult: { success: boolean; error?: string; message?: string } = { success: false, error: 'Unknown provider' }

        switch (provider) {
            case 'openai':
                testResult = await testOpenAI(apiKey)
                break
            case 'anthropic':
                testResult = await testAnthropic(apiKey)
                break
            case 'google':
                testResult = await testGoogle(apiKey)
                break
            case 'groq':
                testResult = await testGroq(apiKey)
                break
        }

        return NextResponse.json(testResult)
    } catch (error) {
        console.error('Test API error:', error)
        return NextResponse.json({ success: false, error: 'Test failed' }, { status: 500 })
    }
}

async function testOpenAI(apiKey: string) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        })

        if (response.ok) {
            return { success: true, message: 'OpenAI API key is valid' }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Invalid API key' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to OpenAI' }
    }
}

async function testAnthropic(apiKey: string) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }]
            })
        })

        if (response.ok) {
            return { success: true, message: 'Anthropic API key is valid' }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Invalid API key' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to Anthropic' }
    }
}

async function testGoogle(apiKey: string) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

        if (response.ok) {
            return { success: true, message: 'Google API key is valid' }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Invalid API key' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to Google' }
    }
}

async function testGroq(apiKey: string) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        })

        if (response.ok) {
            return { success: true, message: 'Groq API key is valid' }
        } else {
            const error = await response.json()
            return { success: false, error: error.error?.message || 'Invalid API key' }
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to Groq' }
    }
}
