# PRD: Personal Finance Dashboard

## Introduction

A comprehensive personal finance management application built with vanilla HTML, CSS, and JavaScript. The dashboard enables users to track income and expenses, set budgets, create savings goals, and visualize their financial health through interactive charts. The application uses localStorage for data persistence and Chart.js for visualizations, with full responsive design and dark mode support.

## Goals

- Provide a complete personal finance tracking solution in a single-page web application
- Enable users to record, categorize, and analyze income and expense transactions
- Allow budget setting with real-time tracking and alerts
- Support savings goals with progress tracking and contribution management
- Visualize financial data through interactive charts (pie, line, bar)
- Ensure data portability through CSV import/export
- Deliver a responsive experience across mobile, tablet, and desktop
- Offer dark mode for comfortable viewing in any environment

## User Stories

### US-001: Project Setup
**Description:** As a developer, I need the foundational project structure so that I can build the finance dashboard with proper organization.

**Acceptance Criteria:**
- [ ] Create `index.html` with semantic HTML5 structure (header, main, footer, nav)
- [ ] Create `styles.css` with CSS variables for theming (mint green/teal color scheme)
- [ ] Create `scripts/app.js` using module pattern (IIFE or ES6 modules)
- [ ] Include Chart.js via CDN link in index.html
- [ ] Page loads without console errors
- [ ] HTML passes W3C validation (no major errors)
- [ ] Verify in browser: blank page loads, no console errors

---

### US-002: Header and Navigation
**Description:** As a user, I want a clear header and navigation so that I can easily switch between different sections of the app.

**Acceptance Criteria:**
- [ ] App title "Finance Dashboard" displayed prominently in header
- [ ] Navigation tabs: Dashboard, Transactions, Budgets, Goals (horizontal layout)
- [ ] "Add Transaction" button in top right corner with prominent styling (primary color)
- [ ] Dark mode toggle button (sun/moon icon or toggle switch)
- [ ] Current date displayed in header (format: "January 17, 2026")
- [ ] Header is sticky (stays visible on scroll)
- [ ] Clicking tabs switches visible view/section (only active view shown)
- [ ] Active tab visually indicated (underline, background, or color change)
- [ ] Mobile: hamburger menu or horizontal scrollable tabs
- [ ] Touch targets minimum 44px × 44px
- [ ] Verify in browser: header sticky, tabs switch views, responsive on mobile

---

### US-003: Data Storage Layer
**Description:** As a developer, I need a robust data storage module so that all financial data persists between sessions.

**Acceptance Criteria:**
- [ ] Create `Storage` module with methods for transactions, budgets, and goals
- [ ] Income categories: Salary, Freelance, Investment, Other
- [ ] Expense categories: Housing, Food, Transport, Entertainment, Healthcare, Shopping, Bills, Other
- [ ] CRUD operations: `create`, `read`, `update`, `delete` for each data type
- [ ] All data stored in localStorage with JSON serialization
- [ ] `loadSampleData()` function that populates demo transactions, budgets, and goals
- [ ] Sample data includes at least 20 transactions spanning 6 months
- [ ] Data loads automatically on page refresh
- [ ] Unique ID generation for each record (timestamp or UUID)
- [ ] Verify: Add transaction, refresh page, transaction still exists

---

### US-004: Add Transaction Modal
**Description:** As a user, I want to add new transactions through a form so that I can record my income and expenses.

**Acceptance Criteria:**
- [ ] Modal opens when "Add Transaction" button clicked
- [ ] Modal has overlay backdrop (click outside closes modal)
- [ ] Close button (X) in modal header
- [ ] Form fields: type (income/expense radio or toggle), amount (number input), category (dropdown), date (date picker), description (text input), tags (text input, comma-separated)
- [ ] Amount validation: must be positive number, show error message if invalid
- [ ] Category required: show error message if not selected
- [ ] Category dropdown options change based on selected type (income vs expense categories)
- [ ] Date field defaults to today's date
- [ ] Submit button saves transaction to storage
- [ ] Modal closes on successful save
- [ ] Form resets after successful save
- [ ] Keyboard support: Escape closes modal, Enter submits form
- [ ] Verify in browser: modal opens/closes, validation shows errors, transaction saves

---

### US-005: Transaction List View
**Description:** As a user, I want to see all my transactions in a list so that I can review my financial activity.

