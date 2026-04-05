# FinanceIQ Dashboard

FinanceIQ is a frontend-only finance dashboard built as a polished product-style take-home submission. It focuses on responsive UX, clean state management, believable mock financial data, and thoughtful interaction design rather than backend complexity.

## Project Overview

This project simulates a modern finance dashboard where users can:

- review overall financial health
- inspect and manage transactions
- explore spending patterns and smart insights
- switch between frontend-only roles to demonstrate RBAC behavior

The goal was to make the submission feel like a compact real product instead of a generic chart-and-table demo.

## Why This Stands Out

This submission was designed to feel like a small product, not just a completed checklist. The strongest differentiators for reviewers are:

- thoughtful UX across desktop and mobile, including a mobile-first filter sheet instead of a crowded toolbar
- richer product behavior such as analyst/admin/viewer role simulation, undo delete, saved presets, bulk export, and keyboard command palette
- believable financial storytelling through realistic mock data, recurring subscription detection, unusual spending alerts, and month-vs-average insights
- stronger frontend engineering discipline through derived-state hooks, Zustand persistence with fallback handling, route-level lazy loading, and lightweight automated tests
- extra polish in the details: dark mode, empty states, responsive layout, contextual toasts, sticky headers, grouped transactions, and accessible controls

## Live Scope

The app currently includes:

- responsive dashboard, transactions, and insights pages
- interactive charts and narrative insights
- admin, analyst, and viewer role modes
- transaction filtering, editing, grouping, export, and persistence
- dark mode and mobile-first filter UX
- keyboard command palette
- lightweight automated tests

## Tech Stack

- `React + Vite`
  Fast development workflow, route-based SPA structure, and simple production builds.

- `TypeScript`
  Safer refactors, stronger component contracts, and better maintainability.

- `Zustand`
  Lightweight shared state for transactions, filters, roles, theme, toasts, and persistence.

- `Recharts`
  Responsive charting for dashboard and insights views.

- `React Router`
  Clear page-level routing for Dashboard, Transactions, and Insights.

- `Framer Motion`
  Smooth transitions for pages, modals, and interaction feedback.

- `date-fns`
  Date parsing, formatting, month math, and relative range handling.

- `Tailwind CSS`
  Fast, consistent styling across dark mode, layout, and responsive states.

- `lucide-react`
  Icon system for navigation, summaries, and actions.

- `Vitest + Testing Library`
  Lightweight automated verification for utilities, permissions, export, and form validation.

## Core Features

### Dashboard

- summary cards for:
  - total balance
  - monthly income
  - monthly expenses
  - savings rate
- animated counters and loading skeletons
- balance trend chart
- spending breakdown pie chart
- top-category bar chart
- cumulative savings chart
- monthly goal progress ring
- top merchants widget
- weekday vs weekend spending widget
- recent transactions widget

### Transactions

- debounced search by merchant, description, and category
- category filtering
- merchant filter
- amount range filter
- transaction type toggles
- date range filtering
- date presets:
  - all time
  - this month
  - last month
  - last 30 days
  - last 3 months
- data-relative preset labels based on the latest dataset month
- saved filter presets
- mobile quick filters with advanced bottom-sheet filters
- sorting by date, amount, and category
- grouped transaction list by month
- sticky desktop table header
- responsive desktop table and mobile card layout
- add, edit, and delete transactions
- future-date validation in the transaction form
- bulk select and export selected rows
- export filtered transactions to CSV
- undo delete through toast action
- transaction metadata:
  - account tags
  - posted/pending status
  - recurring badge
  - income source tag

### Insights

- highest spending category
- month-over-month expense comparison
- best savings month
- largest transaction
- smart narrative observations
- recurring subscription detector
- unusual spending alert
- month vs six-month average comparison
- highest discretionary spending month
- savings projection
- duplicate transaction pattern detection
- grouped monthly comparison chart
- category trend chart
- spending heatmap

### RBAC

- `Viewer`
  Read-only mode. Can inspect data, but cannot add, edit, delete, or export.

- `Analyst`
  Read-and-inspect mode. Can explore filters and export data, but cannot modify transactions.

- `Admin`
  Full transaction management mode with add, edit, delete, and export access.

Role selection is persisted locally for easier demo review.

### Product Polish

- dark mode with persisted theme
- no flash of incorrect theme on reload
- responsive sidebar and mobile bottom navigation
- portal-based mobile filter sheet
- keyboard command palette with `Ctrl/Cmd + K`
- route transitions and animated UI feedback
- toast notifications with contextual messaging
- empty states for no matching transactions and missing data
- corrupted local storage fallback for persisted transactions

