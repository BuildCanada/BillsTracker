# Code Review Command

Please perform a code review given the following context about which branch to
compare to which other branch. There may be other context relevant to the
review.

**IMPORTANT** Respond with a concise review that is useful to copy/past into a GitHub Pull Request comment.

<branch_review_context>$ARGUMENTS</branch_review_context>

**IMPORTANT** Follow the coding standards and best practices outlined in the
`.CLAUDE.md` file for this review.

## Steps

1. **List all changed files**

Unless other specified in <branch_review_context>, get file changes by comparing
two branches. The <branch_review_context> may specifiy to get changes on the
current branch since a specific commit, in which case, modify the following
commands to do that. You know how. Regardless, you will end up with the
following two diff files to use.

- Run
  `git diff --name-only BASE_BRANCH...WORKING_BRANCH > tmp_diff_name_only.txt`
  to get the exact list of files that changed.

2. **Get the complete diff**

- Run `git diff BASE_BRANCH...WORKING_BRANCH > tmp_full_diff.txt` to see all
  actual changes.

3. **Analyze each file thoroughly**

- For every file in the diff:
  - Read the full file content if it's a new/modified file to understand context
  - Examine the specific changes line by line from the diff
  - Check against project coding standards from CLAUDE.md
    - All coding standards are important, but pay special attention to the
      Frontend Rules and React coding styles and best practices.
  - Identify potential issues:
    - Security vulnerabilities or exposed sensitive data
    - Performance bottlenecks or inefficiencies
    - Logic bugs or edge cases not handled
    - Code maintainability and readability concerns
    - Missing error handling or validation
    - Breaking changes that affect other parts of the codebase
  - For each issue found, note the specific file path and line number references
- Assess the broader impact: how changes in each file affect related components,
  APIs, database schemas, or user workflows

4. **Create comprehensive review**

- Write a complete and accurate code review document that covers:
  - **Executive Summary**: Brief overview of changes, risk level, and key
    concerns
  - **Files Changed**: List all modified files with change summary
  - **Critical Issues**: Security, breaking changes, or major bugs requiring
    immediate attention
  - **Detailed Analysis**: For each file with issues:
    - `### path/to/file.ext`
    - **Changes**: What was modified
    - **Issues Found**: Specific problems with file:line references
    - **Recommendations**: Actionable fixes with code examples where helpful
    - **Impact**: How changes affect other parts of the system
  - **Overall Assessment**: System-wide impact, testing recommendations,
    deployment considerations
  - **Action Items**: Prioritized checklist of required fixes and improvements

5. **Save your review**

- Save your full review to a new markdown file in the `.plans/` directory using
  the format: `code-review-[BRANCH_NAME]-[TIMESTAMP_WITH_TIME].md`
- Include a brief summary at the top with the review date, branches compared,
  and total files analyzed

6. **Delete the temporary files**

- Delete the temporary files created in steps 1 and 2:
  - `tmp_diff_name_only.txt`
  - `tmp_full_diff.txt`

Be constructive and helpful in your feedback.
