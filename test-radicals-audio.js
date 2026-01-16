/**
 * Test script to check audio playback on radicals page
 */

import { chromium } from 'playwright';

async function testRadicalsAudio() {
    console.log('Testing radicals page audio...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 393, height: 852 }
    });
    const page = await context.newPage();

    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push({ type: msg.type(), text });
        console.log(`[${msg.type()}] ${text}`);
    });

    // Navigate to radicals page
    const url = 'http://localhost:3001/radicals.html';
    console.log(`Navigating to: ${url}\n`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find first radical card and audio button
    const firstCard = await page.locator('.radical-card').first();
    const firstAudioBtn = await page.locator('.radical-audio').first();

    if (!await firstCard.isVisible()) {
        console.error('❌ No radical cards found!');
        await browser.close();
        return;
    }

    console.log('✓ Radical cards loaded\n');

    // Get the audio path from the button
    const audioPath = await firstAudioBtn.getAttribute('data-audio');
    console.log(`Audio path: ${audioPath}\n`);

    // Click the audio button
    console.log('Clicking audio button...\n');
    await firstAudioBtn.click();
    await page.waitForTimeout(2000);

    // Check for audio-related errors in console
    const audioErrors = consoleLogs.filter(log =>
        log.type === 'error' ||
        (log.text.toLowerCase().includes('audio') && log.type === 'warning')
    );

    console.log('\n=== AUDIO TEST RESULTS ===');
    if (audioErrors.length > 0) {
        console.log('❌ Audio errors detected:');
        audioErrors.forEach(err => console.log(`  - [${err.type}] ${err.text}`));
    } else {
        console.log('✓ No audio errors detected');
    }

    // Check if audio element was created and attempted to play
    const audioAttempted = consoleLogs.some(log =>
        log.text.includes('Attempting to play audio') ||
        log.text.includes('Audio loaded successfully')
    );

    if (audioAttempted) {
        console.log('✓ Audio playback was attempted');
    } else {
        console.log('⚠ No evidence of audio playback attempt');
    }

    // Check for MIME type issues
    const mimeIssues = consoleLogs.filter(log =>
        log.text.includes('MIME') ||
        log.text.includes('format') ||
        log.text.includes('AIFF') ||
        log.text.includes('WAV')
    );

    if (mimeIssues.length > 0) {
        console.log('\n⚠ Audio format messages:');
        mimeIssues.forEach(msg => console.log(`  - ${msg.text}`));
    }

    await browser.close();
}

testRadicalsAudio().catch(console.error);
