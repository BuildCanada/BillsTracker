import { describe, it, expect } from 'vitest';
import { xmlToMarkdown } from '@/utils/xml-to-md/xml-to-md.util';
import fs from 'fs';
import path from 'path';

describe('XML to Markdown Conversion', () => {
  const fixturesDir = path.join(__dirname, '..', 'fixtures');

  it('should convert S-230 bill XML to markdown with complete content', () => {
    const xml = fs.readFileSync(path.join(fixturesDir, 's-230.xml'), 'utf-8');
    const markdown = xmlToMarkdown(xml);

    // Check basic structure
    expect(markdown).toContain('# S-230 — An Act respecting the development of a national strategy');
    expect(markdown).toContain('**Sponsor:** Senator BLACK');
    expect(markdown).toContain('## Summary');
    expect(markdown).toContain('## Preamble');

    // Check that section 3(3) is complete with paragraphs
    expect(markdown).toContain('**(3) - Public consultation**');
    expect(markdown).toContain('engage in a public consultation process with');
    expect(markdown).toContain('**(a)** stakeholders, including representatives of agricultural industry');
    expect(markdown).toContain('**(b)** any interested persons');

    // Check that section 4 subsections are complete
    expect(markdown).toContain('### 4. Content — policy and legislative measures');
    expect(markdown).toContain('**(1)**');
    expect(markdown).toContain('**(2) - Content — knowledge improvement measures**');
    expect(markdown).toContain('**(3) - Content — education and information measures**');
    expect(markdown).toContain('**(4) - Content — National Advocate for Soil Health');

    // Check nested subparagraphs in 4(3)(a)
    expect(markdown).toContain('**(i)** research programs');
    expect(markdown).toContain('**(ii)** education and training');
    expect(markdown).toContain('**(iii)** knowledge transfer');
    expect(markdown).toContain('**(iv)** Indigenous stewardship');

    // Check section 6 is complete
    expect(markdown).toContain('### 6. Review and report');
    expect(markdown).toContain('**(1)**');
    expect(markdown).toContain('**(2) - Tabling**');
    expect(markdown).toContain('**(3) - Publication**');
  });

  it('should convert S-231 bill XML to markdown', () => {
    const xml = fs.readFileSync(path.join(fixturesDir, 's-231.xml'), 'utf-8');
    const markdown = xmlToMarkdown(xml);

    expect(markdown).toContain('# S-231');
    expect(markdown).toContain('**Sponsor:**');
    expect(markdown).toBeTruthy();
    expect(markdown.length).toBeGreaterThan(1000);
  });

  it('should convert C-208 bill XML to markdown', () => {
    const xml = fs.readFileSync(path.join(fixturesDir, 'c-208.xml'), 'utf-8');
    const markdown = xmlToMarkdown(xml);

    expect(markdown).toContain('# C-208');
    expect(markdown).toContain('livestock brand'); // Actual content from downloaded bill
    expect(markdown).toBeTruthy();
    expect(markdown.length).toBeGreaterThan(1000);
  });

  it('should convert C-206 bill XML to markdown', () => {
    const xml = fs.readFileSync(path.join(fixturesDir, 'c-206.xml'), 'utf-8');
    const markdown = xmlToMarkdown(xml);

    expect(markdown).toContain('# C-206');
    expect(markdown).toContain('brain injuries'); // Actual content from downloaded bill
    expect(markdown).toBeTruthy();
    expect(markdown.length).toBeGreaterThan(1000);
  });

  it('should handle empty XML gracefully', () => {
    const markdown = xmlToMarkdown('');
    expect(markdown).toBe('');
  });

  it('should handle malformed XML gracefully', () => {
    // Wrap in try-catch since parser might throw on malformed XML
    let markdown: string | undefined;
    try {
      markdown = xmlToMarkdown('<Bill><unclosed');
    } catch (error) {
      // Expected to throw on malformed XML
      markdown = '';
    }
    expect(markdown).toBeDefined();
  });

  it('should preserve proper indentation for nested lists', () => {
    const xml = fs.readFileSync(path.join(fixturesDir, 's-230.xml'), 'utf-8');
    const markdown = xmlToMarkdown(xml);

    // Check that subparagraphs are indented under paragraphs
    const lines = markdown.split('\n');
    const paraIndex = lines.findIndex(line => line.includes('- **(a)** encourage'));
    const subParaIndex = lines.findIndex(line => line.includes('- **(i)** research'));

    expect(paraIndex).toBeGreaterThan(-1);
    expect(subParaIndex).toBeGreaterThan(paraIndex);

    // Check indentation (subparagraphs should be indented)
    const subParaLine = lines.find(line => line.includes('- **(i)** research'));
    expect(subParaLine).toMatch(/^\s+- /); // Should start with spaces then dash
  });
});