**Acceptance Criteria:**
- [ ] Display all transactions in table format (desktop) or card format (mobile)
- [ ] Columns/fields shown: date, description, category, amount
- [ ] Amount color-coded: green text for income, red text for expenses
- [ ] Transactions sorted by date, newest first (descending)
- [ ] Each transaction row has Edit button (pencil icon)
- [ ] Each transaction row has Delete button (trash icon)
- [ ] Delete shows confirmation dialog before removing
- [ ] Edit opens modal pre-filled with transaction data
- [ ] Empty state: friendly message "No transactions yet. Add your first transaction!"
- [ ] Transaction count displayed: "Showing X transactions"
- [ ] Verify in browser: transactions display correctly, sorted properly, edit/delete work

---

### US-006: Dashboard Summary Cards
**Description:** As a user, I want to see summary cards showing my financial overview so that I can quickly understand my current financial status.

**Acceptance Criteria:**
- [ ] Four summary cards displayed in grid layout
- [ ] Card 1: "Total Income" - sum of all income transactions for current month
- [ ] Card 2: "Total Expenses" - sum of all expense transactions for current month
- [ ] Card 3: "Net Savings" - income minus expenses for current month
- [ ] Card 4: "Savings Rate" - (net savings / income) × 100, displayed as percentage
- [ ] Each card has an icon (dollar sign, arrow up/down, piggy bank, percent)
- [ ] Color coding: Income card green, Expenses card red, Savings blue, Rate purple
- [ ] Numbers formatted with currency symbol and thousands separator
- [ ] Cards update immediately when transactions are added/edited/deleted
- [ ] Handle edge case: 0 income shows 0% savings rate (not NaN)
- [ ] Verify in browser: numbers calculate correctly, update in real-time

---

### US-007: Expense by Category Chart
**Description:** As a user, I want to see a pie chart of my expenses by category so that I can understand where my money goes.

**Acceptance Criteria:**
- [ ] Doughnut or pie chart rendered using Chart.js
- [ ] Shows expense breakdown by category for current month
- [ ] Only categories with expenses > 0 are shown (no empty slices)
- [ ] Each category has distinct color
- [ ] Hover tooltip shows: category name, amount, and percentage
- [ ] Legend displayed below or beside chart with category names
- [ ] Chart updates when transactions are added/edited/deleted
- [ ] Responsive: chart resizes appropriately on different screen sizes
- [ ] Empty state if no expenses: display message instead of empty chart
- [ ] Verify in browser: chart renders, updates when transactions change, interactive hover

---

### US-008: Income vs Expenses Timeline
**Description:** As a user, I want to see a timeline chart comparing income and expenses so that I can track trends over time.

**Acceptance Criteria:**
- [ ] Line chart rendered using Chart.js
- [ ] Shows data for last 6 months (including current month)
- [ ] Two lines: income line (green) and expenses line (red)
- [ ] X-axis: month names (e.g., "Aug", "Sep", "Oct", "Nov", "Dec", "Jan")
- [ ] Y-axis: amount in currency, auto-scaled
- [ ] Tooltip on hover shows exact values for both income and expenses
- [ ] Legend indicating which line is income vs expenses
- [ ] Smooth line interpolation (tension: 0.4)
- [ ] Chart responsive to container width
- [ ] Handle months with no data: show as 0
- [ ] Verify in browser: chart displays 6 months data, lines clearly visible, responsive

---

### US-009: Transaction Filters
**Description:** As a user, I want to filter and search my transactions so that I can find specific records quickly.

**Acceptance Criteria:**
- [ ] Filter by type: dropdown with options "All", "Income", "Expense"
- [ ] Filter by category: dropdown populated with all categories
- [ ] Filter by date range: start date and end date pickers
- [ ] Search by description: text input with instant filtering (on keyup)
- [ ] "Clear Filters" button resets all filters to default
- [ ] Status text: "Showing X of Y transactions" (filtered count / total count)
- [ ] All filters work independently (can use just one filter)
- [ ] All filters work combined (apply multiple filters simultaneously)
- [ ] Search is case-insensitive
- [ ] Empty result: show message "No transactions match your filters"
- [ ] Filters persist in view until cleared
- [ ] Verify in browser: all filters work independently and combined, search is instant

---

### US-010: Monthly Budget Setup
**Description:** As a user, I want to set monthly budgets for each expense category so that I can control my spending.

**Acceptance Criteria:**
- [ ] Budgets view/tab accessible from navigation
- [ ] "Add Budget" button to create new budget
- [ ] Budget form: category dropdown (expense categories only), monthly limit (number input)
- [ ] Only one budget per category allowed (show error if duplicate)
- [ ] Display list of all budgets with: category name, budgeted amount, spent amount
- [ ] Progress bar for each budget: shows spent/budgeted ratio
- [ ] Progress bar color: green (<80%), yellow (80-99%), red (≥100%)
- [ ] Edit button to modify budget limit
- [ ] Delete button with confirmation to remove budget
- [ ] Spent amount calculates from current month's transactions in that category
- [ ] Verify in browser: budgets save, progress bars update with spending

