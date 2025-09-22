#!/usr/bin/env tsx

/*
Usage: npm run prompt -- [bill-id] [options]

Example to copy to clipboard:: npm run prompt -- C-1
Example to output to stdout: npm run prompt -- C-1 --output
*/

import { execSync } from 'node:child_process';
import { getBillFromCivicsProjectApi, fetchBillMarkdown } from '@/services/billApi';
import { SUMMARY_AND_VOTE_PROMPT } from '@/prompt/summary-and-vote-prompt';

async function main() {
  const args = process.argv.slice(2);
  const outputFlag = args.includes('--output') || args.includes('-o');
  const billId = args.find(arg => !arg.startsWith('-'));

  if (!billId) {
    console.error('Usage: npm run copy-prompt <bill-id> [--output|-o]');
    console.error('  --output, -o  Output prompt to stdout instead of copying to clipboard');
    process.exit(1);
  }

  try {
    if (!outputFlag) {
      console.log(`Fetching bill ${billId}...`);
    }

    // Fetch bill from API
    const bill = await getBillFromCivicsProjectApi(billId);

    if (!bill) {
      console.error(`Bill ${billId} not found`);
      process.exit(1);
    }

    // Fetch bill markdown if source is available
    let billMarkdown: string | null = null;
    if (bill.source) {
      if (!outputFlag) {
        console.log('Fetching bill text...');
      }
      billMarkdown = await fetchBillMarkdown(bill.source);
    }

    // Build the prompt text (same as in billApi.ts line 105)
    const billText = billMarkdown || bill.header || '';
    const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${billText}`;

    if (outputFlag) {
      // Output to stdout
      console.log(prompt);
    } else {
      // Copy to clipboard using macOS pbcopy
      execSync('pbcopy', { input: prompt });

      console.log(`✓ Copied prompt for bill ${billId} to clipboard`);
      console.log(`  Title: ${bill.title}`);
      console.log(`  Text length: ${billText.length} characters`);
      console.log(`  Total prompt length: ${prompt.length} characters`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();