import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBillFromApi, fetchBillMarkdown } from '@/services/billApi';
import { SUMMARY_AND_VOTE_PROMPT } from '@/prompt/summary-and-vote-prompt';
import { mockBillResponses } from '../fixtures/api-responses';
import fs from 'fs';
import path from 'path';

// Mock the fetch function
global.fetch = vi.fn();

describe('Prompt Generation', () => {
  const fixturesDir = path.join(__dirname, '..', 'fixtures');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bill fetching and prompt construction', () => {
    it('should fetch bill S-230 and generate complete prompt', async () => {
      // Mock API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { bill: mockBillResponses['S-230'] } })
      });

      const bill = await getBillFromApi('S-230');
      expect(bill).toBeDefined();
      expect(bill?.billID).toBe('S-230');
      expect(bill?.source).toBe('https://www.parl.ca/Content/Bills/451/Private/S-230/S-230_1/S-230_E.xml');
    });

    it('should fetch bill markdown from source URL', async () => {
      const xml = fs.readFileSync(path.join(fixturesDir, 's-230.xml'), 'utf-8');

      // Mock XML fetch
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => xml
      });

      const markdown = await fetchBillMarkdown('https://www.parl.ca/Content/Bills/451/Private/S-230/S-230_1/S-230_E.xml');

      expect(markdown).toBeDefined();
      expect(markdown).toContain('S-230');
      expect(markdown).toContain('public consultation');
      expect(markdown).toContain('National Advocate for Soil Health');
    });

    it('should generate complete prompt with all bill content', async () => {
      const xml = fs.readFileSync(path.join(fixturesDir, 's-230.xml'), 'utf-8');

      // Mock API response
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { bill: mockBillResponses['S-230'] } })
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => xml
        });

      const bill = await getBillFromApi('S-230');
      const markdown = await fetchBillMarkdown(bill!.source!);
      const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${markdown}`;

      // Check prompt structure
      expect(prompt).toContain('You are analyzing Canadian legislation');
      expect(prompt).toContain('Build Canada'); // The actual prompt has different apostrophe formatting
      expect(prompt).toContain('Core Tenets');
      expect(prompt).toContain('Output format (return valid JSON only)');

      // Check bill content is included
      expect(prompt).toContain('# S-230');
      expect(prompt).toContain('public consultation process with');
      expect(prompt).toContain('**(a)** stakeholders');
      expect(prompt).toContain('**(b)** any interested persons');

      // Check all major sections are present
      expect(prompt).toContain('### 3. Development of national strategy');
      expect(prompt).toContain('### 4. Content — policy and legislative measures');
      expect(prompt).toContain('### 5. Tabling of national strategy');
      expect(prompt).toContain('### 6. Review and report');

      // Verify prompt is not truncated
      const promptLines = prompt.split('\n');
      const billTextStartIndex = promptLines.findIndex(line => line === 'Bill Text:');
      const billContent = promptLines.slice(billTextStartIndex + 1).join('\n');

      // Should have substantial content after "Bill Text:"
      expect(billContent.length).toBeGreaterThan(5000);

      // Last sections should be present
      expect(billContent).toContain('**(3) - Publication**');
      expect(billContent).toContain('10 days after the day on which it is tabled in Parliament');
    });

    it('should generate prompts for all test bills', async () => {
      const testBills = ['s-230', 's-231', 'c-208', 'c-206'];

      for (const billId of testBills) {
        const xmlPath = path.join(fixturesDir, `${billId}.xml`);

        // Skip if file doesn't exist (C-216 failed to download)
        if (!fs.existsSync(xmlPath)) continue;

        const xml = fs.readFileSync(xmlPath, 'utf-8');
        const billIdUpper = billId.toUpperCase();

        // Mock API response
        (global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { bill: mockBillResponses[billIdUpper] } })
          })
          .mockResolvedValueOnce({
            ok: true,
            text: async () => xml
          });

        const bill = await getBillFromApi(billIdUpper);
        const markdown = await fetchBillMarkdown(bill!.source!);
        const prompt = `${SUMMARY_AND_VOTE_PROMPT}\n\nBill Text:\n${markdown}`;

        // Basic validations
        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(1000);
        expect(prompt).toContain(billIdUpper);
        expect(prompt).toContain('Build Canada');
        expect(prompt).toContain('Core Tenets');
      }
    });
  });

  describe('Prompt content validation', () => {
    it('should include all 8 Build Canada tenets in prompt', () => {
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Canada should aim to be the world\'s richest country');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Promote economic freedom');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Drive national productivity');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Grow exports');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Encourage investment');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Deliver better public services');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Reform taxes');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Focus on large-scale prosperity');
    });

    it('should include JSON output format specification', () => {
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('Output format (return valid JSON only)');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"summary":');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"tenet_evaluations":');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"final_judgment":');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"steel_man":');
    });

    it('should have proper tenet evaluation structure in prompt', () => {
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"alignment": "aligns|conflicts|neutral"');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"explanation":');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"id": 1');
      expect(SUMMARY_AND_VOTE_PROMPT).toContain('"id": 8');
    });
  });

  describe('Edge cases', () => {
    // Mock console.error for these tests to suppress expected error logs
    let consoleErrorSpy: any;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing source URL', async () => {
      const billWithoutSource = { ...mockBillResponses['S-230'], source: undefined };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { bill: billWithoutSource } })
      });

      const bill = await getBillFromApi('S-230');
      expect(bill).toBeDefined();
      expect(bill?.source).toBeUndefined();

      const markdown = await fetchBillMarkdown('');
      expect(markdown).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getBillFromApi('INVALID-BILL')).rejects.toThrow();
    });

    it('should handle XML fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const markdown = await fetchBillMarkdown('https://example.com/bill.xml');
      expect(markdown).toBeNull();
    });
  });
});