#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { getBillFromApi } from '@/services/billApi';
import { fetchBillMarkdown } from '@/services/billApi';
import { SUMMARY_AND_VOTE_PROMPT } from '@/prompt/summary-and-vote-prompt';

async function main() {
  const billId = process.argv[2];

  if (!billId) {
    console.error('Usage: npm run copy-prompt <bill-id>');
    process.exit(1);
  }

  try {
    console.log(`Fetching bill ${billId}...`);

    // Fetch bill from API
    const bill = await getBillFromApi(billId);

    if (!bill) {
      console.error(`Bill ${billId} not found`);
      process.exit(1);
    }

    // Fetch bill markdown if source is available
    let billMarkdown: string | null = null;
    if (bill.source) {
      console.log('Fetching bill text...');
      billMarkdown = await fetchBillMarkdown(bill.source);
    }

    // Build the prompt text (same as in billApi.ts line 105)
    const billText = billMarkdown || bill.header || '';
    const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${billText}`;

    // Copy to clipboard using macOS pbcopy
    execSync('pbcopy', { input: prompt });

    console.log(`✓ Copied prompt for bill ${billId} to clipboard`);
    console.log(`  Title: ${bill.title}`);
    console.log(`  Text length: ${billText.length} characters`);
    console.log(`  Total prompt length: ${prompt.length} characters`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();