/**
 * AIDataGenerator — LLM-backed test-data factory.
 *
 * Drop-in companion to DataGenerator.  Each method mirrors its Faker
 * counterpart but generates data via the LLM Gateway (Gemini / Groq /
 * OpenRouter / …) so the data is contextually realistic rather than
 * purely random.
 *
 * src/AI/AIDataGenerator.ts
 *
 * Usage:
 *   import { AIDataGenerator } from '@ai/AIDataGenerator';
 *   const customer = await AIDataGenerator.checkoutCustomer();
 *   // → { firstName: 'Priya', lastName: 'Sharma', postalCode: '110001' }
 *
 * Fallback:
 *   If no LLM key is set the method falls back to DataGenerator (Faker)
 *   so tests never break in keyless CI environments.
 */

import 'dotenv/config';
import { CheckoutCustomer, DataGenerator } from '../utils/DataGenerator';
import { askJSON } from './LLMGateway';
import {
    CHECKOUT_CUSTOMER_SYSTEM,
    checkoutCustomerPrompt,
} from './prompts/checkoutCustomer.prompt';

export class AIDataGenerator {
    /**
     * Generate a CheckoutCustomer using the configured LLM.
     *
     * @param hint  Optional persona hint, e.g. "Indian name and postal code".
     *              Passed verbatim to the prompt so the AI tailors the data.
     * @returns     A fully-populated CheckoutCustomer ready for fillGuest().
     *
     * @example
     *   const customer = await AIDataGenerator.checkoutCustomer();
     *   const indian   = await AIDataGenerator.checkoutCustomer('Indian name');
     */
    static async checkoutCustomer(hint = ''): Promise<CheckoutCustomer> {
        const hasKey =
            (process.env['GEMINI_API_KEY'] ?? process.env['GOOGLE_API_KEY'] ??
                process.env['GROQ_API_KEY'] ?? process.env['OPENROUTER_API_KEY'] ??
                process.env['OPENAI_API_KEY'] ?? process.env['ANTHROPIC_API_KEY'] ??
                process.env['DEEPSEEK_API_KEY'] ?? process.env['GITHUB_TOKEN'] ?? '').trim();

        // Graceful fallback — no key → Faker (tests keep passing in keyless CI)
        if (!hasKey) {
            console.warn('[AIDataGenerator] No LLM key found — falling back to Faker.');
            return DataGenerator.customerCheckOut();
        }

        try {
            const data = await askJSON<CheckoutCustomer>(checkoutCustomerPrompt(hint), {
                systemPrompt: CHECKOUT_CUSTOMER_SYSTEM,
                temperature: 0.9,   // higher = more variety across runs
                maxTokens: 128,     // the response is tiny
            });

            // Validate the shape — guard against a malformed LLM reply
            if (data.firstName && data.lastName && data.postalCode) {
                return data;
            }

            console.warn('[AIDataGenerator] LLM returned unexpected shape, falling back to Faker.', data);
            return DataGenerator.customerCheckOut();
        } catch (err) {
            console.warn('[AIDataGenerator] LLM call failed, falling back to Faker.', err);
            return DataGenerator.customerCheckOut();
        }
    }
}
