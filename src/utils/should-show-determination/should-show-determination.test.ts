import { describe, expect, it } from "vitest";
import { shouldShowDetermination } from "./should-show-determination.util";

const ALIGN = { alignment: "aligns" as const };
const CONFLICT = { alignment: "conflicts" as const };
const NEUTRAL = { alignment: "neutral" as const };
const UNSET = { alignment: undefined };
const NULL_ALIGNMENT = { alignment: null };

describe("shouldShowDetermination", () => {
  it("returns true when vote is yes and not a social issue", () => {
    const result = shouldShowDetermination({
      vote: "yes",
      isSocialIssue: false,
      tenetEvaluations: [ALIGN, ALIGN],
    });

    expect(result).toBe(true);
  });

  it("returns true when vote is no", () => {
    const result = shouldShowDetermination({
      vote: "no",
      isSocialIssue: false,
      tenetEvaluations: [CONFLICT, CONFLICT],
    });

    expect(result).toBe(true);
  });

  it("returns false when vote is neutral", () => {
    const result = shouldShowDetermination({
      vote: "neutral",
      isSocialIssue: false,
      tenetEvaluations: [NEUTRAL, NEUTRAL],
    });

    expect(result).toBe(false);
  });

  it("returns false when social issue", () => {
    const result = shouldShowDetermination({
      vote: "yes",
      isSocialIssue: true,
      tenetEvaluations: [ALIGN, ALIGN],
    });

    expect(result).toBe(false);
  });

  it("returns true when social issue is false", () => {
    const result = shouldShowDetermination({
      vote: "yes",
      isSocialIssue: false,
      tenetEvaluations: [ALIGN, ALIGN],
    });

    expect(result).toBe(true);
  });

  it("returns false when vote forced to neutral by single alignment", () => {
    const result = shouldShowDetermination({
      vote: "yes",
      isSocialIssue: false,
      tenetEvaluations: [ALIGN, NEUTRAL, NEUTRAL],
    });

    expect(result).toBe(false);
  });

  it("returns false when vote forced to neutral by single conflict", () => {
    const result = shouldShowDetermination({
      vote: "no",
      isSocialIssue: false,
      tenetEvaluations: [CONFLICT, NEUTRAL, NEUTRAL],
    });

    expect(result).toBe(false);
  });

  it("returns true when multiple non-neutral alignments", () => {
    const result = shouldShowDetermination({
      vote: "yes",
      isSocialIssue: false,
      tenetEvaluations: [ALIGN, ALIGN, NEUTRAL],
    });

    expect(result).toBe(true);
  });

  it("returns true when vote is uppercase", () => {
    const result = shouldShowDetermination({
      vote: "YES",
      isSocialIssue: false,
      tenetEvaluations: [ALIGN, CONFLICT, NEUTRAL],
    });

    expect(result).toBe(true);
  });

  it("returns false when vote is neutral regardless of casing", () => {
    const result = shouldShowDetermination({
      vote: "NeUtRaL",
      isSocialIssue: false,
      tenetEvaluations: [NEUTRAL, NEUTRAL],
    });

    expect(result).toBe(false);
  });

  it("returns true when vote is non-standard but not forced neutral", () => {
    const result = shouldShowDetermination({
      vote: "abstain",
      isSocialIssue: false,
      tenetEvaluations: [ALIGN, CONFLICT, NEUTRAL],
    });

    expect(result).toBe(true);
  });

  it("returns true when tenet evaluations are empty", () => {
    const result = shouldShowDetermination({
      vote: "yes",
      isSocialIssue: false,
      tenetEvaluations: [],
    });

    expect(result).toBe(true);
  });

});