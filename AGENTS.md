# Agent Memory

## Overview

This application is an AI-powered Member of Parliament that analyzes and votes on bills before the current Canadian Parliament. It evaluates legislation against Build Canada's core tenets focused on economic prosperity, innovation, and government efficiency, providing reasoned judgments on whether to support, oppose, or abstain from each bill.

## Frameworks & Technologies

### Frontend
- **Next.js 15** (App Router with Turbopack)
- **React 19** with Server Components
- **Tailwind CSS 4** for styling
- **Shadcn UI** for components (`src/components/ui`)
- **React Markdown** with remark-gfm for rendering formatted content

### Backend
- **Next.js API Routes** for server-side logic
- **MongoDB** with **Mongoose** ODM for bill storage and caching
- **NextAuth.js** for Google OAuth authentication
- **OpenAI GPT-5** for bill analysis and reasoning
- **Civics Project API** as the source of Canadian parliamentary bills

## How Bill Analysis Works

### High-Level Flow

1. Bill Retrieval
2. Text Conversion
3. AI Analysis
4. Social Issue Classification
5. Database Caching
6. UI Display

### Detailed Technical Flow

#### 1. Bill Retrieval (`src/app/[id]/page.tsx`)

When a user requests a bill (e.g., C-18, S-5):

- **Primary source**: Check MongoDB database for cached analysis (`src/server/get-bill-by-id-from-db.ts`)
- **Fallback source**: If not in database, fetch from Civics Project API (`getBillFromCivicsProjectApi()` in `src/services/billApi.ts`)
  - Endpoint: `https://api.civicsproject.org/bills/canada/{billId}/45`
  - Returns bill metadata, stages, sponsors, and source URL for full text
- The retrieval logic is orchestrated in the bill detail page component, not through a unified service layer

#### 2. XML to Markdown Conversion (`src/utils/xml-to-md/xml-to-md.util.ts`)

Bill text is downloaded as XML from the official Canadian Parliament source:

- Uses `fast-xml-parser` to parse structured bill XML
- Converts XML structure to clean Markdown:
  - `<Bill>` Document header with bill number and long title
  - `<Section>` H3 headings with labels
  - `<Paragraph>` Bullet points
  - `<Emphasis>` Markdown italics/bold
  - Preserves legal structure (sections, subsections, provisions)

#### 3. AI Analysis with Structured Reasoning (`summarizeBillText()` in `src/services/billApi.ts`)

The Markdown bill text is sent to OpenAI's GPT-5 model with high reasoning effort using the Responses API:

**Input**: Structured prompt (`src/prompt/summary-and-vote-prompt.ts`) combined with bill text

**Model configuration**:
- Model: `gpt-5`
- API method: `OpenAI.responses.create()`
- Reasoning effort: `high`

**Output**: Structured JSON containing:
- `summary`: 3-5 sentence plain-language explanation
- `short_title`: Concise bill name (1-2 words)
- `tenet_evaluations`: Array of 8 evaluations (aligns/conflicts/neutral) with explanations
- `final_judgment`: "yes" (support), "no" (oppose), or "abstain"
- `rationale`: 2 sentence explanation + bullet points for the judgment
- `steel_man`: Best possible interpretation of the bill
- `question_period_questions`: 3 critical questions for parliamentary debate
- `needs_more_info`: Flag for insufficient information
- `missing_details`: Array of information gaps

**Fallback behavior**: If OpenAI API key is missing or analysis fails, returns neutral stance with all tenet evaluations marked as neutral and appropriate error messages

#### 4. Social Issue Classification (`src/services/social-issue-grader.ts`)

A separate AI classifier determines if the bill is primarily a social issue:

**Social issues include**:
- Recognition/commemoration (heritage days, national symbols)
- Rights & identity (assisted dying, gender identity, indigenous rights)
- Culture & language (multiculturalism, official languages)
- Civil liberties & expression (protests, speech regulations)

**Not social issues**:
- Core economics (budgets, taxation, trade)
- Infrastructure operations (transportation, energy, housing)
- Technical/administrative procedures

**Classification timing**: Only runs for new bills or existing bills missing the `isSocialIssue` field to avoid redundant AI calls

**Classification result**:
- Returns boolean value stored as `isSocialIssue` field
- Used by the UI to determine whether to display the analysis and judgment
- Build Canada focuses on economic policy and abstains from social/cultural legislation