---

### US-011: Budget Alerts
**Description:** As a user, I want visual alerts when I approach or exceed my budgets so that I can adjust my spending.

**Acceptance Criteria:**
- [ ] Warning indicator when spending reaches 80% of budget (yellow/orange styling)
- [ ] Alert indicator when spending reaches 100% or more (red styling)
- [ ] Icon or badge on budget item showing warning/alert status
- [ ] Summary card on Dashboard: "Categories Over Budget" with count
- [ ] Clicking summary card scrolls to or shows over-budget categories
- [ ] Alert status updates immediately when transactions are added
- [ ] Visual indicators visible in budget list view
- [ ] Tooltip or text showing: "X% of budget used" or "$X over budget"
- [ ] Verify in browser: alerts show correctly, update in real-time

---

### US-012: Savings Goals
**Description:** As a user, I want to create savings goals so that I can track my progress toward financial objectives.

**Acceptance Criteria:**
- [ ] Goals view/tab accessible from navigation
- [ ] "Add Goal" button to create new goal
- [ ] Goal form fields: name (text), target amount (number), current amount (number, default 0), target date (date picker), category (dropdown)
- [ ] Goal categories: Emergency Fund, Vacation, Car, House, Other
- [ ] Display list of goals with: name, progress bar, current/target amounts
- [ ] Progress bar shows percentage complete (current/target × 100)
- [ ] Days remaining countdown calculated from today to target date
- [ ] "Add Contribution" button for each goal
- [ ] Contribution modal: amount input, adds to current amount
- [ ] Edit and Delete buttons for each goal
- [ ] Verify in browser: goals save, progress calculates correctly, contributions update

---

### US-013: Goal Progress Tracking
**Description:** As a user, I want visual indicators showing if I'm on track to meet my goals so that I can adjust my savings.

**Acceptance Criteria:**
- [ ] Visual timeline or progress section for each goal
- [ ] Status color coding:
  - Green: on track (current progress ≥ expected progress based on time elapsed)
  - Yellow: at risk (current progress is 10-30% behind expected)
  - Red: behind (current progress is >30% behind expected)
- [ ] "Required monthly contribution" calculated and displayed: (target - current) / months remaining
- [ ] Handle edge case: past target date shows "Overdue" status
- [ ] Celebration animation when goal reaches 100% (confetti, checkmark animation, or similar)
- [ ] Status badge or icon on each goal card
- [ ] Percentage complete displayed as text and progress bar
- [ ] Verify in browser: status calculates correctly, animations trigger at 100%

---

### US-014: Export to CSV
**Description:** As a user, I want to export my data to CSV so that I can use it in spreadsheets or for backup.

**Acceptance Criteria:**
- [ ] "Export Transactions" button in Transactions view
- [ ] "Export Budgets" button in Budgets view
- [ ] Clicking button triggers CSV file download
- [ ] Transactions CSV columns: Date, Type, Category, Amount, Description, Tags
- [ ] Budgets CSV columns: Category, Budget Limit, Spent, Remaining
- [ ] Filename format: `transactions_2026-01-17.csv` or `budgets_2026-01-17.csv` (includes date)
- [ ] CSV uses proper formatting (quoted strings, escaped commas)
- [ ] CSV opens correctly in Excel/Google Sheets
- [ ] Empty data: show message "No data to export"
- [ ] Verify: CSV downloads, opens in Excel, all data present and correct

---

### US-015: Import from CSV
**Description:** As a user, I want to import transactions from CSV so that I can migrate data from other apps.

**Acceptance Criteria:**
- [ ] "Import Transactions" button in Transactions view
- [ ] File input accepts only .csv files
- [ ] After file selection, show preview table of parsed data
- [ ] Preview shows first 10 rows with all columns
- [ ] Validation: check required fields (amount, category, date)
- [ ] Invalid rows highlighted in red with error message
- [ ] Duplicate detection: flag transactions matching existing date + amount + description
- [ ] "Import" button to confirm and save valid transactions
- [ ] "Cancel" button to abort import
- [ ] Success message: "Imported X transactions"
- [ ] Error handling for malformed CSV files
- [ ] Verify in browser: CSV uploads, preview shows correctly, duplicates flagged

---

