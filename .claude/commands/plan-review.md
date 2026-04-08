# Plan Review Command

Review an implementation plan for completeness, clarity, and feasibility by thoroughly analyzing both the plan document and the existing codebase it will integrate with.

<plan_context>$ARGUMENTS</plan_context>

## Overview

This command reviews implementation plans by validating specifications AND reading the actual codebase to ensure the plan will integrate properly with existing code.

## Steps

1. **Load the plan document**
   - Read the specified plan file mentioned in the <plan_context>.

2. **Load and Validate the High Level Goals (Source of Truth)**
   - Read the `## High level goals` section of the plan document carefully.
   - **CRITICAL**: This section is the authoritative source of truth for what
     must be accomplished.
   - This section typically contains:
     - Routes/pages/components affected
     - Current State descriptions (what exists today)
     - Required Changes (what needs to be built)
     - Specific features and behaviors to implement

   **ESCAPE HATCH - Stop review if High Level Goals are inadequate:**
   - If any of these issues are found, **STOP THE REVIEW** and report the
     problem:
     - Goals section is missing or empty
     - Goals are vague or ambiguous (e.g., "improve performance" without
       metrics)
     - Internal contradictions within the goals themselves
     - Current State and Required Changes are not clearly distinguished
     - Goals mix implementation details with requirements
     - Goals reference undefined components or systems
   - When stopping early, provide:
     - Specific examples of the problems found
     - Clear guidance on how to improve the goals
     - Offer to help rewrite the High Level Goals section

   - If goals pass validation:
     - All implementation details in the rest of the plan must align with these
       goals.
     - If there's any conflict between the goals and other sections, the goals
       take precedence.

3. **Analyze plan structure and clarity**
   - Verify all sections directly support the High Level Goals
   - Ensure no implementation details contradict the stated goals
   - Check for logical flow and organization
   - Assess code-to-prose ratio (should be ~20% code examples, 80%
     specifications)
   - Evaluate whether architecture decisions are justified by the goals

4. **Verify integration with existing code**
   
   **CRITICAL: Find and read all code files the plan references or will modify**
   
   - Extract all code references from the plan (functions, components, schemas, etc.)
   - Use Grep/Glob to locate each referenced file
   - Read the actual implementation to understand current structure
   - Verify that assumed functions/components exist with compatible signatures
   - Check that the plan follows existing patterns and conventions
   - Identify any missing dependencies or utilities the plan requires
   - Note any conflicts between plan assumptions and actual code

5. **Evaluate completeness**
   - Required sections present: goals, architecture, implementation steps,
     testing
   - State management strategy defined
   - Error handling and edge cases addressed
   - Performance considerations included
   - Security implications considered
   - Rollout/deployment strategy specified

6. **Identify gaps and risks**
   - Missing specifications or ambiguous requirements
   - Technical blockers (missing dependencies, incompatible APIs)
   - Undefined data flows or state transitions
   - Absent testing or validation strategies
   - Unaddressed scaling or performance limits

7. **Generate comprehensive review** Create a review document with:
   - **Rating**: Score out of 100
   - **Executive Summary**: 2-3 sentence overview
   - **High Level Goals Alignment**: Confirm all goals from section 2 are
     addressed
   - **Code Integration Verification**: Summary of what was found vs. what the plan assumes
   - **Strengths**: What the plan does well
   - **Critical Gaps**: Blockers that prevent implementation
   - **Missing Details**: Important but non-blocking omissions
   - **Integration Issues**: Conflicts with existing code (be specific with file:line references)
   - **Risk Assessment**: Potential failure points
   - **Recommendations**: Specific improvements needed
   - **Implementation Readiness**: Clear yes/no with justification

8. **Score breakdown** Rate each aspect 0-100:
   - High Level Goals alignment
   - Architecture clarity
   - Code integration (files exist, patterns match)
   - Technical accuracy
   - Risk mitigation
   - Testing strategy
   - Implementation readiness

9. **Respond to the user**
   - Present the review directly in the conversation
   - Format for readability with clear sections and scores
   - Highlight critical blockers that must be addressed
   - Offer to:
     - Save an improved version of the plan if score < 85
     - Discuss specific sections that need work
     - Help refactor problematic areas
     - Create implementation checklist if score ≥ 85
   - End with clear next steps or questions for the user

Be constructive but thorough - a plan that scores below 85/100 needs significant
revision before implementation.
