/**
 * LLM Gateway — src/AI/LLMGateway.ts
 *
 * A single, company-policy-aware entry point for every LLM provider your team
 * might be allowed to use.  Pass a prompt (or a full message array), get a
 * typed JSON response back.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Supported providers (all free-tier / open-access friendly)
 * ─────────────────────────────────────────────────────────────────────────────
 *  gemini      → Google Gemini API (powers Antigravity AI)
 *                https://aistudio.google.com/apikey   (free tier available)
 *  groq        → https://console.groq.com             (free, llama-3.3-70b)
 *  openrouter  → https://openrouter.ai                (free ":free" models)
 *  openai      → https://platform.openai.com          (gpt-4o-mini default)
 *  anthropic   → https://console.anthropic.com        (claude-haiku default)
 *  deepseek    → https://platform.deepseek.com        (deepseek-chat)
 *  github      → GitHub Models via OpenAI-compat API
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Company-policy control (via .env)
 * ─────────────────────────────────────────────────────────────────────────────
 *  LLM_PROVIDER          = gemini | groq | openrouter | openai | anthropic | deepseek | github
 *                          Leave empty → auto-pick the first provider whose key exists.
 *
 *  LLM_ALLOWED_PROVIDERS = comma-separated allowlist your company permits.
 *                          Empty / unset → all providers allowed.
 *                          Example:  LLM_ALLOWED_PROVIDERS=gemini,groq
 *
 *  LLM_TIMEOUT_MS        = per-request timeout in ms  (default 60 000)
 *  LLM_MAX_RETRIES       = how many times to retry on 5xx / network error (default 2)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Per-provider keys and optional model overrides
 * ─────────────────────────────────────────────────────────────────────────────
 *  GEMINI_API_KEY / GEMINI_MODEL        (also accepts GOOGLE_API_KEY as fallback)
 *  GROQ_API_KEY / GROQ_MODEL
 *  OPENROUTER_API_KEY / OPENROUTER_MODEL
 *  OPENAI_API_KEY / OPENAI_MODEL
 *  ANTHROPIC_API_KEY / ANTHROPIC_MODEL
 *  DEEPSEEK_API_KEY / DEEPSEEK_MODEL
 *  GITHUB_TOKEN / GITHUB_MODEL          (GitHub Models — PAT with models:read scope)
 */

import https from 'https';
import http from 'http';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProviderName =
    | 'gemini'
    | 'groq'
    | 'openrouter'
    | 'openai'
    | 'anthropic'
    | 'deepseek'
    | 'github';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/** Options accepted by callLLM() */
export interface LLMCallOptions {
    /**
     * Force a specific provider for this call, overriding .env.
     * The provider is still checked against LLM_ALLOWED_PROVIDERS.
     */
    provider?: ProviderName;

    /** Override the model for this call only. */
    model?: string;

    /** System-level instruction injected before user messages. */
    systemPrompt?: string;

    /** Temperature 0–2 (default 0.2 for deterministic JSON). */
    temperature?: number;

    /** Max tokens to generate (default 2048). */
    maxTokens?: number;

    /**
     * When true the gateway asks the model to reply with valid JSON and
     * wraps the raw string in { raw } when it cannot be parsed (never throws).
     */
    jsonMode?: boolean;
}

/** What callLLM() always returns */
export interface LLMResponse<T = unknown> {
    /** The resolved provider that handled the request. */
    provider: ProviderName;
    /** Model that was used. */
    model: string;
    /** Raw text from the model (before JSON parsing). */
    rawText: string;
    /**
     * Parsed JSON object when jsonMode=true and parsing succeeded.
     * Falls back to { raw: rawText } when the model returns non-JSON.
     */
    data: T;
    /** Latency in milliseconds. */
    latencyMs: number;
}

// ─── Provider catalogue ───────────────────────────────────────────────────────

interface ProviderConfig {
    envKey: string;
    defaultModel: string;
    modelEnv: string;
    /** Base URL (no trailing slash) */
    baseUrl: string;
    /** Path for chat completions */
    path: string;
    /** Use Anthropic's native /messages API instead of OpenAI-compat */
    isAnthropic?: boolean;
    /**
     * Use Google Gemini's native generateContent API.
     * The API key is appended as a query param (?key=...) instead of a Bearer header.
     * The model name is embedded in the URL path.
     */
    isGemini?: boolean;
    /** Extra headers to inject (e.g. HTTP-Referer for OpenRouter) */
    extraHeaders?: Record<string, string>;
}

