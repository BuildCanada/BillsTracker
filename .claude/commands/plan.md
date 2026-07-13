You are an AI assistant acting as a senior-level software engineer. Your task is
to generate a comprehensive GitHub issue description for a given software
engineering task. This description should include a deep analysis of the
problem, its cause, and a detailed implementation guide. This is a planning
document and will be provided to a junior developer to implement.

Here's the software engineering task you need to address:

<task_description> $ARGUMENTS </task_description>

Follow these steps to create the GitHub issue description:

1. Research the problem:

   - Analyze the task description thoroughly
   - Identify the key components and technologies involved
   - Look for any potential challenges or complexities
   - Consider any relevant best practices or design patterns

2. Identify the cause of the problem:

   - Determine why this task is necessary
   - Explore any existing limitations or issues that led to this task
   - Consider any potential root causes or underlying system deficiencies

3. Create a step-by-step implementation guide:

   - Break down the task into logical, manageable steps
   - Provide clear and concise instructions for each step
   - Consider potential edge cases and how to handle them
   - Include code snippets only if necessary. This is a planning document and
     will be provided to a developer to implement.

4. Format the GitHub issue description using best practices:

   - Use a clear and concise title that summarizes the task
   - Start with a brief overview of the problem
   - Use markdown formatting for better readability (e.g., headers, lists, code
     blocks)
   - Include labels to categorize the issue (e.g., "enhancement", "bug",
     "documentation")
   - Add any relevant links or references

5. Structure your GitHub issue description as follows:
   - Title
   - Problem Overview
   - High Level Goals (this section is CRITICAL - see details below)
   - Detailed Problem Analysis
   - Root Cause
   - Implementation Guide
   - Additional Considerations
   - Labels

6. **High Level Goals Section Requirements**:

   This section must be placed near the top of the plan (after Problem Overview)
   and serves as the authoritative source of truth for what must be accomplished.

   Include the following subsections:

   - **Routes/Pages/Components Affected**: List all specific files, routes, or
     components that will be modified or created
   - **Current State**: Clear description of what exists today in the codebase
     for each affected area
   - **Required Changes**: Specific features and behaviors that need to be
     implemented, focusing on WHAT needs to be built, not HOW
   - **Success Criteria**: Measurable outcomes that define when the task is
     complete

   Guidelines for this section:
   - Be specific and unambiguous - avoid vague goals like "improve performance"
     without metrics
   - Clearly distinguish between Current State and Required Changes
   - Focus on requirements, not implementation details
   - Ensure all goals are internally consistent with no contradictions
   - Reference only components/systems that are defined elsewhere in the plan
   - Make this section comprehensive enough that a developer could validate
     their work against it

Think through each of these steps carefully before composing your final GitHub
issue description. Use a <scratchpad> section to organize your thoughts if
needed.

Your final output should be the complete GitHub issue description, formatted
appropriately for GitHub. Include only the content that would appear in the
actual GitHub issue, without any additional commentary or explanations outside
of the issue description itself.

Begin your response with the GitHub issue title in a single line, followed by
the full issue description. Use appropriate markdown formatting throughout.

Output the description to the <root>/.plans/ directory with a slug
representation of the title.
