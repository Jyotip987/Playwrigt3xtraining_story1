/**
 * LLM provider configuration — src/AI/config/providers.ts
 *
 * Two roles:
 *  1. Legacy CustomReporter AI features (hasApiKey / activeProvider)
 *     – kept for back-compat; uses anthropic | openai | google.
 *
 *  2. LLM Gateway provider catalogue re-export
 *     – imports from LLMGateway.ts so the rest of the codebase can
 *       import provider names from one place.
 */

// ─── Legacy reporter providers (kept for back-compat) ────────────────────────

export type ReporterProviderName = 'anthropic' | 'openai' | 'google';

const REPORTER_KEY_ENV: Record<ReporterProviderName, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_API_KEY',
};

export function activeProvider(): ReporterProviderName | undefined {
    return (Object.keys(REPORTER_KEY_ENV) as ReporterProviderName[]).find(
        (p) => (process.env[REPORTER_KEY_ENV[p]] ?? '').trim().length > 0,
    );
}

export function hasApiKey(): boolean {
    return activeProvider() !== undefined;
}

// ─── Gateway provider names (re-exported for convenience) ────────────────────

export type {
    ProviderName,
    ChatMessage,
    LLMCallOptions,
    LLMResponse,
    RcaVerdictJSON,
} from '../LLMGateway';

export {
    callLLM,
    askJSON,
    askText,
    analyzeTestFailure,
    diagnostics,
} from '../LLMGateway';

/**
 * All providers supported by the LLM Gateway, in auto-pick order.
 */
export const GATEWAY_PROVIDERS = [
    'gemini',
    'groq',
    'openrouter',
    'deepseek',
    'openai',
    'anthropic',
    'github',
] as const;