const PROVIDERS: Record<ProviderName, ProviderConfig> = {
    /**
     * Google Gemini — powers Antigravity AI.
     * Free tier available via Google AI Studio.
     * Key: https://aistudio.google.com/apikey
     * Also accepts GOOGLE_API_KEY as a fallback (used by the reporter).
     */
    gemini: {
        envKey: 'GEMINI_API_KEY',
        defaultModel: 'gemini-3.8-flash',
        modelEnv: 'GEMINI_MODEL',
        baseUrl: 'https://generativelanguage.googleapis.com',
        // Model name is interpolated at request build time — placeholder here.
        path: '/v1beta/models/{model}:generateContent',
        isGemini: true,
    },
    groq: {
        envKey: 'GROQ_API_KEY',
        defaultModel: 'llama-3.3-70b-versatile',
        modelEnv: 'GROQ_MODEL',
        baseUrl: 'https://api.groq.com',
        path: '/openai/v1/chat/completions',
    },
    openrouter: {
        envKey: 'OPENROUTER_API_KEY',
        defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
        modelEnv: 'OPENROUTER_MODEL',
        baseUrl: 'https://openrouter.ai',
        path: '/api/v1/chat/completions',
        extraHeaders: {
            'HTTP-Referer': 'https://github.com/your-org/playwright-framework',
            'X-Title': 'Playwright LLM Gateway',
        },
    },
    openai: {
        envKey: 'OPENAI_API_KEY',
        defaultModel: 'gpt-4o-mini',
        modelEnv: 'OPENAI_MODEL',
        baseUrl: 'https://api.openai.com',
        path: '/v1/chat/completions',
    },
    anthropic: {
        envKey: 'ANTHROPIC_API_KEY',
        defaultModel: 'claude-sonnet-4-5',
        modelEnv: 'ANTHROPIC_MODEL',
        baseUrl: 'https://api.anthropic.com',
        path: '/v1/messages',
        isAnthropic: true,
    },
    deepseek: {
        envKey: 'DEEPSEEK_API_KEY',
        defaultModel: 'deepseek-chat',
        modelEnv: 'DEEPSEEK_MODEL',
        baseUrl: 'https://api.deepseek.com',
        path: '/chat/completions',
    },
    github: {
        envKey: 'GITHUB_TOKEN',
        defaultModel: 'gpt-4o-mini',
        modelEnv: 'GITHUB_MODEL',
        baseUrl: 'https://models.inference.ai.azure.com',
        path: '/chat/completions',
    },
};

// ─── Provider resolution ──────────────────────────────────────────────────────

function getAllowedProviders(): Set<ProviderName> | null {
    const raw = (process.env['LLM_ALLOWED_PROVIDERS'] ?? '').trim();
    if (!raw) return null; // null = all allowed
    return new Set(raw.split(',').map((s) => s.trim()) as ProviderName[]);
}

function isProviderAllowed(name: ProviderName): boolean {
    const allowed = getAllowedProviders();
    return allowed === null || allowed.has(name);
}

function hasKey(name: ProviderName): boolean {
    const cfg = PROVIDERS[name];
    const primary = (process.env[cfg.envKey] ?? '').trim().length > 0;
    // Gemini also accepts the existing GOOGLE_API_KEY used by the reporter
    if (name === 'gemini') {
        return primary || (process.env['GOOGLE_API_KEY'] ?? '').trim().length > 0;
    }
    return primary;
}

/**
 * Resolve which provider to use for a given call.
 * Priority:
 *   1. Explicit provider passed to callLLM()
 *   2. LLM_PROVIDER env variable
 *   3. Auto-pick: gemini → groq → openrouter → deepseek → openai → anthropic → github
 */
