# 💰 Personal Finance Dashboard

A comprehensive web application to track income, expenses, budgets, and financial goals with beautiful interactive visualizations. Take control of your finances with intuitive charts, smart budgets, and goal tracking.

![Finance Dashboard Preview](https://via.placeholder.com/800x400/00d4aa/ffffff?text=Finance+Dashboard+Screenshot)

## ✨ Features

### 💵 **Transaction Management**
- Add, edit, and delete income and expense transactions
- Categorized tracking (Housing, Food, Transport, Entertainment, Healthcare, Shopping, Bills, etc.)
- Tag transactions for better organization
- Rich filtering: by type, category, date range, and keyword search
- Bulk import from CSV with duplicate detection
- Export all data to CSV for backup

### 📊 **Visual Analytics**
- **Summary Dashboard**: Total income, expenses, net savings, and savings rate
- **Expense Breakdown**: Interactive pie chart by category
- **Income vs Expenses**: 6-month timeline comparison
- **Top Spending Categories**: Bar chart highlighting where your money goes
- **Trend Analysis**: Month-over-month comparisons and insights

### 🎯 **Budget Management**
- Set monthly budgets per expense category
- Visual progress bars (spent vs budgeted)
- Smart alerts:
  - ⚠️ Yellow warning at 80% of budget
  - 🚨 Red alert when over budget
- Real-time budget tracking as you add transactions

### 🏆 **Savings Goals**
- Create multiple savings goals (Emergency Fund, Vacation, Car, House, etc.)
- Track progress with visual timelines
- See days remaining and required monthly contributions
- Add contributions to goals
- 🎉 Celebration animation when goals are reached
- Status indicators: On Track (green), At Risk (yellow), Behind (red)

### 🔄 **Recurring Transactions**
- Mark transactions as recurring (weekly, monthly, yearly)
- Auto-generate upcoming recurring transactions
- Manage recurring templates
- Never forget regular bills or income

### ⚙️ **Customization**
- **Dark Mode**: Easy on the eyes with smooth transitions
- **Currency Support**: USD, EUR, GBP, and more
- **Date Formats**: MM/DD/YYYY or DD/MM/YYYY
- **First Day of Week**: Sunday or Monday
- Settings persist across sessions

### 📱 **User Experience**
- Fully responsive (mobile, tablet, desktop)
- Touch-friendly interface (44px minimum touch targets)
- Smooth animations and transitions
- Accessible keyboard navigation
- Works offline (Progressive Web App ready)
- Fast performance with no backend required

## 🚀 Live Demo

**[View Live Demo →](https://edwintho.github.io/finance-dashboard)**

Try it with sample data - all data stays in your browser!

## 📸 Screenshots

### Dashboard View
*Add dashboard screenshot*

### Transaction Management
*Add transactions screenshot*

### Budget Tracking
*Add budgets screenshot*

### Goals Progress
*Add goals screenshot*

### Dark Mode
*Add dark mode screenshot*

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Vanilla JavaScript (ES6 Modules) |
| **Styling** | CSS3 with CSS Variables |
| **Charts** | Chart.js 4.4.1 |
| **Storage** | Browser LocalStorage API |
| **Icons** | Unicode Emojis |
| **Build** | None - Pure HTML/CSS/JS |

## 💻 Getting Started

### Quick Start

1. **Clone the repository**
```bash
   git clone https://github.com/EdwinTho/finance-dashboard.git
   cd finance-dashboard
```

2. **Run a local server** (required for ES6 modules)
```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
```

3. **Open in browser**
```
   http://localhost:8000
```

4. **Start managing your finances!**
   - Click "Load Sample Data" to see demo transactions
   - Or start fresh with "Add Transaction"

### First Time Setup

1. Set your currency in Settings (⚙️)
2. Create expense categories budgets
3. Set up your first savings goal
4. Start adding transactions!

## 📁 Project Structure
```
finance-dashboard/
├── index.html                 # Main HTML file
├── styles.css                # All styles + themes
├── scripts/
│   ├── app.js               # Main entry point & initialization
│   ├── storage.js           # LocalStorage data layer
│   ├── transactions.js      # Transaction CRUD & display
│   ├── budgets.js           # Budget management
│   ├── goals.js             # Savings goals tracker
│   ├── charts.js            # Chart.js visualizations
│   ├── filters.js           # Search & filter logic
│   ├── modal.js             # Modal dialogs
│   ├── import-export.js     # CSV import/export
│   ├── recurring.js         # Recurring transactions
│   ├── settings.js          # User preferences
│   ├── theme.js             # Dark mode toggle
│   └── utils.js             # Helper functions
└── README.md
```

## 🎨 Design Philosophy

- **Clean & Modern**: Minimalist interface focusing on clarity
- **Mobile-First**: Designed for phone, enhanced for desktop
- **Data Privacy**: All data stored locally in your browser
- **No Sign-Up**: Start using immediately, no accounts needed
- **Fast & Lightweight**: < 200KB total, loads instantly

## 🔐 Privacy & Security

- ✅ **100% Client-Side**: No server, no database
- ✅ **Your Data Stays Local**: Stored in browser LocalStorage
- ✅ **No Tracking**: Zero analytics or third-party scripts
- ✅ **No Sign-Up Required**: Use anonymously
- ✅ **Export Anytime**: Download your data as CSV

## 🎯 Use Cases

Perfect for:
- 👨‍💼 Freelancers tracking income and expenses
- 👨‍👩‍👧‍👦 Families managing household budgets
- 🎓 Students learning financial responsibility
- 💼 Anyone wanting to understand spending habits
- 📊 People preparing for financial goals

## 🤖 Built With AI

This project was built **autonomously** using:
- **[Ralph](https://github.com/snarktank/ralph)** - AI agent orchestration
- **[Amp](https://ampcode.com)** - AI coding assistant

Ralph completed **20 user stories** in autonomous iterations, showcasing:
- Modern JavaScript patterns (ES6 modules, async/await)
- Clean separation of concerns
- Accessible, semantic HTML
- Responsive CSS with modern features
- Production-ready code quality

## 📚 Key Technical Learnings

### JavaScript
- ES6 module system for code organization
- Chart.js integration and configuration
- LocalStorage data modeling with relationships
- CSV parsing and generation
- File upload handling with validation
- Drag and drop for goal reordering

### CSS
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theming
- Smooth transitions and animations
- Mobile-first responsive design
- Print-friendly stylesheets

### Best Practices
- Modular architecture
- Event delegation for performance
- Debouncing for search inputs
- Data validation and sanitization
- Accessibility (ARIA labels, keyboard nav)
- Progressive enhancement

## 🔜 Potential Enhancements

Future features that could be added:
- [ ] Multiple accounts/wallets
- [ ] Bank account integration via Plaid
- [ ] Bill reminders and notifications
- [ ] Split transactions (shared expenses)
- [ ] Investment tracking
- [ ] Tax category tagging
- [ ] Multi-currency support
- [ ] Backup to cloud (Google Drive, Dropbox)
- [ ] Budget templates (50/30/20 rule, etc.)
- [ ] Financial advice based on spending patterns
- [ ] Collaborative budgets for families
- [ ] Receipt photo uploads
- [ ] API for programmatic access

## 🤝 Contributing

Found a bug or have a feature request? Feel free to:
1. Open an issue
2. Submit a pull request
3. Star the repo if you find it useful!

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 👤 Author

**Edwin Tho**
- GitHub: [@EdwinTho](https://github.com/EdwinTho)
- LinkedIn: [Add your LinkedIn URL]
- Portfolio: [Add your portfolio URL]

## 🙏 Acknowledgments

- Chart.js for beautiful, responsive charts
- Ralph AI Agent for autonomous development
- The open-source community

---

## 💡 Tips for Best Results

1. **Regular Updates**: Add transactions weekly for accurate insights
2. **Realistic Budgets**: Start with actual spending, then optimize
3. **Small Goals First**: Build momentum with achievable targets
4. **Review Monthly**: Check your dashboard at month-end
5. **Export Regularly**: Backup your data monthly

---

⭐ **Star this repo if it helps you save money!**

📊 **Track smarter. Save better. Achieve goals.**