#### 5. Bill Caching (`src/utils/billConverters.ts`)

To avoid redundant AI calls and reduce costs, the system implements smart caching:

**When fetching from API** (`fromCivicsProjectApiBill()`):
1. **Check existing analysis**: Query MongoDB for bill by ID
2. **Source comparison**: Compare `bill.source` URL from API with cached version
3. **Conditional re-analysis**:
   - If source URL unchanged - Use cached analysis (skip AI call)
   - If source URL changed - Fetch new XML, regenerate full analysis
   - Social issue classification only runs if missing from database

**When updating database** (`onBillNotInDatabase()`):
1. Checks if bill already exists in database
2. Updates if any of these conditions are true:
   - Source URL changed
   - Bill texts count changed
   - Question Period questions missing or different
   - Short title missing
3. Creates new database entry if bill doesn't exist

#### 6. Database Storage

Analyzed bills are stored in MongoDB using the `Bill` schema (`src/models/Bill.ts`).

Users are stored in MongoDB using the `User` schema (`src/models/User.ts`).

#### 7. Authentication and Bill Editing (`src/lib/auth.ts`)

The application uses NextAuth.js with Google OAuth for authentication to protect bill editing functionality:

**Authentication Flow**:
1. **Provider**: Google OAuth configured with email and profile scopes
2. **Session strategy**: JWT-based sessions (no database sessions)
3. **User allowlist**: Database-backed allowlist using the `User` model (`src/models/User.ts`)
   - Users must exist in the database with `allowed: true` field
   - Sign-in callback checks user existence and `allowed` status
   - No auto-creation of users on sign-in
4. **Session updates**: Updates `lastLoginAt` timestamp on each successful sign-in

**Where authentication is used**:
- **Bill editing page** (`src/app/[id]/edit/page.tsx`): Uses `requireAuthenticatedUser()` guard
- **Bill update API** (`src/app/api/[id]/route.ts`): Checks session and user database record
- **Auth guard** (`src/lib/auth-guards.ts`): Reusable server-side authentication helper that redirects to `/unauthorized` if not authenticated

**Protected functionality**:
- Editing bill metadata (title, short_title, summary)
- Modifying AI analysis results (final_judgment, rationale, steel_man)
- Updating tenet evaluations
- Managing Question Period questions
- Editing genres and missing details

Only users with valid Google accounts that exist in the database with `allowed: true` can edit bills.

### Optimization Features

1. **Page-level caching**: Bill detail pages revalidate every 120 seconds in production
   - API requests cache: 1 hour for bill metadata (`BILL_API_REVALIDATE_INTERVAL`)
   - XML bill text cache: 1 hour for bill full text
   - Development: No caching for immediate feedback

2. **Fallback handling**: If AI fails, returns neutral stance with all tenet evaluations marked neutral and appropriate error messages

3. **Smart classification**: Social issue classification only runs once per bill, skipped if already classified in database

4. **Smart updates**: Database updates only occur when:
   - Source URL changes (triggers re-analysis)
   - Bill texts count changes
   - Question Period questions are missing or updated
   - Short title is missing

## Key Files Reference

### API & Data Fetching
- **`src/services/billApi.ts`** - Core API integration and AI analysis
- **`src/utils/billConverters.ts`** - Data transformation and caching logic
- **`src/utils/xml-to-md/xml-to-md.util.ts`** - XML parsing and Markdown conversion

### AI & Analysis
- **`src/prompt/summary-and-vote-prompt.ts`** - AI prompt with Build Canada tenets
- **`src/services/social-issue-grader.ts`** - Social issue classification

### Database
- **`src/models/Bill.ts`** - MongoDB schema definition for bills
- **`src/models/User.ts`** - MongoDB schema definition for users (authentication allowlist)
- **`src/server/get-unified-bill-by-id.ts`** - Helper to convert DB bill to unified format
- **`src/server/get-bill-by-id-from-db.ts`** - Database query for retrieving bills
- **`src/server/get-all-bills-from-db.ts`** - Database query for retrieving all bills

### Authentication
- **`src/lib/auth.ts`** - NextAuth.js configuration with Google OAuth
- **`src/lib/auth-guards.ts`** - Reusable server-side authentication guards
- **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth.js API route handler
- **`src/app/api/[id]/route.ts`** - Bill update API endpoint (protected)

