/**
 * LLM Gateway — Usage Examples
 * src/AI/examples/llmGatewayExamples.ts
 *
 * Run with:
 *   npx ts-node src/AI/examples/llmGatewayExamples.ts
 *
 * Make sure your .env file has at least one provider key set.
 */

import 'dotenv/config';
import {
    callLLM,
    askJSON,
    askText,
    analyzeTestFailure,
    diagnostics,
} from '../LLMGateway';

// ─── Show which providers are available ───────────────────────────────────────
diagnostics();

// ─── Example 0: Google Gemini (Antigravity AI engine) ────────────────────────
async function example0_gemini() {
    console.log('\n── Example 0: Google Gemini / Antigravity ──');
    // Requires GEMINI_API_KEY (or GOOGLE_API_KEY) in .env
    // Free key: https://aistudio.google.com/apikey
    const res = await callLLM(
        'List two advantages of using Gemini for Playwright test automation. ' +
            'Return JSON: { "advantages": ["...", "..."] }',
        {
            provider: 'gemini',
            jsonMode: true,
            // model: 'gemini-1.5-pro',   // optional override — defaults to gemini-2.0-flash
        },
    );
    console.log(`Provider  : ${res.provider} (${res.model})`);
    console.log(`Latency   : ${res.latencyMs}ms`);
    console.log('Data      :', JSON.stringify(res.data, null, 2));
}

// ─── Example 1: Plain text response ──────────────────────────────────────────
async function example1_plainText() {
    console.log('\n── Example 1: Plain Text ──────────────────');
    const text = await askText('In one sentence, what is Playwright?');
    console.log('Response:', text);
}

// ─── Example 2: JSON response (generic) ───────────────────────────────────────
async function example2_jsonResponse() {
    console.log('\n── Example 2: JSON Response ───────────────');
    const data = await askJSON<{ benefits: string[] }>(
        'List 3 benefits of using Playwright for E2E testing. ' +
            'Return JSON: { "benefits": ["...", "...", "..."] }',
    );
    console.log('Benefits JSON:', JSON.stringify(data, null, 2));
}

// ─── Example 3: Full callLLM with explicit provider + system prompt ───────────
async function example3_explicitProvider() {
    console.log('\n── Example 3: callLLM with options ────────');
    const res = await callLLM(
        'What HTTP status code means "Too Many Requests"? Return JSON: { "code": <number>, "name": "<string>" }',
        {
            // provider: 'groq',       // ← uncomment to force a specific provider
            jsonMode: true,
            systemPrompt: 'You are an HTTP reference expert. Always respond with valid JSON.',
            temperature: 0,
        },
    );
    console.log(`Provider used : ${res.provider} (${res.model})`);
    console.log(`Latency       : ${res.latencyMs}ms`);
    console.log('Data          :', JSON.stringify(res.data, null, 2));
}

// ─── Example 4: Multi-turn conversation ───────────────────────────────────────
async function example4_multiTurn() {
    console.log('\n── Example 4: Multi-turn conversation ─────');
    const res = await callLLM(
        [
            { role: 'system', content: 'You are a Playwright testing assistant.' },
            { role: 'user', content: 'What causes a strict mode violation in Playwright?' },
            {
                role: 'assistant',
                content:
                    'A strict mode violation occurs when a locator matches more than one element.',
            },
            {
                role: 'user',
                content: 'Give me one code fix as JSON: { "fix": "<code snippet>" }',
            },
        ],
        { jsonMode: true },
    );
    console.log('Fix JSON:', JSON.stringify(res.data, null, 2));
}

// ─── Example 5: Analyze a Playwright test failure (RCA) ───────────────────────
async function example5_analyzeFailure() {
    console.log('\n── Example 5: Test Failure RCA ────────────');
    const rca = await analyzeTestFailure({
        testTitle: 'User can add item to cart',
        file: 'src/tests/cartTests/addToCart.spec.ts',
        errorMessage: 'strict mode violation: locator(".add-btn") resolved to 3 elements',
        stackTrace: `Error: strict mode violation
    at Page.click (playwright/lib/page.js:100)
    at addToCart.spec.ts:45`,
    });
    console.log(`Provider  : ${rca.provider}`);
    console.log('RCA Verdict:', JSON.stringify(rca.data, null, 2));
}

// ─── Run all examples ─────────────────────────────────────────────────────────
(async () => {
    try {
        // Run Gemini example only if the key is set; skip gracefully otherwise
        const geminiKey =
            (process.env['GEMINI_API_KEY'] ?? '') || (process.env['GOOGLE_API_KEY'] ?? '');
        if (geminiKey.trim()) {
            await example0_gemini();
        } else {
            console.log('\n── Example 0 skipped — set GEMINI_API_KEY or GOOGLE_API_KEY to run it.');
        }

        await example1_plainText();
        await example2_jsonResponse();
        await example3_explicitProvider();
        await example4_multiTurn();
        await example5_analyzeFailure();
        console.log('\n✅ All examples completed successfully.');
    } catch (err) {
        console.error('\n❌ Error:', err instanceof Error ? err.message : err);
        process.exit(1);
    }
})();
