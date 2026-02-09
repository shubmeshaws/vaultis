import { getCurrentUser } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'
import { Bot } from 'lucide-react'
import { MeshyClient } from '@/components/meshy/MeshyClient'
import { getUserDatabases } from '@/lib/actions/databaseActions'
import { getActiveAIConfig } from '@/lib/actions/aiConfigActions'
import { OpenAILogo, AnthropicLogo, GoogleLogo, GroqLogo } from '@/components/icons/AIProviderLogos'

export default async function MeshyPage() {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
        redirect('/auth/signin')
    }

    // Fetch user's accessible databases for context
    const { databases = [] } = await getUserDatabases()
    const activeConfigRes = await getActiveAIConfig()
    const activeConfig = activeConfigRes.success ? activeConfigRes.config : null

    const getProviderStyle = (provider: string) => {
        switch (provider) {
            case 'openai': return 'bg-green-500/10 text-green-600 border-green-500/20'
            case 'anthropic': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
            case 'google': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
            case 'groq': return 'bg-red-500/10 text-red-600 border-red-500/20'
            default: return 'bg-muted/50 text-muted-foreground border-foreground/5'
        }
    }

    const getProviderLogo = (provider: string) => {
        switch (provider) {
            case 'openai': return <OpenAILogo className="w-3 h-3" />
            case 'anthropic': return <AnthropicLogo className="w-3 h-3" />
            case 'google': return <GoogleLogo className="w-3 h-3" />
            case 'groq': return <GroqLogo className="w-3 h-3" />
            default: return <Bot className="w-3 h-3" />
        }
    }

    return (
        <div className="space-y-8 p-8 relative min-h-screen">
            {/* Header Section */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-500">
                    <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest text-purple-500">
                            AI Assistant
                        </div>
                        {activeConfig && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getProviderStyle(activeConfig.provider)}`}>
                                <div className="w-3 h-3 flex items-center justify-center">
                                    {getProviderLogo(activeConfig.provider)}
                                </div>
                                <span className="mt-[1px]">{activeConfig.provider}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-current opacity-30 mx-0.5" />
                                <span className="mt-[1px]">{activeConfig.model.split('-')[0]}</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Meshy AI</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                        Your intelligent SQL query builder assistant
                    </p>
                </div>
            </div>

            <MeshyClient databases={databases} userName={currentUser.name || 'User'} />
        </div>
    )
}