### UI Components
- **`src/app/page.tsx`** - Home page with bill list
- **`src/app/BillExplorer.tsx`** - Client component for filtering and searching bills
- **`src/app/[id]/page.tsx`** - Bill detail page (Server Component)
- **`src/components/BillDetail/BillAnalysis.tsx`** - Renders tenet evaluations and judgment
- **`src/components/BillDetail/BillHeader.tsx`** - Displays bill title and status
- **`src/components/BillDetail/BillTenets.tsx`** - Displays Build Canada tenets section

### Supporting Files
- **`src/lib/mongoose.ts`** - MongoDB connection management
- **`src/utils/should-show-determination/should-show-determination.util.ts`** - Logic for determining when to display analysis

## Environment Variables

See `.env.example` for the required environment variables.

## Available Commands For Development

- `pnpm run check` - Run type checking, formatting, and linting.
- `pnpm run test` - Run tests.
- `pnpm run type-check` - Run type checking.
- `pnpm run lint` - Run linting.

**IMPORTANT**: Do not run `pnpm run build` or `npm run build`

## Coding Rules

### Frontend Rules

Follow these rules when working on the frontend.

It uses Next.js, React, Tailwind, and Shadcn.

#### General Rules

- Use `lucide-react` for icons
- Use Tailwind CSS classes for all colors, spacing, and typography
- For color, use Tailwind CSS classes.

#### Components

- Use divs instead of other html tags unless otherwise specified
- Separate the main parts of a component's html with an extra blank line for
  visual spacing
- Only use `"use client"` directive when component needs client-side interactivity (state, events, hooks)
- Server components (default) don't need any directive

##### Organization

- All components be named using capital case like `ExampleComponent.tsx` unless
  otherwise specified
- Components in `src/components` use descriptive names (e.g., `BillCard.tsx`, `BillAnalysis.tsx`)
- Utility components use kebab-case with `.component.tsx` suffix (e.g., `filter-section.component.tsx`, `nav.component.tsx`)

##### Data Fetching

- Fetch data in server components and pass the data down as props to client
  components
- Import helper functions from `src/server/` for database queries (e.g., `getBillByIdFromDB`, `getAllBillsFromDB`)
- For authentication, use `getServerSession` from `next-auth` in server components

##### Server Pages & Components

- **Do NOT use `"use server"` directive** - it's not needed for server components/pages in Next.js App Router
- Server components/pages are the default; they don't need any directive
- Async pages and components directly await data without Suspense in most cases
- Route params must be awaited: `const { id } = await params` where type is `params: Promise<{ id: string }>`
- Server components cannot be imported into client components - pass them as props via the `children` pattern

Example of a server layout (no directive needed):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};

export default async function ExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
```

Example of a server page with data fetching (no directive, no Suspense):

```tsx
import { getBillByIdFromDB } from "@/server/get-bill-by-id-from-db";
import { BillHeader } from "@/components/BillDetail/BillHeader";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function BillDetailPage({ params }: Params) {
  const { id } = await params;

  // Fetch data directly in the component
  const bill = await getBillByIdFromDB(id);

  if (!bill) {
    return <div>Bill not found</div>;
  }

  return (
    <div>
      <BillHeader bill={bill} />
      {/* ... rest of UI */}
    </div>
  );
}
```

Example of a reusable server component (no directive):

```tsx
import type { UnifiedBill } from "@/utils/billConverters";

interface BillHeaderProps {
  bill: UnifiedBill;
}

export function BillHeader({ bill }: BillHeaderProps) {
  return (
    <header>
      <h1>{bill.short_title}</h1>
      <p>{bill.title}</p>
    </header>
  );
}
```

##### Client Components

- Use `"use client"` directive at the top of the file
- Client components handle interactivity (state, events, hooks)
- Receive data as props from server components
- Use React hooks: `useState`, `useEffect`, `useMemo`, `useCallback`
- For authentication state, use `useSession()` from `next-auth/react`

Example of a client component with state:

```tsx
"use client";

import { useState } from "react";
import { BillSummary } from "@/app/types";
import BillCard from "@/components/BillCard";

interface BillExplorerProps {
  bills: BillSummary[];
}

export default function BillExplorer({ bills }: BillExplorerProps) {
  const [search, setSearch] = useState("");

  const filteredBills = bills.filter((bill) =>
    bill.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search bills..."
      />

      <ul>
        {filteredBills.map((bill) => (
          <BillCard key={bill.billID} bill={bill} />
        ))}
      </ul>
    </div>
  );
}
```

Example of a simple client component (no state):

```tsx
"use client";