function resolveProvider(override?: ProviderName): ProviderName {
    const autoOrder: ProviderName[] = [
        'gemini',
        'groq',
        'openrouter',
        'deepseek',
        'openai',
        'anthropic',
        'github',
    ];

    const envProvider = (process.env['LLM_PROVIDER'] ?? '').trim() as ProviderName;
    const candidate: ProviderName | undefined = override ?? (envProvider || undefined);

    if (candidate) {
        if (!PROVIDERS[candidate]) {
            throw new Error(`[LLMGateway] Unknown provider: "${candidate}"`);
        }
        if (!isProviderAllowed(candidate)) {
            throw new Error(
                `[LLMGateway] Provider "${candidate}" is not in your company's allowlist ` +
                    `(LLM_ALLOWED_PROVIDERS=${process.env['LLM_ALLOWED_PROVIDERS']})`,
            );
        }
        if (!hasKey(candidate)) {
            throw new Error(
                `[LLMGateway] Provider "${candidate}" selected but ${PROVIDERS[candidate].envKey} is not set.`,
            );
        }
        return candidate;
    }

    // Auto-pick
    for (const p of autoOrder) {
        if (isProviderAllowed(p) && hasKey(p)) return p;
    }

    throw new Error(
        '[LLMGateway] No usable LLM provider found. ' +
            'Set at least one API key (GEMINI_API_KEY, GOOGLE_API_KEY, GROQ_API_KEY, ' +
            'OPENROUTER_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, ' +
            'or GITHUB_TOKEN) in your .env file.',
    );
}

// ─── HTTP helper (no extra deps — uses Node built-ins) ───────────────────────

function httpsPost(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const parsed = new URL(url);
        const isHttps = parsed.protocol === 'https:';
        const lib = isHttps ? https : http;

        const options: https.RequestOptions = {
            hostname: parsed.hostname,
            port: parsed.port || (isHttps ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                ...headers,
            },
        };

        const req = lib.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8');
                if ((res.statusCode ?? 0) >= 400) {
                    reject(
                        new Error(
                            `[LLMGateway] HTTP ${res.statusCode} from ${parsed.hostname}: ${text.slice(0, 400)}`,
                        ),
                    );
                } else {
                    resolve(text);
                }
            });
        });

        req.setTimeout(timeoutMs, () => {
            req.destroy();
            reject(new Error(`[LLMGateway] Request timed out after ${timeoutMs}ms`));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// ─── Provider-specific request builders ──────────────────────────────────────

/**
 * Build a request for the Google Gemini generateContent API.
 *
 * Key differences from OpenAI-compat:
 *  - API key goes in the query string (?key=...)
 *  - Model name is embedded in the URL path
 *  - System instruction is a top-level field, not a message role
 *  - Contents array uses "user"/"model" roles (not "assistant")
 *  - JSON mode uses generationConfig.responseMimeType = "application/json"
 *
 * Docs: https://ai.google.dev/api/generate-content
 */
function buildGeminiRequest(
    cfg: ProviderConfig,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number,
    jsonMode: boolean,
): { url: string; headers: Record<string, string>; body: unknown } {
    // Prefer GEMINI_API_KEY; fall back to GOOGLE_API_KEY (reporter compat)
    const apiKey =
        (process.env[cfg.envKey] ?? '').trim() ||
        (process.env['GOOGLE_API_KEY'] ?? '').trim();

    // Embed model in path and append key as query param (no Bearer header needed)
    const path = cfg.path.replace('{model}', model);
    const url = `${cfg.baseUrl}${path}?key=${apiKey}`;

    // Separate system instruction from conversation turns
    const systemText = messages.find((m) => m.role === 'system')?.content ?? '';
    const turns = messages.filter((m) => m.role !== 'system');

    // Map OpenAI roles → Gemini roles
    const contents = turns.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
        contents,
        generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
    };

    if (systemText) {
        body['systemInstruction'] = { parts: [{ text: systemText }] };
    }

    return { url, headers: {}, body };
}

function buildOpenAICompatRequest(
    cfg: ProviderConfig,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number,
    jsonMode: boolean,
): { url: string; headers: Record<string, string>; body: unknown } {
    const apiKey = process.env[cfg.envKey]!;
    const body: Record<string, unknown> = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
    };
    if (jsonMode) {
        body['response_format'] = { type: 'json_object' };
    }
    return {
        url: `${cfg.baseUrl}${cfg.path}`,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            ...(cfg.extraHeaders ?? {}),
        },
        body,
    };
}

