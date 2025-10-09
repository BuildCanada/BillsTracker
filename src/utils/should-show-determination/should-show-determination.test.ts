import { describe, expect, it } from "vitest";
import { shouldShowDetermination } from "./should-show-determination.util";

describe("shouldShowDetermination", () => {
  it("returns true when vote is yes", () => {
    const result = shouldShowDetermination("yes");
    expect(result).toBe(true);
  });

  it("returns true when vote is no", () => {
    const result = shouldShowDetermination("no");
    expect(result).toBe(true);
  });

  it("returns false when vote is abstain", () => {
    const result = shouldShowDetermination("abstain");
    expect(result).toBe(false);
  });

  it("returns false when vote is abstain with different casing", () => {
    const result = shouldShowDetermination("AbStAiN");
    expect(result).toBe(false);
  });

  it("returns false when vote is abstain with whitespace", () => {
    const result = shouldShowDetermination("  abstain  ");
    expect(result).toBe(false);
  });

  it("returns true when vote is uppercase YES", () => {
    const result = shouldShowDetermination("YES");
    expect(result).toBe(true);
  });

  it("returns true when vote is uppercase NO", () => {
    const result = shouldShowDetermination("NO");
    expect(result).toBe(true);
  });

  it("returns true when vote is null", () => {
    const result = shouldShowDetermination(null);
    expect(result).toBe(true);
  });

  it("returns true when vote is undefined", () => {
    const result = shouldShowDetermination(undefined);
    expect(result).toBe(true);
  });

  it("returns true when vote is empty string", () => {
    const result = shouldShowDetermination("");
    expect(result).toBe(true);
  });

  it("returns true when vote is whitespace only", () => {
    const result = shouldShowDetermination("   ");
    expect(result).toBe(true);
  });

  it("returns true when vote is non-standard value", () => {
    const result = shouldShowDetermination("maybe");
    expect(result).toBe(true);
  });
});
