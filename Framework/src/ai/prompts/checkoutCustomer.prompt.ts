/**
 * Prompts for AI-generated checkout test data.
 *
 * Keep prompt templates here so they can be tuned independently of the
 * utility code that calls them.  The LLM gateway picks up the template
 * and returns a JSON object matching CheckoutCustomer.
 *
 * src/AI/prompts/checkoutCustomer.prompt.ts
 */

/**
 * System instruction sent to the LLM for checkout-customer generation.
 * Tells the model to behave as a test-data factory, not a chatbot.
 */
export const CHECKOUT_CUSTOMER_SYSTEM =
    'You are a test-data generator for an e-commerce checkout form. ' +
    'Always reply with ONLY valid JSON — no markdown, no extra prose.';

/**
 * User prompt that requests a single CheckoutCustomer object.
 *
 * The LLM must return exactly:
 *   { "firstName": "...", "lastName": "...", "postalCode": "..." }
 *
 * Optional hint lets callers steer the locale / persona without changing
 * the core schema (e.g. "Indian name" or "French postal code").
 */
export function checkoutCustomerPrompt(hint = ''): string {
    return (
        'Generate realistic checkout customer data for an e-commerce test. ' +
        'Return ONLY this JSON schema — no other keys:\n' +
        '{\n' +
        '  "firstName":  "<realistic first name>",\n' +
        '  "lastName":   "<realistic last name>",\n' +
        '  "postalCode": "<valid postal code>"\n' +
        '}\n' +
        (hint ? `Persona hint: ${hint}` : '')
    );
}

