// visualSteps.ts — extended to support BOTH TTA + Allure reporters

import { test, type Page, type TestInfo } from '@playwright/test';

const ATTACH_SCREENSHOTS = process.env.ATTACH_SCREENSHOTS?.toLowerCase() === 'true';

const stepCounters = new WeakMap<TestInfo, number>();

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function allureStep(
    page: Page,
    title: string,
    body: () => Promise<void>,
): Promise<void> {
    // test.step() feeds BOTH the TTA custom reporter AND Allure v3 automatically
    await test.step(title, async () => {
        await body();

        const info = test.info();
        const index = stepCounters.get(info) ?? 0;
        stepCounters.set(info, index + 1);

        if (ATTACH_SCREENSHOTS) {
            const screenshot = await page.screenshot();

            // ✅ TTA Custom Reporter — matches by "step-N-" prefix
            await info.attach(`step-${index}-${slugify(title)}`, {
                body: screenshot,
                contentType: 'image/png',
            });

            // ✅ Allure v3 — test.step() already registers the step,
            // any attach() inside here appears UNDER that step in Allure
            // (The same attach above works for Allure too — no duplicate needed!)
        }
    });
}