### US-016: Dark Mode
**Description:** As a user, I want to toggle between light and dark themes so that I can use the app comfortably in any lighting.

**Acceptance Criteria:**
- [ ] Toggle button in header (sun/moon icon)
- [ ] Dark mode: dark background (#1a1a2a or similar), light text
- [ ] Light mode: white/light background, dark text
- [ ] Theme preference saved to localStorage
- [ ] Theme loads from localStorage on page load
- [ ] Smooth CSS transition when switching themes (0.3s)
- [ ] All text remains readable in both themes (sufficient contrast)
- [ ] Chart.js charts adapt colors for dark mode (light gridlines, labels)
- [ ] Form inputs, modals, and buttons styled for both themes
- [ ] Verify in browser: theme persists after refresh, all content readable, charts adapt

---

### US-017: Responsive Design
**Description:** As a user, I want the app to work well on any device so that I can manage finances on mobile, tablet, or desktop.

**Acceptance Criteria:**
- [ ] Mobile (375px - iPhone SE): single column layout, stacked cards, full-width charts
- [ ] Mobile: hamburger menu for navigation or horizontal scrollable tabs
- [ ] Mobile: modals take full screen width
- [ ] Tablet (768px - iPad): 2-column grid for summary cards, charts side by side where appropriate
- [ ] Desktop (1440px+): 3-4 column grid for cards, dashboard overview layout
- [ ] All touch targets minimum 44px × 44px for accessibility
- [ ] Tables convert to card layout on mobile
- [ ] No horizontal scroll on any viewport
- [ ] Text remains readable (minimum 16px body text on mobile)
- [ ] Charts resize responsively
- [ ] Verify in browser: test at 375px, 768px, and 1440px widths

---

### US-018: Statistics Dashboard
**Description:** As a user, I want to see detailed statistics so that I can understand my spending patterns and trends.

**Acceptance Criteria:**
- [ ] Statistics section on Dashboard or separate Statistics tab
- [ ] Top spending categories: horizontal bar chart showing top 5 expense categories
- [ ] Average daily spending: calculated from current month expenses / days elapsed
- [ ] Month comparison: this month vs last month with percentage change (up/down arrow)
- [ ] Best saving month: highest net savings in last 6 months displayed with month name
- [ ] Spending trend indicator: "Increasing" or "Decreasing" based on 3-month moving average
- [ ] All calculations update in real-time with transactions
- [ ] Handle edge cases: first month of usage, no data for comparison
- [ ] Verify in browser: all calculations correct, charts render, comparisons accurate

---

### US-019: Recurring Transactions
**Description:** As a user, I want to set up recurring transactions so that I don't have to manually enter regular income or expenses.

**Acceptance Criteria:**
- [ ] Checkbox in Add Transaction form: "Make this recurring"
- [ ] If checked, show frequency dropdown: Weekly, Monthly, Yearly
- [ ] Recurring transactions stored with `isRecurring: true` and `frequency` field
- [ ] Recurring template stored separately from transaction instances
- [ ] Auto-generate upcoming transactions: on app load, check if new instances are due
- [ ] Generated transactions appear in transaction list with "recurring" badge/icon
- [ ] Recurring templates viewable in separate section or filter
- [ ] Edit recurring template: changes apply to future instances only
- [ ] Delete recurring template: option to keep or delete generated instances
- [ ] "Next occurrence" date displayed for each recurring template
- [ ] Verify in browser: recurring saves, auto-generation works on page load, editable

---

### US-020: Settings Panel
**Description:** As a user, I want to customize app settings so that the app works according to my preferences.

**Acceptance Criteria:**
- [ ] Settings accessible from header (gear icon) or navigation
- [ ] Currency selection: dropdown with USD, EUR, GBP, JPY, CAD, AUD, INR
- [ ] Currency symbol applied throughout app (all amounts)
- [ ] Date format selection: MM/DD/YYYY or DD/MM/YYYY
- [ ] Date format applied to all date displays
- [ ] First day of week: Sunday or Monday (affects any week-based features)
- [ ] "Reset All Data" button with confirmation dialog
- [ ] Confirmation dialog requires typing "RESET" or clicking "Confirm" twice
- [ ] Reset clears all localStorage data and reloads app
- [ ] All settings saved to localStorage and persist
- [ ] Verify in browser: settings save, apply globally, reset works with confirmation

---

## Functional Requirements

- FR-001: Application loads as single HTML page with CSS and JavaScript
- FR-002: All data persists in browser localStorage as JSON
- FR-003: Chart.js library used for all chart visualizations
- FR-004: Income categories: Salary, Freelance, Investment, Other
- FR-005: Expense categories: Housing, Food, Transport, Entertainment, Healthcare, Shopping, Bills, Other
- FR-006: Transaction record includes: id, type, amount, category, date, description, tags, isRecurring, frequency
- FR-007: Budget record includes: id, category, limit, createdAt
- FR-008: Goal record includes: id, name, targetAmount, currentAmount, targetDate, category, createdAt
- FR-009: All monetary inputs accept only positive numbers
- FR-010: All forms validate required fields before submission
- FR-011: Delete operations require user confirmation
- FR-012: Currency formatting includes symbol, thousands separator, and 2 decimal places
- FR-013: Date operations use native JavaScript Date object
- FR-014: CSV export uses RFC 4180 format (proper escaping)
- FR-015: Responsive breakpoints: 375px (mobile), 768px (tablet), 1024px+ (desktop)
- FR-016: Minimum touch target size: 44px × 44px
- FR-017: Theme uses CSS custom properties (variables) for easy switching
- FR-018: All user-facing text accessible for future localization

## Non-Goals (Out of Scope)

- No server-side storage or user accounts (all data is local)
- No bank account integration or API connections
- No mobile app (web only, but responsive)
- No multi-currency support within same account (single currency setting)
- No data encryption (beyond browser's localStorage security)
- No collaboration or sharing features
- No notifications (browser or push)
- No machine learning or AI predictions
- No bill splitting or shared expense tracking
- No investment tracking or portfolio management
- No debt payoff calculators
- No financial advice or recommendations

## Design Considerations

### Color Scheme
- Primary: Mint green (#3EB489) or Teal (#20B2AA)
- Secondary: Light teal (#E0F7FA)
- Income: Green (#4CAF50)
- Expense: Red (#F44336)
- Warning: Yellow/Orange (#FFC107)
- Dark mode background: #1a1a2a
- Dark mode surface: #2d2d3d

### Typography
- Font family: System fonts (Arial, Helvetica, sans-serif) or Google Fonts (Inter, Roboto)
- Base font size: 16px
- Headings: 1.5rem - 2.5rem
- Line height: 1.5

### Layout
- Maximum content width: 1200px
- Card-based design with consistent padding (16px-24px)
- Consistent spacing scale: 4px, 8px, 16px, 24px, 32px

### Accessibility
- Color contrast ratio: minimum 4.5:1
- Focus indicators on all interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigable

## Technical Considerations

### Dependencies
- Chart.js (v4.x) via CDN only

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Performance
- Initial load under 3 seconds on 3G
- Smooth animations (60fps)
- Debounce search input (300ms)

### Code Organization
```
index.html
styles.css
scripts/
  app.js          # Main entry point, module initialization
  storage.js      # localStorage operations
  transactions.js # Transaction CRUD and display
  budgets.js      # Budget CRUD and display
  goals.js        # Goals CRUD and display
  charts.js       # Chart.js configurations
  utils.js        # Helper functions (formatting, dates, validation)
  ui.js           # Modal, navigation, theme handling
```

### Data Structures
```javascript
// Transaction
{
  id: "txn_1705481234567",
  type: "expense", // or "income"
  amount: 45.99,
  category: "Food",
  date: "2026-01-17",
  description: "Grocery shopping",
  tags: ["groceries", "weekly"],
  isRecurring: false,
  frequency: null // "weekly", "monthly", "yearly"
}

// Budget
{
  id: "bgt_1705481234567",
  category: "Food",
  limit: 500,
  createdAt: "2026-01-01"
}

// Goal
{
  id: "goal_1705481234567",
  name: "Emergency Fund",
  targetAmount: 10000,
  currentAmount: 2500,
  targetDate: "2026-12-31",
  category: "Emergency Fund",
  createdAt: "2026-01-01"
}

// Settings
{
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  firstDayOfWeek: "Sunday",
  theme: "light"
}
```

## Success Metrics

- All 20 user stories implemented and passing acceptance criteria
- Page loads in under 3 seconds
- All interactive elements respond in under 100ms
- No JavaScript console errors during normal operation
- Responsive design works at 375px, 768px, and 1440px
- Dark mode fully functional with readable text and charts
- Data persists correctly across browser sessions
- CSV import/export works with Excel and Google Sheets

## Open Questions

1. Should recurring transactions auto-generate for the next 3 months or just the next occurrence?
2. Should the app support multiple accounts/wallets in a future version?
3. Is there a preference for specific Chart.js theme or color palette?
4. Should goals support recurring contributions (auto-deduct from income)?
5. Is offline service worker support needed for future versions?