function buildAnthropicRequest(
    cfg: ProviderConfig,
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number,
): { url: string; headers: Record<string, string>; body: unknown } {
    const apiKey = process.env[cfg.envKey]!;

    // Anthropic separates system from human/assistant turns
    const system = messages.find((m) => m.role === 'system')?.content ?? '';
    const turns = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

    const body: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        temperature,
        messages: turns,
    };
    if (system) body['system'] = system;

    return {
        url: `${cfg.baseUrl}${cfg.path}`,
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body,
    };
}

// ─── Response text extraction ─────────────────────────────────────────────────

function extractText(rawJson: string, cfg: ProviderConfig): string {
    const parsed = JSON.parse(rawJson);
    if (cfg.isGemini) {
        // { candidates: [{ content: { parts: [{ text: "..." }] } }] }
        return (parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '') as string;
    }
    if (cfg.isAnthropic) {
        // { content: [{ type: 'text', text: '...' }] }
        return (parsed.content?.[0]?.text ?? '') as string;
    }
    // OpenAI-compat: { choices: [{ message: { content: '...' } }] }
    return (parsed.choices?.[0]?.message?.content ?? '') as string;
}

// ─── Main gateway function ────────────────────────────────────────────────────

/**
 * Send a prompt (or message array) to the best available LLM and get back
 * a fully-typed LLMResponse.
 *
 * @example — simple string prompt
 * ```ts
 * const res = await callLLM('List three benefits of TypeScript as JSON array.');
 * console.log(res.data);
 * ```
 *
 * @example — with explicit options
 * ```ts
 * const res = await callLLM<{ bugs: string[] }>(
 *   'Analyze this error and return JSON with a "bugs" array.',
 *   { provider: 'groq', jsonMode: true, systemPrompt: 'You are a QA expert.' }
 * );
 * console.log(res.data.bugs);
 * ```
 *
 * @example — multi-turn conversation
 * ```ts
 * const res = await callLLM([
 *   { role: 'system', content: 'You are a Playwright testing assistant.' },
 *   { role: 'user',   content: 'What is the best way to handle flaky tests?' },
 * ], { jsonMode: true });
 * ```
 */
export async function callLLM<T = unknown>(
    prompt: string | ChatMessage[],
    options: LLMCallOptions = {},
): Promise<LLMResponse<T>> {
    // ── 1. Resolve provider & config ──────────────────────────────────────────
    const providerName = resolveProvider(options.provider);
    const cfg = PROVIDERS[providerName];

    const envModel = (process.env[cfg.modelEnv] ?? '').trim();
    const model = options.model ?? (envModel || cfg.defaultModel);

    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 2048;
    const jsonMode = options.jsonMode ?? false;
    const timeoutMs = parseInt(process.env['LLM_TIMEOUT_MS'] ?? '60000', 10);
    const maxRetries = parseInt(process.env['LLM_MAX_RETRIES'] ?? '2', 10);

    // ── 2. Build message array ────────────────────────────────────────────────
    let messages: ChatMessage[];
    if (typeof prompt === 'string') {
        messages = [];
        const sys = options.systemPrompt?.trim();
        if (sys) {
            messages.push({ role: 'system', content: sys });
        } else if (jsonMode) {
            messages.push({
                role: 'system',
                content:
                    'You are a helpful assistant. Always respond with valid JSON only, ' +
                    'no markdown fences, no extra prose.',
            });
        }
        messages.push({ role: 'user', content: prompt });
    } else {
        messages = prompt;
        // Inject system prompt if caller passed one alongside a message array
        if (options.systemPrompt && !messages.find((m) => m.role === 'system')) {
            messages = [{ role: 'system', content: options.systemPrompt }, ...messages];
        }
    }

    // ── 3. Build request ──────────────────────────────────────────────────────
    const { url, headers, body } = cfg.isGemini
        ? buildGeminiRequest(cfg, messages, model, temperature, maxTokens, jsonMode)
        : cfg.isAnthropic
          ? buildAnthropicRequest(cfg, messages, model, temperature, maxTokens)
          : buildOpenAICompatRequest(cfg, messages, model, temperature, maxTokens, jsonMode);

    // ── 4. Call with retry ────────────────────────────────────────────────────
    let lastError: Error | undefined;
    const t0 = Date.now();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const rawJson = await httpsPost(url, headers, body, timeoutMs);
            const rawText = extractText(rawJson, cfg);
            const latencyMs = Date.now() - t0;

            // ── 5. Parse JSON if requested ────────────────────────────────────
            let data: T;
            if (jsonMode) {
                try {
                    // Strip markdown code fences some models add despite instructions
                    const cleaned = rawText
                        .replace(/^```(?:json)?\s*/i, '')
                        .replace(/```\s*$/i, '')
                        .trim();
                    data = JSON.parse(cleaned) as T;
                } catch {
                    // Model returned non-JSON — wrap gracefully
                    data = { raw: rawText } as unknown as T;
                }
            } else {
                data = rawText as unknown as T;
            }

            return { provider: providerName, model, rawText, data, latencyMs };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const isRetryable =
                lastError.message.includes('HTTP 5') ||
                lastError.message.includes('timed out') ||
                lastError.message.includes('ECONNRESET') ||
                lastError.message.includes('ENOTFOUND');

            if (!isRetryable || attempt === maxRetries) break;

            // Exponential back-off: 1s, 2s, 4s …
            await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
    }

    throw lastError ?? new Error('[LLMGateway] Unknown error');
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