## Data Model

The app uses realistic mock financial data spanning a rolling six-month story. Each transaction includes:

- `id`
- `date`
- `amount`
- `category`
- `type`
- `description`
- `merchant`
- `account`
- `status`
- `isRecurring`
- `sourceTag` for income when applicable

This allows the dashboard to feel more believable and supports richer insights without backend dependencies.

## Architecture Notes

- A single Zustand store manages:
  - transactions
  - filters
  - selected role
  - theme
  - toasts

- Derived state is kept out of components where possible:
  - filtered transactions
  - paginated transactions
  - dashboard summaries
  - chart series
  - smart insights

- Expensive computed state is memoized in dedicated hooks for:
  - dashboard data
  - transactions view
  - insights data

- The transactions page was intentionally decomposed into focused components:
  - toolbar
  - table
  - row
  - mobile card
  - modal
  - pagination

- Routes are lazy-loaded to reduce the initial bundle load.

## Folder Structure

```text
src/
  components/
    charts/
    layout/
    transactions/
    ui/
  context/
  data/
  hooks/
  pages/
  store/
  test/
  types/
  utils/
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Create a production build

```bash
npm run build
```

### Run tests

```bash
npm run test
```

### Preview production build

```bash
npm run preview
```

## Testing

The project includes a lightweight automated test layer focused on high-value frontend behavior:

- summary and filtering utilities
- CSV export behavior
- RBAC permission logic
- transaction modal validation

This is intentionally not an exhaustive test suite, but it adds confidence and helps differentiate the submission from dashboards that are only manually verified.

## Accessibility Notes

The app includes:

- aria labels for icon-only controls
- labelled modal dialog structure
- accessible filter groups
- keyboard-friendly command palette
- visible focus rings for interactive controls

## Known Limitations

- data is mock-only and not connected to a backend
- RBAC is frontend-only and not secure authorization
- saved filter presets are intentionally simple and do not yet support rename/delete
- command palette currently supports page navigation and transaction search, but not all filter actions
- charts are optimized for clarity, not export/reporting workflows

## Easy Additions Still Worth Doing

These are the easiest strong improvements if you still want a little more polish without major refactors:

### High impact, low risk

- screenshot gallery in the README
- named saved filter presets instead of `Preset 1`, `Preset 2`
- delete saved presets
- recent searches in the command palette
- command palette sections like `Pages` and `Transactions`
- one-click quick actions in the command palette:
  - `Go to Transactions`
  - `Open Insights`
  - `Switch to Admin`
  - `Toggle dark mode`

### Small UX upgrades

- row hover tooltip for truncated merchant/description text
- copy transaction details action
- success toast when a transaction is added with the merchant name and amount
- “clear all selections” button when bulk export is active
- preset badge showing the currently active date preset more prominently

### Submission polish

- add final screenshots and a short feature GIF
- add a short “How I approached the assignment” section
- add a short “tradeoffs / future improvements” section tailored to the evaluator

## Future Improvements

- mock API integration
- JSON export and print-friendly reporting
- widget customization
- recurring budget targets by category
- richer anomaly detection and forecasting
- deeper automated test coverage

## Screenshots

Place screenshots in `docs/screenshots/` using the filenames below and the README will render them automatically.

```md
![Dashboard Overview](docs/screenshots/dashboard-overview.png)
![Dashboard Depth](docs/screenshots/dashboard-depth.png)
![Transactions Filters](docs/screenshots/transactions-filters.png)
![Transactions Table](docs/screenshots/transactions-table.png)
![Insights Page](docs/screenshots/insights-overview.png)
![Mobile Dashboard](docs/screenshots/mobile-dashboard.png)
```

### Dashboard Overview

![Dashboard Overview](docs/screenshots/dashboard-overview.png)

### Dashboard Depth

![Dashboard Depth](docs/screenshots/dashboard-depth.png)

### Transactions Filters

![Transactions Filters](docs/screenshots/transactions-filters.png)

### Transactions Table

![Transactions Table](docs/screenshots/transactions-table.png)

### Insights Overview

![Insights Overview](docs/screenshots/insights-overview.png)

### Mobile Dashboard

![Mobile Dashboard](docs/screenshots/mobile-dashboard.png)

Suggested screenshot set:

- Dashboard overview
- Cumulative savings and supporting widgets
- Transactions filters and bulk actions
- Transactions table with grouping and metadata
- Insights overview
- Mobile dashboard
- Command palette