import Link from "next/link";
import { memo } from "react";
import { BillSummary } from "@/app/types";

interface BillCardProps {
  bill: BillSummary;
}

function BillCard({ bill }: BillCardProps) {
  return (
    <li>
      <Link href={`/${bill.billID}`}>
        <h2>{bill.shortTitle ?? bill.title}</h2>
        <p>{bill.description}</p>
      </Link>
    </li>
  );
}

export default memo(BillCard);
```

#### When and How to Use `useEffect` in React

##### When NOT to Use `useEffect`

• **Transforming Data for Rendering:** Calculate derived data (e.g., filtered
lists, computed values) directly during rendering, not in Effects or extra
state.

```tsx
// 🔴 Bad: Unnecessary Effect for calculation
function Form() {
  const [firstName, setFirstName] = useState("Taylor")
  const [lastName, setLastName] = useState("Swift")
  const [fullName, setFullName] = useState("")

  useEffect(() => {
    setFullName(firstName + " " + lastName)
  }, [firstName, lastName])
  // ...
}

// ✅ Good: Calculate during rendering
function Form() {
  const [firstName, setFirstName] = useState("Taylor")
  const [lastName, setLastName] = useState("Swift")
  const fullName = firstName + " " + lastName
  // ...
}
```

• **Handling User Events:** Place logic for user actions (e.g., POST requests,
notifications) in event handlers, not Effects.

```tsx
// 🔴 Bad: Event-specific logic inside an Effect
function ProductPage({ product, addToCart }) {
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the cart!`)
    }
  }, [product])

  function handleBuyClick() {
    addToCart(product)
  }
  // ...
}

// ✅ Good: Event-specific logic in event handler
function ProductPage({ product, addToCart }) {
  function handleBuyClick() {
    addToCart(product)
    showNotification(`Added ${product.name} to the cart!`)
  }
  // ...
}
```

• **Updating State Based on Props/State:** If a value can be derived from props
or state, compute it during render. Use `useMemo` only for expensive
calculations.

```tsx
// 🔴 Bad: Redundant state and unnecessary Effect
function TodoList({ todos, filter }) {
  const [visibleTodos, setVisibleTodos] = useState([])

  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter))
  }, [todos, filter])
  // ...
}

// ✅ Good: Calculate during rendering
function TodoList({ todos, filter }) {
  const visibleTodos = getFilteredTodos(todos, filter)
  // ...
}

// ✅ Good: Use useMemo for expensive calculations
function TodoList({ todos, filter }) {
  const visibleTodos = useMemo(
    () => getFilteredTodos(todos, filter),
    [todos, filter],
  )
  // ...
}
```

• **Resetting State on Prop Change:** To reset all state when a prop changes,
use the `key` prop on the component. For partial resets, adjust state during
render or, preferably, lift state up.

```tsx
// 🔴 Bad: Resetting state on prop change in an Effect
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState("")

  useEffect(() => {
    setComment("")
  }, [userId])
  // ...
}

// ✅ Good: Use key prop to reset state
export default function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} />
}

function Profile({ userId }) {
  const [comment, setComment] = useState("")
  // State will reset automatically when key changes
  // ...
}
```

• **Sharing Logic Between Event Handlers:** Extract shared logic into a function
called by each handler, not into an Effect.

• **Notifying Parent Components:** Call parent callbacks directly in event
handlers, not in Effects. Or, lift state up to the parent.

```tsx
// 🔴 Bad: Notifying parent in an Effect
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false)

  useEffect(() => {
    onChange(isOn)
  }, [isOn, onChange])

  function handleClick() {
    setIsOn(!isOn)
  }
  // ...
}

// ✅ Good: Notify parent in event handler
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false)

  function handleClick() {
    const nextIsOn = !isOn
    setIsOn(nextIsOn)
    onChange(nextIsOn)
  }
  // ...
}
```

• **Passing Data to Parent:** Fetch data in the parent and pass it down as
props, rather than having children update parent state via Effects.

• **Chaining State Updates Solely to Trigger Effects:** Avoid chains of Effects
that update state to trigger other Effects. Instead, calculate during render and
update state in event handlers.

```tsx
// 🔴 Bad: Chains of Effects
function Game() {
  const [card, setCard] = useState(null)
  const [goldCardCount, setGoldCardCount] = useState(0)
  const [round, setRound] = useState(1)

  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount((c) => c + 1)
    }
  }, [card])

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound((r) => r + 1)
      setGoldCardCount(0)
    }
  }, [goldCardCount])
  // ...
}

// ✅ Good: Calculate in event handler
function Game() {
  const [card, setCard] = useState(null)
  const [goldCardCount, setGoldCardCount] = useState(0)
  const [round, setRound] = useState(1)

  function handlePlaceCard(nextCard) {
    setCard(nextCard)
    if (nextCard.gold) {
      if (goldCardCount <= 3) {
        setGoldCardCount(goldCardCount + 1)
      } else {
        setGoldCardCount(0)
        setRound(round + 1)
      }
    }
  }
  // ...
}
```

• **App Initialization Logic:** For logic that should run once per app load (not
per mount), use a top-level flag or module-level code, not an Effect.

```tsx
// 🔴 Bad: Effect that should only run once
function App() {
  useEffect(() => {
    loadDataFromLocalStorage()
    checkAuthToken()
  }, [])
  // ...
}

// ✅ Good: Use a flag or module-level code
let didInit = false

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true
      loadDataFromLocalStorage()
      checkAuthToken()
    }
  }, [])
  // ...
}

// ✅ Better: Run at module level
if (typeof window !== "undefined") {
  checkAuthToken()
  loadDataFromLocalStorage()
}

function App() {
  // ...
}
```

##### When to Use `useEffect`

• **Synchronizing with External Systems:** Use Effects to sync with non-React
systems (e.g., browser APIs, third-party widgets, subscriptions).

```tsx
// ✅ Good: Subscribing to browser events
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateState)
    window.addEventListener("offline", updateState)

    return () => {
      window.removeEventListener("online", updateState)
      window.removeEventListener("offline", updateState)
    }
  }, [])

  return isOnline
}
```

• **Fetching Data:** Use Effects to fetch data that should stay in sync with
props/state. Always implement cleanup to avoid race conditions.

```tsx
// ✅ Good: Data fetching with cleanup
function SearchResults({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    let ignore = false

    fetchResults(query).then((json) => {
      if (!ignore) {
        setResults(json)
      }
    })

    return () => {
      ignore = true
    }
  }, [query])

  return <ResultsList results={results} />
}
```

• **Subscribing to External Stores:** Use Effects (or preferably
`useSyncExternalStore`) to subscribe to external data sources.

```tsx
// ✅ Better: Using useSyncExternalStore
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}

function subscribe(callback) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}
```

• **Logic Triggered by Component Display:** Use Effects for logic that should
run because the component was displayed (e.g., analytics events on mount).

```tsx
// ✅ Good: Analytics on mount
function Form() {
  useEffect(() => {
    post("/analytics/event", { eventName: "visit_form" })
  }, [])

  // Form logic...
}
```

##### Best Practices & Alternatives

• **Calculate Derived State During Render:** Don't store redundant state;
compute from existing state/props.

• **Use `useMemo` for Expensive Calculations:** Only memoize if the calculation
is slow and depends on specific values.

• **Use the `key` Prop to Reset State:** Changing the `key` will remount the
component and reset its state.

• **Lift State Up:** If multiple components need to stay in sync, move state to
their common ancestor.

• **Handle User Interactions in Event Handlers:** All logic tied to user actions
should be in event handlers, not Effects.

• **Extract Reusable Logic:** Move shared logic into functions or custom hooks,
not Effects.

• **App-Wide Initialization:** Use a module-level flag or code for logic that
must run once per app load.

• **Use `useSyncExternalStore` for Subscriptions:** Prefer this over manual
Effect-based subscriptions for external data.

• **Cleanup in Data Fetching Effects:** Always add cleanup to ignore stale
responses and prevent race conditions.

• **Custom Hooks for Complex Effects:** Abstract complex Effect logic (like data
fetching) into custom hooks for clarity and reuse.

• **Prefer Framework Data Fetching:** Use your framework's built-in data
fetching when possible for better performance and ergonomics.

##### Summary

Use `useEffect` only for synchronizing with external systems or when a side
effect is required because a component is displayed. For everything
else—especially data transformation, user events, and derived state—prefer
direct calculation, event handlers, or lifting state up. This leads to simpler,
faster, and more maintainable React code.