/**
 * Ask the LLM to analyze a Playwright test failure and return a structured
 * root-cause verdict as JSON.
 */
export async function analyzeTestFailure(input: {
    testTitle: string;
    errorMessage: string;
    stackTrace?: string;
    file?: string;
    provider?: ProviderName;
}): Promise<LLMResponse<RcaVerdictJSON>> {
    const prompt =
        `A Playwright test failed. Analyze it and return ONLY valid JSON with ` +
        `these exact keys: rootCause (string), severity ("low"|"medium"|"high"), ` +
        `priority ("P0"|"P1"|"P2"|"P3"), fixes (string[]).\n\n` +
        `Test: ${input.testTitle}\n` +
        `File: ${input.file ?? 'unknown'}\n` +
        `Error: ${input.errorMessage}\n` +
        (input.stackTrace ? `Stack:\n${input.stackTrace.slice(0, 800)}\n` : '');

    return callLLM<RcaVerdictJSON>(prompt, {
        provider: input.provider,
        jsonMode: true,
        systemPrompt: 'You are a senior QA engineer specializing in Playwright automation.',
        temperature: 0.1,
    });
}

export interface RcaVerdictJSON {
    rootCause: string;
    severity: 'low' | 'medium' | 'high';
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    fixes: string[];
}

/**
 * Quick helper: send any prompt, get a JSON object back.
 * Shorthand for callLLM(prompt, { jsonMode: true }).
 */
export async function askJSON<T = Record<string, unknown>>(
    prompt: string,
    options: Omit<LLMCallOptions, 'jsonMode'> = {},
): Promise<T> {
    const res = await callLLM<T>(prompt, { ...options, jsonMode: true });
    return res.data;
}

/**
 * Quick helper: send any prompt, get a plain-text string back.
 */
export async function askText(
    prompt: string,
    options: Omit<LLMCallOptions, 'jsonMode'> = {},
): Promise<string> {
    const res = await callLLM<string>(prompt, { ...options, jsonMode: false });
    return res.rawText;
}

// ─── Diagnostic helper ────────────────────────────────────────────────────────

/**
 * Log which providers are available/allowed in the current environment.
 * Useful for debugging in CI.
 */
export function diagnostics(): void {
    const allowlist = getAllowedProviders();
    const resolved = (() => {
        try {
            return resolveProvider();
        } catch {
            return 'none';
        }
    })();

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       LLM Gateway — Diagnostics      ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║ Active provider : ${resolved.padEnd(18)}║`);
    console.log(
        `║ Allowlist       : ${(allowlist ? [...allowlist].join(',') : 'all').padEnd(18)}║`,
    );
    console.log('╠══════════════════════════════════════╣');

    for (const [name, cfg] of Object.entries(PROVIDERS) as [ProviderName, ProviderConfig][]) {
        const keyPresent = hasKey(name);
        const allowed = isProviderAllowed(name);
        const status = !allowed ? '✗ blocked' : keyPresent ? '✓ ready  ' : '○ no key ';
        console.log(`║  ${name.padEnd(12)} ${status}              ║`);
    }

    console.log('╚══════════════════════════════════════╝\n');
}
