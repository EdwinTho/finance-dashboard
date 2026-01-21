// State
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
let editingBudgetId = null;

let goals = JSON.parse(localStorage.getItem('goals')) || [];
let editingGoalId = null;
let contributingGoalId = null;

let recurringTemplates = JSON.parse(localStorage.getItem('recurringTemplates')) || [];

// Settings state
let settings = JSON.parse(localStorage.getItem('settings')) || {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    weekStart: 'Sunday'
};

const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹'
};

let transactions = [
    { id: 1, desc: 'Grocery', amount: 50, type: 'Expense', category: 'Food', date: '2023-10-01' },
    { id: 2, desc: 'Movie', amount: 20, type: 'Expense', category: 'Entertainment', date: '2023-10-02' },
    { id: 3, desc: 'Rent', amount: 1000, type: 'Expense', category: 'Rent', date: '2023-10-05' },
    { id: 4, desc: 'Salary', amount: 3000, type: 'Income', category: 'Salary', date: '2023-10-01' },
    { id: 5, desc: 'Freelance', amount: 500, type: 'Income', category: 'Freelance', date: '2023-10-10' }
];

let timelineChartInstance = null;
let categoryChartInstance = null;
let topCategoriesChartInstance = null;

// Filter state
let currentTypeFilter = 'All';
let currentCategoryFilter = 'All';
let currentStartDate = '';
let currentEndDate = '';
let currentSearchQuery = '';
let searchDebounceTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initTopCategoriesChart();
    populateCategoryFilter();
    renderList();
    updateCharts();
    updateTopCategoriesChart();
    setupFilterListeners();
    setupNavigation();
    setupBudgetListeners();
    renderBudgetList();
    setupGoalListeners();
    renderGoalList();
    initTheme();
    setupTransactionModal();
    setupRecurringTemplates();
    processRecurringTransactions();
    setupSettingsPanel();
});

// Currency and Date Formatting Helpers
function formatCurrency(amount) {
    const symbol = currencySymbols[settings.currency] || '$';
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    if (settings.dateFormat === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    }
    return `${month}/${day}/${year}`;
}

function formatDisplayDateLong(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    if (settings.dateFormat === 'DD/MM/YYYY') {
        return date.toLocaleDateString('en-GB', options);
    }
    return date.toLocaleDateString('en-US', options);
}

// Populate category dropdown with all unique categories
function populateCategoryFilter() {
    const categorySelect = document.getElementById('categoryFilter');
    const categories = [...new Set(transactions.map(t => t.category))];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// Setup filter event listeners
function setupFilterListeners() {
    document.getElementById('typeFilter').addEventListener('change', (e) => {
        currentTypeFilter = e.target.value;
        renderList();
    });
    
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        renderList();
    });
    
    document.getElementById('startDate').addEventListener('change', (e) => {
        currentStartDate = e.target.value;
        renderList();
    });
    
    document.getElementById('endDate').addEventListener('change', (e) => {
        currentEndDate = e.target.value;
        renderList();
    });
    
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            currentSearchQuery = e.target.value;
            renderList();
        }, 300);
    });
    
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
}

// Clear all filters to default
function clearAllFilters() {
    currentTypeFilter = 'All';
    currentCategoryFilter = 'All';
    currentStartDate = '';
    currentEndDate = '';
    currentSearchQuery = '';
    
    document.getElementById('typeFilter').value = 'All';
    document.getElementById('categoryFilter').value = 'All';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('searchInput').value = '';
    
    renderList();
}

// Get filtered transactions based on current filters
function getFilteredTransactions() {
    return transactions.filter(t => {
        const typeMatch = currentTypeFilter === 'All' || t.type === currentTypeFilter;
        const categoryMatch = currentCategoryFilter === 'All' || t.category === currentCategoryFilter;
        
        let dateMatch = true;
        if (currentStartDate) {
            dateMatch = dateMatch && t.date >= currentStartDate;
        }
        if (currentEndDate) {
            dateMatch = dateMatch && t.date <= currentEndDate;
        }
        
        const searchMatch = !currentSearchQuery || 
            t.desc.toLowerCase().includes(currentSearchQuery.toLowerCase());
        
        return typeMatch && categoryMatch && dateMatch && searchMatch;
    });
}

// AC: Expense category chart & Timeline chart setup
function initCharts() {
    // Timeline Chart (Line)
    const ctxTime = document.getElementById('timelineChart').getContext('2d');
    timelineChartInstance = new Chart(ctxTime, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            animation: { duration: 750 },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });

    // Category Chart (Doughnut)
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            animation: { duration: 750 },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 8
                    }
                }
            }
        }
    });
}

// AC: Charts update when transactions added/edited/deleted
function updateCharts() {
    // 1. Process Data for Category Chart
    const categoryMap = {};
    transactions.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount);
    });

    categoryChartInstance.data = {
        labels: Object.keys(categoryMap),
        datasets: [{
            data: Object.values(categoryMap),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
    };
    categoryChartInstance.update();

    // 2. Process Data for Timeline Chart
    // Sort by date first
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dateMap = {};
    sortedTx.forEach(t => {
        dateMap[t.date] = (dateMap[t.date] || 0) + parseFloat(t.amount);
    });

    timelineChartInstance.data = {
        labels: Object.keys(dateMap),
        datasets: [{
            label: 'Total Spent',
            data: Object.values(dateMap),
            borderColor: '#36A2EB',
            fill: false,
            tension: 0.1
        }]
    };
    timelineChartInstance.update();
}

// Top Categories Chart (Statistics)
function initTopCategoriesChart() {
    const ctx = document.getElementById('topCategoriesChart').getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    topCategoriesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Amount Spent',
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const symbol = currencySymbols[settings.currency] || '$';
                            return `${symbol}${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: isDark ? '#a1a1aa' : '#666666',
                        callback: function(value) {
                            const symbol = currencySymbols[settings.currency] || '$';
                            return symbol + value;
                        }
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: isDark ? '#e4e4e7' : '#333333'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateTopCategoriesChart() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Update month label
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('statsMonthLabel').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Get current month expenses by category
    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.type !== 'Expense') return;
        const txDate = new Date(t.date);
        if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) return;
        
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
    });
    
    // Sort by amount and take top 5
    const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const labels = sorted.map(([cat]) => cat);
    const data = sorted.map(([, amount]) => amount);
    
    // Show/hide empty state
    const emptyEl = document.getElementById('statsEmpty');
    const chartContainer = document.querySelector('.stats-chart-container');
    
    if (sorted.length === 0) {
        emptyEl.classList.remove('hidden');
        chartContainer.style.display = 'none';
    } else {
        emptyEl.classList.add('hidden');
        chartContainer.style.display = 'block';
    }
    
    // Update chart
    topCategoriesChartInstance.data.labels = labels;
    topCategoriesChartInstance.data.datasets[0].data = data;
    topCategoriesChartInstance.update();
    
    // Update spending metrics
    updateSpendingMetrics();
}

// Spending Metrics Calculations
function getMonthTotals(year, month) {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getFullYear() !== year || txDate.getMonth() !== month) return;
        
        const amount = parseFloat(t.amount);
        if (t.type === 'Income') {
            income += amount;
        } else {
            expenses += amount;
        }
    });
    
    return { income, expenses, savings: income - expenses };
}

function updateSpendingMetrics() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const dayOfMonth = now.getDate();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get current month totals
    const currentTotals = getMonthTotals(currentYear, currentMonth);
    
    // 1. Average Daily Spending
    const avgDaily = dayOfMonth > 0 ? currentTotals.expenses / dayOfMonth : 0;
    document.getElementById('avgDailySpending').textContent = formatCurrency(avgDaily);
    document.getElementById('avgDailySubtitle').textContent = `${dayOfMonth} days in ${shortMonthNames[currentMonth]}`;
    
    // 2. Month Comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastTotals = getMonthTotals(lastMonthYear, lastMonth);
    
    const comparisonValueEl = document.getElementById('monthComparisonValue');
    const comparisonChangeEl = document.getElementById('monthComparisonChange');
    const comparisonSubtitleEl = document.getElementById('monthComparisonSubtitle');
    
    comparisonValueEl.textContent = formatCurrency(currentTotals.expenses);
    
    if (lastTotals.expenses > 0) {
        const diff = currentTotals.expenses - lastTotals.expenses;
        const percentChange = (diff / lastTotals.expenses) * 100;
        
        if (diff > 0) {
            comparisonChangeEl.textContent = `↑ ${Math.abs(percentChange).toFixed(0)}%`;
            comparisonChangeEl.className = 'metric-change increase';
        } else if (diff < 0) {
            comparisonChangeEl.textContent = `↓ ${Math.abs(percentChange).toFixed(0)}%`;
            comparisonChangeEl.className = 'metric-change decrease';
        } else {
            comparisonChangeEl.textContent = '0%';
            comparisonChangeEl.className = 'metric-change neutral';
        }
        comparisonSubtitleEl.textContent = `vs ${formatCurrency(lastTotals.expenses)} in ${shortMonthNames[lastMonth]}`;
    } else {
        comparisonChangeEl.textContent = '';
        comparisonChangeEl.className = 'metric-change';
        comparisonSubtitleEl.textContent = 'No data for last month';
    }
    
    // 3. Best Saving Month (last 6 months)
    const bestSavingEl = document.getElementById('bestSavingMonth');
    const bestSavingSubtitleEl = document.getElementById('bestSavingSubtitle');
    
    let bestMonth = null;
    let bestSavings = -Infinity;
    let monthsWithData = 0;
    
    for (let i = 0; i < 6; i++) {
        let checkMonth = currentMonth - i;
        let checkYear = currentYear;
        
        if (checkMonth < 0) {
            checkMonth += 12;
            checkYear -= 1;
        }
        
        const totals = getMonthTotals(checkYear, checkMonth);
        if (totals.income > 0 || totals.expenses > 0) {
            monthsWithData++;
            if (totals.savings > bestSavings) {
                bestSavings = totals.savings;
                bestMonth = { month: checkMonth, year: checkYear, savings: totals.savings };
            }
        }
    }
    
    if (bestMonth && monthsWithData > 0) {
        const symbol = currencySymbols[settings.currency] || '$';
        bestSavingEl.textContent = `${symbol}${bestMonth.savings.toFixed(0)}`;
        bestSavingSubtitleEl.textContent = `${monthNames[bestMonth.month]} ${bestMonth.year}`;
    } else {
        bestSavingEl.textContent = '—';
        bestSavingSubtitleEl.textContent = 'No data available';
    }
    
    // 4. Spending Trend (3-month moving average)
    const trendEl = document.getElementById('spendingTrend');
    const trendSubtitleEl = document.getElementById('trendSubtitle');
    
    const monthlyExpenses = [];
    for (let i = 0; i < 3; i++) {
        let checkMonth = currentMonth - i;
        let checkYear = currentYear;
        
        if (checkMonth < 0) {
            checkMonth += 12;
            checkYear -= 1;
        }
        
        const totals = getMonthTotals(checkYear, checkMonth);
        monthlyExpenses.push(totals.expenses);
    }
    
    // Need at least 2 months to determine trend
    if (monthlyExpenses.filter(e => e > 0).length >= 2) {
        const recent = monthlyExpenses[0];
        const older = monthlyExpenses[1];
        
        if (recent > older) {
            trendEl.innerHTML = '<span class="trend-arrow">↑</span> Increasing';
            trendEl.className = 'metric-value trend-up';
        } else if (recent < older) {
            trendEl.innerHTML = '<span class="trend-arrow">↓</span> Decreasing';
            trendEl.className = 'metric-value trend-down';
        } else {
            trendEl.textContent = 'Stable';
            trendEl.className = 'metric-value';
        }
        trendSubtitleEl.textContent = '3-month comparison';
    } else {
        trendEl.textContent = '—';
        trendEl.className = 'metric-value';
        trendSubtitleEl.textContent = 'Need more data';
    }
}

// UI Rendering
function renderList() {
    const list = document.getElementById('transactionList');
    const status = document.getElementById('status');
    const filtered = getFilteredTransactions();
    
    status.textContent = `Showing ${filtered.length} of ${transactions.length} transactions`;
    
    list.innerHTML = '';
    filtered.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        const recurringBadge = t.isRecurring ? `<span class="recurring-badge" title="Recurring ${t.frequency}">🔄 ${t.frequency}</span>` : '';
        item.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-desc">${t.desc}${recurringBadge}</span>
                <span class="transaction-meta">${t.category} • ${formatDisplayDate(t.date)}</span>
            </div>
            <div class="transaction-amount ${t.type.toLowerCase()}">
                ${t.type === 'Income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
            <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

// Transaction Modal Functions
function setupTransactionModal() {
    document.getElementById('addTransactionBtn').addEventListener('click', openTransactionModal);
    document.getElementById('cancelTransaction').addEventListener('click', closeTransactionModal);
    document.getElementById('transactionForm').addEventListener('submit', saveTransaction);
    
    document.getElementById('transactionModal').addEventListener('click', (e) => {
        if (e.target.id === 'transactionModal') closeTransactionModal();
    });
    
    // Recurring checkbox toggle
    document.getElementById('isRecurring').addEventListener('change', (e) => {
        const recurringOptions = document.getElementById('recurringOptions');
        if (e.target.checked) {
            recurringOptions.classList.remove('hidden');
            updateNextOccurrence();
        } else {
            recurringOptions.classList.add('hidden');
        }
    });
    
    // Update next occurrence when frequency or date changes
    document.getElementById('recurringFrequency').addEventListener('change', updateNextOccurrence);
    document.getElementById('date').addEventListener('change', updateNextOccurrence);
}

function openTransactionModal() {
    document.getElementById('transactionModalTitle').textContent = 'Add Transaction';
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionError').textContent = '';
    document.getElementById('recurringOptions').classList.add('hidden');
    document.getElementById('nextOccurrence').textContent = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    document.getElementById('transactionModal').classList.add('active');
}

function closeTransactionModal() {
    document.getElementById('transactionModal').classList.remove('active');
}

function calculateNextOccurrence(startDate, frequency) {
    const date = new Date(startDate);
    
    switch (frequency) {
        case 'Weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'Monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'Yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

function updateNextOccurrence() {
    const dateInput = document.getElementById('date').value;
    const frequency = document.getElementById('recurringFrequency').value;
    const nextOccurrenceEl = document.getElementById('nextOccurrence');
    
    if (!dateInput) {
        nextOccurrenceEl.textContent = '';
        return;
    }
    
    const nextDate = calculateNextOccurrence(dateInput, frequency);
    const formatted = formatDisplayDateLong(nextDate);
    
    nextOccurrenceEl.innerHTML = `Next occurrence: <strong>${formatted}</strong>`;
}

function saveRecurringTemplate(transaction, frequency) {
    const template = {
        id: Date.now(),
        desc: transaction.desc,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        frequency: frequency,
        lastOccurrence: transaction.date,
        nextOccurrence: calculateNextOccurrence(transaction.date, frequency),
        createdAt: new Date().toISOString()
    };
    
    recurringTemplates.push(template);
    localStorage.setItem('recurringTemplates', JSON.stringify(recurringTemplates));
    
    return template;
}

// AC: Verify in browser: add transaction, both charts update without refresh
function saveTransaction(e) {
    e.preventDefault();
    
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value.trim();
    const date = document.getElementById('date').value;
    const isRecurring = document.getElementById('isRecurring').checked;
    const frequency = document.getElementById('recurringFrequency').value;
    const errorEl = document.getElementById('transactionError');
    
    if (!desc) {
        errorEl.textContent = 'Please enter a description.';
        return;
    }
    
    if (!category) {
        errorEl.textContent = 'Please enter a category.';
        return;
    }

    const txId = Date.now();
    const newTx = {
        id: txId,
        desc,
        amount,
        type,
        category,
        date,
        isRecurring: isRecurring,
        frequency: isRecurring ? frequency : null
    };
    
    // Save recurring template if marked as recurring
    if (isRecurring) {
        const template = saveRecurringTemplate(newTx, frequency);
        newTx.templateId = template.id;
    }

    transactions.push(newTx);
    
    populateCategoryFilter();
    renderList();
    updateCharts();
    renderBudgetList();
    updateTopCategoriesChart();
    closeTransactionModal();
}

// AC: Verify in browser: delete transaction, both charts update
window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    renderList();
    updateCharts(); // Trigger update
    renderBudgetList(); // Update budget progress
    updateTopCategoriesChart(); // Update statistics
};

// Recurring Templates Functions
function setupRecurringTemplates() {
    // Toggle recurring list visibility
    document.getElementById('toggleRecurringList').addEventListener('click', () => {
        const list = document.getElementById('recurringTemplateList');
        const btn = document.getElementById('toggleRecurringList');
        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden');
            btn.textContent = 'Hide';
            renderRecurringTemplateList();
        } else {
            list.classList.add('hidden');
            btn.textContent = 'Show';
        }
    });
    
    // Edit recurring modal handlers
    document.getElementById('cancelEditRecurring').addEventListener('click', closeEditRecurringModal);
    document.getElementById('editRecurringForm').addEventListener('submit', saveEditRecurring);
    document.getElementById('editRecurringModal').addEventListener('click', (e) => {
        if (e.target.id === 'editRecurringModal') closeEditRecurringModal();
    });
    
    // Delete recurring modal handlers
    document.getElementById('cancelDeleteRecurring').addEventListener('click', closeDeleteRecurringModal);
    document.getElementById('deleteTemplateOnly').addEventListener('click', () => deleteRecurringTemplate(false));
    document.getElementById('deleteTemplateAndTransactions').addEventListener('click', () => deleteRecurringTemplate(true));
    document.getElementById('deleteRecurringModal').addEventListener('click', (e) => {
        if (e.target.id === 'deleteRecurringModal') closeDeleteRecurringModal();
    });
}

// Process recurring transactions on app load
function processRecurringTransactions() {
    const today = new Date().toISOString().split('T')[0];
    let hasNewTransactions = false;
    
    recurringTemplates.forEach(template => {
        // Generate all due transactions
        while (template.nextOccurrence <= today) {
            const newTx = {
                id: Date.now() + Math.random(),
                desc: template.desc,
                amount: template.amount,
                type: template.type,
                category: template.category,
                date: template.nextOccurrence,
                isRecurring: true,
                frequency: template.frequency,
                templateId: template.id
            };
            
            transactions.push(newTx);
            hasNewTransactions = true;
            
            // Update template for next occurrence
            template.lastOccurrence = template.nextOccurrence;
            template.nextOccurrence = calculateNextOccurrence(template.nextOccurrence, template.frequency);
        }
    });
    
    if (hasNewTransactions) {
        localStorage.setItem('recurringTemplates', JSON.stringify(recurringTemplates));
        populateCategoryFilter();
        renderList();
        updateCharts();
        renderBudgetList();
        updateTopCategoriesChart();
        
        // Show notification
        const status = document.getElementById('status');
        const originalText = status.textContent;
        status.textContent = 'Recurring transactions auto-generated!';
        status.style.color = '#28a745';
        setTimeout(() => {
            status.textContent = originalText;
            status.style.color = '';
        }, 3000);
    }
}

function renderRecurringTemplateList() {
    const list = document.getElementById('recurringTemplateList');
    
    if (recurringTemplates.length === 0) {
        list.innerHTML = '<div class="empty-state">No recurring templates. Create one when adding a transaction.</div>';
        return;
    }
    
    list.innerHTML = '';
    recurringTemplates.forEach(template => {
        const nextDate = formatDisplayDateLong(template.nextOccurrence);
        
        const item = document.createElement('div');
        item.className = 'recurring-template-item';
        item.innerHTML = `
            <div class="template-info">
                <div class="template-desc">
                    ${template.desc}
                    <span class="template-frequency">${template.frequency}</span>
                </div>
                <div class="template-meta">${template.category} • ${template.type}</div>
                <div class="template-next">Next: <strong>${nextDate}</strong></div>
            </div>
            <div class="template-amount ${template.type.toLowerCase()}">
                ${template.type === 'Income' ? '+' : '-'}${formatCurrency(template.amount)}
            </div>
            <div class="template-actions">
                <button class="edit-btn" onclick="openEditRecurringModal(${template.id})">Edit</button>
                <button class="delete-btn" onclick="openDeleteRecurringModal(${template.id})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function openEditRecurringModal(id) {
    const template = recurringTemplates.find(t => t.id === id);
    if (!template) return;
    
    document.getElementById('editRecurringId').value = id;
    document.getElementById('editRecurringDesc').value = template.desc;
    document.getElementById('editRecurringAmount').value = template.amount;
    document.getElementById('editRecurringType').value = template.type;
    document.getElementById('editRecurringCategory').value = template.category;
    document.getElementById('editRecurringFrequency').value = template.frequency;
    document.getElementById('editRecurringError').textContent = '';
    
    document.getElementById('editRecurringModal').classList.add('active');
}

function closeEditRecurringModal() {
    document.getElementById('editRecurringModal').classList.remove('active');
}

function saveEditRecurring(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editRecurringId').value);
    const desc = document.getElementById('editRecurringDesc').value.trim();
    const amount = parseFloat(document.getElementById('editRecurringAmount').value);
    const type = document.getElementById('editRecurringType').value;
    const category = document.getElementById('editRecurringCategory').value.trim();
    const frequency = document.getElementById('editRecurringFrequency').value;
    const errorEl = document.getElementById('editRecurringError');
    
    if (!desc || !category) {
        errorEl.textContent = 'Please fill in all fields.';
        return;
    }
    
    const templateIndex = recurringTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) return;
    
    const template = recurringTemplates[templateIndex];
    
    // Update template - changes apply to future instances only
    template.desc = desc;
    template.amount = amount;
    template.type = type;
    template.category = category;
    
    // If frequency changed, recalculate next occurrence
    if (template.frequency !== frequency) {
        template.frequency = frequency;
        template.nextOccurrence = calculateNextOccurrence(template.lastOccurrence, frequency);
    }
    
    localStorage.setItem('recurringTemplates', JSON.stringify(recurringTemplates));
    renderRecurringTemplateList();
    closeEditRecurringModal();
}

function openDeleteRecurringModal(id) {
    document.getElementById('deleteRecurringId').value = id;
    document.getElementById('deleteRecurringModal').classList.add('active');
}

function closeDeleteRecurringModal() {
    document.getElementById('deleteRecurringModal').classList.remove('active');
}

function deleteRecurringTemplate(deleteTransactions) {
    const id = parseInt(document.getElementById('deleteRecurringId').value);
    
    // Remove template
    recurringTemplates = recurringTemplates.filter(t => t.id !== id);
    localStorage.setItem('recurringTemplates', JSON.stringify(recurringTemplates));
    
    // Optionally remove generated transactions
    if (deleteTransactions) {
        transactions = transactions.filter(t => t.templateId !== id);
        renderList();
        updateCharts();
        renderBudgetList();
        updateTopCategoriesChart();
    }
    
    renderRecurringTemplateList();
    closeDeleteRecurringModal();
}

// Expose functions to window for onclick handlers
window.openEditRecurringModal = openEditRecurringModal;
window.openDeleteRecurringModal = openDeleteRecurringModal;

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetView = tab.dataset.tab;
            
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(targetView + 'View').classList.add('active');
        });
    });
}

// Budget Functions
function setupBudgetListeners() {
    document.getElementById('addBudgetBtn').addEventListener('click', openAddBudgetModal);
    document.getElementById('cancelBudget').addEventListener('click', closeBudgetModal);
    document.getElementById('budgetForm').addEventListener('submit', saveBudget);
    
    document.getElementById('budgetModal').addEventListener('click', (e) => {
        if (e.target.id === 'budgetModal') closeBudgetModal();
    });
}

function getExpenseCategories() {
    return [...new Set(transactions.filter(t => t.type === 'Expense').map(t => t.category))];
}

function populateBudgetCategoryDropdown(excludeCategory = null) {
    const select = document.getElementById('budgetCategory');
    select.innerHTML = '';
    
    const expenseCategories = getExpenseCategories();
    const usedCategories = budgets
        .filter(b => b.category !== excludeCategory)
        .map(b => b.category);
    
    const availableCategories = expenseCategories.filter(c => !usedCategories.includes(c));
    
    availableCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    
    return availableCategories.length > 0;
}

function openAddBudgetModal() {
    editingBudgetId = null;
    document.getElementById('budgetModalTitle').textContent = 'Add Budget';
    document.getElementById('budgetForm').reset();
    document.getElementById('budgetError').textContent = '';
    
    if (!populateBudgetCategoryDropdown()) {
        document.getElementById('budgetError').textContent = 'All expense categories already have budgets.';
    }
    
    document.getElementById('budgetModal').classList.add('active');
}

function openEditBudgetModal(id) {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;
    
    editingBudgetId = id;
    document.getElementById('budgetModalTitle').textContent = 'Edit Budget';
    document.getElementById('budgetError').textContent = '';
    
    populateBudgetCategoryDropdown(budget.category);
    
    const select = document.getElementById('budgetCategory');
    const option = document.createElement('option');
    option.value = budget.category;
    option.textContent = budget.category;
    option.selected = true;
    select.insertBefore(option, select.firstChild);
    
    document.getElementById('budgetLimit').value = budget.limit;
    document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
    editingBudgetId = null;
}

function saveBudget(e) {
    e.preventDefault();
    
    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);
    const errorEl = document.getElementById('budgetError');
    
    if (!category) {
        errorEl.textContent = 'Please select a category.';
        return;
    }
    
    const duplicate = budgets.find(b => b.category === category && b.id !== editingBudgetId);
    if (duplicate) {
        errorEl.textContent = 'A budget for this category already exists.';
        return;
    }
    
    if (editingBudgetId) {
        const index = budgets.findIndex(b => b.id === editingBudgetId);
        budgets[index] = { id: editingBudgetId, category, limit };
    } else {
        budgets.push({ id: Date.now(), category, limit });
    }
    
    saveBudgetsToStorage();
    renderBudgetList();
    closeBudgetModal();
}

function deleteBudget(id) {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    budgets = budgets.filter(b => b.id !== id);
    saveBudgetsToStorage();
    renderBudgetList();
}

function saveBudgetsToStorage() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

function getCurrentMonthSpent(category) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return transactions
        .filter(t => {
            if (t.type !== 'Expense' || t.category !== category) return false;
            const txDate = new Date(t.date);
            return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

function getProgressColor(percentage) {
    if (percentage >= 100) return 'red';
    if (percentage >= 80) return 'yellow';
    return 'green';
}

function getStatusBadge(percentage) {
    if (percentage >= 100) {
        return '<span class="budget-status-badge alert"><span class="badge-icon">🔴</span> Over Budget</span>';
    } else if (percentage >= 80) {
        return '<span class="budget-status-badge warning"><span class="badge-icon">🟡</span> Near Limit</span>';
    }
    return '';
}

function updateAlertSummary() {
    const summaryEl = document.getElementById('budgetAlertSummary');
    const textEl = document.getElementById('alertSummaryText');
    
    let overBudgetCount = 0;
    let warningCount = 0;
    
    budgets.forEach(b => {
        const spent = getCurrentMonthSpent(b.category);
        const percentage = (spent / b.limit) * 100;
        if (percentage >= 100) {
            overBudgetCount++;
        } else if (percentage >= 80) {
            warningCount++;
        }
    });
    
    if (overBudgetCount > 0) {
        summaryEl.classList.remove('hidden', 'warning-only');
        const categoryWord = overBudgetCount === 1 ? 'category' : 'categories';
        textEl.textContent = `${overBudgetCount} ${categoryWord} over budget`;
    } else if (warningCount > 0) {
        summaryEl.classList.remove('hidden');
        summaryEl.classList.add('warning-only');
        const categoryWord = warningCount === 1 ? 'category' : 'categories';
        textEl.textContent = `${warningCount} ${categoryWord} approaching limit`;
    } else {
        summaryEl.classList.add('hidden');
    }
}

function renderBudgetList() {
    const list = document.getElementById('budgetList');
    
    if (budgets.length === 0) {
        list.innerHTML = '<div class="empty-state">No budgets set. Click "Add Budget" to create one.</div>';
        updateAlertSummary();
        return;
    }
    
    list.innerHTML = '';
    budgets.forEach(b => {
        const spent = getCurrentMonthSpent(b.category);
        const percentage = (spent / b.limit) * 100;
        const displayPercentage = Math.min(percentage, 100);
        const colorClass = getProgressColor(percentage);
        const statusBadge = getStatusBadge(percentage);
        
        const item = document.createElement('div');
        item.className = 'budget-item';
        item.innerHTML = `
            <div class="budget-info">
                <div class="budget-header">
                    <span class="budget-category">${b.category}${statusBadge}</span>
                    <span class="budget-amount">${formatCurrency(b.limit)} / month</span>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${colorClass}" style="width: ${displayPercentage}%"></div>
                    </div>
                </div>
                <div class="budget-spent-text">${formatCurrency(spent)} of ${formatCurrency(b.limit)} spent (${Math.round(percentage)}%)</div>
            </div>
            <div class="budget-actions">
                <button class="edit-btn" onclick="openEditBudgetModal(${b.id})">Edit</button>
                <button class="delete-btn" onclick="deleteBudget(${b.id})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
    
    updateAlertSummary();
}

window.openEditBudgetModal = openEditBudgetModal;
window.deleteBudget = deleteBudget;

// Goal Functions
function setupGoalListeners() {
    document.getElementById('addGoalBtn').addEventListener('click', openAddGoalModal);
    document.getElementById('cancelGoal').addEventListener('click', closeGoalModal);
    document.getElementById('goalForm').addEventListener('submit', saveGoal);
    
    document.getElementById('goalModal').addEventListener('click', (e) => {
        if (e.target.id === 'goalModal') closeGoalModal();
    });
    
    document.getElementById('cancelContribution').addEventListener('click', closeContributionModal);
    document.getElementById('contributionForm').addEventListener('submit', saveContribution);
    
    document.getElementById('contributionModal').addEventListener('click', (e) => {
        if (e.target.id === 'contributionModal') closeContributionModal();
    });
    
    document.getElementById('closeCelebration').addEventListener('click', closeCelebration);
    document.getElementById('celebrationModal').addEventListener('click', (e) => {
        if (e.target.id === 'celebrationModal') closeCelebration();
    });
}

function openAddGoalModal() {
    editingGoalId = null;
    document.getElementById('goalModalTitle').textContent = 'Add Goal';
    document.getElementById('goalForm').reset();
    document.getElementById('goalCurrent').value = '0';
    document.getElementById('goalError').textContent = '';
    document.getElementById('goalModal').classList.add('active');
}

function openEditGoalModal(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    editingGoalId = id;
    document.getElementById('goalModalTitle').textContent = 'Edit Goal';
    document.getElementById('goalError').textContent = '';
    
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalCategory').value = goal.category;
    document.getElementById('goalTarget').value = goal.target;
    document.getElementById('goalCurrent').value = goal.current;
    document.getElementById('goalDate').value = goal.targetDate;
    
    document.getElementById('goalModal').classList.add('active');
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
    editingGoalId = null;
}

function saveGoal(e) {
    e.preventDefault();
    
    const name = document.getElementById('goalName').value.trim();
    const category = document.getElementById('goalCategory').value;
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    const targetDate = document.getElementById('goalDate').value;
    const errorEl = document.getElementById('goalError');
    
    if (!name) {
        errorEl.textContent = 'Please enter a goal name.';
        return;
    }
    
    if (target <= 0) {
        errorEl.textContent = 'Target amount must be greater than 0.';
        return;
    }
    
    if (editingGoalId) {
        const index = goals.findIndex(g => g.id === editingGoalId);
        const existingGoal = goals[index];
        goals[index] = { 
            id: editingGoalId, 
            name, 
            category, 
            target, 
            current, 
            targetDate,
            createdAt: existingGoal.createdAt
        };
    } else {
        goals.push({ 
            id: Date.now(), 
            name, 
            category, 
            target, 
            current, 
            targetDate,
            createdAt: new Date().toISOString()
        });
    }
    
    saveGoalsToStorage();
    renderGoalList();
    closeGoalModal();
}

function deleteGoal(id) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    goals = goals.filter(g => g.id !== id);
    saveGoalsToStorage();
    renderGoalList();
}

function saveGoalsToStorage() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

function formatDate(dateString) {
    return formatDisplayDateLong(dateString);
}

function getDaysRemaining(targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getGoalPercentage(current, target) {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
}

function getGoalStatus(goal) {
    const percentage = getGoalPercentage(goal.current, goal.target);
    const daysRemaining = getDaysRemaining(goal.targetDate);
    
    if (percentage >= 100) {
        return { status: 'complete', label: '✓ Complete', class: 'complete' };
    }
    
    if (daysRemaining < 0) {
        return { status: 'overdue', label: 'Overdue', class: 'overdue' };
    }
    
    const startDate = new Date(goal.createdAt || Date.now());
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    
    const totalDuration = targetDate - startDate;
    const elapsed = today - startDate;
    
    if (totalDuration <= 0 || elapsed <= 0) {
        return { status: 'on-track', label: 'On Track', class: 'on-track' };
    }
    
    const expectedProgress = (elapsed / totalDuration) * 100;
    const actualProgress = percentage;
    const progressDiff = expectedProgress - actualProgress;
    
    if (progressDiff <= 0) {
        return { status: 'on-track', label: 'On Track', class: 'on-track' };
    } else if (progressDiff <= 10) {
        return { status: 'on-track', label: 'On Track', class: 'on-track' };
    } else if (progressDiff <= 30) {
        return { status: 'at-risk', label: 'At Risk', class: 'at-risk' };
    } else {
        return { status: 'behind', label: 'Behind', class: 'behind' };
    }
}

function getMonthsRemaining(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    
    const months = (target.getFullYear() - today.getFullYear()) * 12 + 
                   (target.getMonth() - today.getMonth());
    
    return Math.max(months, 0);
}

function getRequiredMonthlyContribution(goal) {
    const remaining = goal.target - goal.current;
    if (remaining <= 0) return 0;
    
    const monthsRemaining = getMonthsRemaining(goal.targetDate);
    if (monthsRemaining <= 0) {
        const daysRemaining = getDaysRemaining(goal.targetDate);
        if (daysRemaining > 0) {
            return remaining;
        }
        return null;
    }
    
    return remaining / monthsRemaining;
}

function openContributionModal(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    contributingGoalId = id;
    document.getElementById('contributionGoalName').value = goal.name;
    document.getElementById('contributionAmount').value = '';
    document.getElementById('contributionError').textContent = '';
    document.getElementById('contributionModal').classList.add('active');
}

function closeContributionModal() {
    document.getElementById('contributionModal').classList.remove('active');
    contributingGoalId = null;
}

function saveContribution(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('contributionAmount').value);
    const errorEl = document.getElementById('contributionError');
    
    if (!amount || amount <= 0) {
        errorEl.textContent = 'Please enter a valid amount.';
        return;
    }
    
    const goalIndex = goals.findIndex(g => g.id === contributingGoalId);
    if (goalIndex === -1) {
        errorEl.textContent = 'Goal not found.';
        return;
    }
    
    const goal = goals[goalIndex];
    const wasComplete = goal.current >= goal.target;
    
    goals[goalIndex].current += amount;
    
    const isNowComplete = goals[goalIndex].current >= goals[goalIndex].target;
    
    saveGoalsToStorage();
    renderGoalList();
    closeContributionModal();
    
    if (!wasComplete && isNowComplete) {
        triggerCelebration(goals[goalIndex].name);
    }
}

function triggerCelebration(goalName) {
    document.getElementById('celebrationGoalName').textContent = goalName;
    document.getElementById('celebrationModal').classList.add('active');
    createConfetti();
}

function closeCelebration() {
    document.getElementById('celebrationModal').classList.remove('active');
    document.getElementById('confettiContainer').innerHTML = '';
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
    const shapes = ['square', 'circle'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const size = Math.random() * 10 + 5;
        
        confetti.style.cssText = `
            left: ${left}%;
            top: -20px;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: ${shape === 'circle' ? '50%' : '0'};
            animation-delay: ${delay}s;
            animation-duration: ${2 + Math.random() * 2}s;
        `;
        
        container.appendChild(confetti);
    }
}

function renderGoalList() {
    const list = document.getElementById('goalList');
    
    if (goals.length === 0) {
        list.innerHTML = '<div class="empty-state">No savings goals set. Click "Add Goal" to create one.</div>';
        return;
    }
    
    list.innerHTML = '';
    goals.forEach(g => {
        const percentage = getGoalPercentage(g.current, g.target);
        const daysRemaining = getDaysRemaining(g.targetDate);
        const isComplete = percentage >= 100;
        const goalStatus = getGoalStatus(g);
        const monthlyRequired = getRequiredMonthlyContribution(g);
        
        let daysText;
        if (isComplete) {
            daysText = '<span class="days-remaining">✓ Goal reached!</span>';
        } else if (daysRemaining < 0) {
            daysText = `<span class="days-remaining overdue">${Math.abs(daysRemaining)} days overdue</span>`;
        } else if (daysRemaining === 0) {
            daysText = '<span class="days-remaining">Due today</span>';
        } else {
            daysText = `<span class="days-remaining">${daysRemaining} days remaining</span>`;
        }
        
        let monthlyText = '';
        if (!isComplete && monthlyRequired !== null && monthlyRequired > 0) {
            monthlyText = `<div class="goal-monthly-required">Required: ${formatCurrency(monthlyRequired)}/month to reach goal</div>`;
        } else if (!isComplete && daysRemaining < 0) {
            const remaining = g.target - g.current;
            monthlyText = `<div class="goal-monthly-required">${formatCurrency(remaining)} still needed</div>`;
        }
        
        const item = document.createElement('div');
        item.className = `goal-item${isComplete ? ' completed' : ''}`;
        item.innerHTML = `
            <div class="goal-info">
                <div class="goal-header">
                    <span class="goal-name">${isComplete ? '🎉 ' : ''}${g.name}<span class="goal-category-badge">${g.category}</span><span class="goal-status-badge ${goalStatus.class}">${goalStatus.label}</span></span>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${isComplete ? 'complete' : ''}" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="goal-amounts">
                    <span class="current">${formatCurrency(g.current)}</span>
                    <span class="target">of ${formatCurrency(g.target)}</span>
                    <span class="goal-percentage">(${Math.round(percentage)}%)</span>
                </div>
                <div class="goal-meta">
                    <span>Target: ${formatDate(g.targetDate)}</span>
                    ${daysText}
                </div>
                ${monthlyText}
            </div>
            <div class="goal-actions">
                <button class="contribute-btn" onclick="openContributionModal(${g.id})">Add Contribution</button>
                <button class="edit-btn" onclick="openEditGoalModal(${g.id})">Edit</button>
                <button class="delete-btn" onclick="deleteGoal(${g.id})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

window.openEditGoalModal = openEditGoalModal;
window.deleteGoal = deleteGoal;
window.openContributionModal = openContributionModal;

// CSV Export Functions
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportTransactions() {
    if (transactions.length === 0) {
        alert('No data to export');
        return;
    }
    
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Tags'];
    const rows = transactions.map(t => [
        escapeCSV(t.date),
        escapeCSV(t.type),
        escapeCSV(t.category),
        escapeCSV(t.amount),
        escapeCSV(t.desc),
        escapeCSV(t.tags || '')
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const filename = `transactions_${getFormattedDate()}.csv`;
    downloadCSV(csvContent, filename);
}

function exportBudgets() {
    if (budgets.length === 0) {
        alert('No data to export');
        return;
    }
    
    const headers = ['Category', 'Budget Limit', 'Spent', 'Remaining'];
    const rows = budgets.map(b => {
        const spent = getCurrentMonthSpent(b.category);
        const remaining = b.limit - spent;
        return [
            escapeCSV(b.category),
            escapeCSV(b.limit.toFixed(2)),
            escapeCSV(spent.toFixed(2)),
            escapeCSV(remaining.toFixed(2))
        ];
    });
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const filename = `budgets_${getFormattedDate()}.csv`;
    downloadCSV(csvContent, filename);
}

document.getElementById('exportTransactionsBtn').addEventListener('click', exportTransactions);
document.getElementById('exportBudgetsBtn').addEventListener('click', exportBudgets);

// CSV Import Functions
let parsedImportData = { headers: [], rows: [], validatedRows: [] };

function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
        throw new Error('CSV file is empty');
    }
    
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const row = [];
        let current = '';
        let inQuotes = false;
        const line = lines[i];
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const nextChar = line[j + 1];
            
            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    current += '"';
                    j++;
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        row.push(current.trim());
        
        if (inQuotes) {
            throw new Error(`Malformed CSV: unclosed quote at line ${i + 1}`);
        }
        
        result.push(row);
    }
    
    return result;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const parsed = parseCSV(text);
            
            if (parsed.length < 2) {
                throw new Error('CSV must have a header row and at least one data row');
            }
            
            parsedImportData.headers = parsed[0];
            parsedImportData.rows = parsed.slice(1);
            
            showImportPreview();
        } catch (error) {
            document.getElementById('importError').textContent = error.message;
            document.getElementById('importPreviewHeader').innerHTML = '';
            document.getElementById('importPreviewBody').innerHTML = '';
            document.getElementById('importInfo').textContent = '';
            document.getElementById('confirmImport').disabled = true;
            document.getElementById('importPreviewModal').classList.add('active');
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file');
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

function getColumnIndex(headers, ...possibleNames) {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
        if (index !== -1) return index;
    }
    return -1;
}

function validateImportRow(row, headers, rowIndex) {
    const errors = [];
    const warnings = [];
    
    const dateIdx = getColumnIndex(headers, 'date');
    const amountIdx = getColumnIndex(headers, 'amount');
    const categoryIdx = getColumnIndex(headers, 'category');
    const typeIdx = getColumnIndex(headers, 'type');
    const descIdx = getColumnIndex(headers, 'description', 'desc');
    
    const date = dateIdx >= 0 ? row[dateIdx]?.trim() : '';
    const amount = amountIdx >= 0 ? row[amountIdx]?.trim() : '';
    const category = categoryIdx >= 0 ? row[categoryIdx]?.trim() : '';
    const type = typeIdx >= 0 ? row[typeIdx]?.trim() : '';
    const desc = descIdx >= 0 ? row[descIdx]?.trim() : '';
    
    if (!date) {
        errors.push('Date is required');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) && isNaN(Date.parse(date))) {
        errors.push('Invalid date format');
    }
    
    if (!amount) {
        errors.push('Amount is required');
    } else if (isNaN(parseFloat(amount))) {
        errors.push('Invalid amount');
    }
    
    if (!category) {
        errors.push('Category is required');
    }
    
    const isDuplicate = transactions.some(t => {
        const tDate = t.date;
        const tAmount = parseFloat(t.amount);
        const tDesc = t.desc?.toLowerCase() || '';
        
        const rowDate = date;
        const rowAmount = parseFloat(amount) || 0;
        const rowDesc = desc?.toLowerCase() || '';
        
        return tDate === rowDate && tAmount === rowAmount && tDesc === rowDesc;
    });
    
    if (isDuplicate) {
        warnings.push('Possible duplicate');
    }
    
    return {
        row,
        rowIndex,
        date,
        amount: parseFloat(amount) || 0,
        category,
        type: type || 'Expense',
        desc,
        errors,
        warnings,
        isValid: errors.length === 0,
        isDuplicate
    };
}

function showImportPreview() {
    const headerRow = document.getElementById('importPreviewHeader');
    const bodyEl = document.getElementById('importPreviewBody');
    const infoEl = document.getElementById('importInfo');
    const errorEl = document.getElementById('importError');
    const summaryEl = document.getElementById('importValidationSummary');
    
    errorEl.textContent = '';
    
    parsedImportData.validatedRows = parsedImportData.rows.map((row, idx) => 
        validateImportRow(row, parsedImportData.headers, idx)
    );
    
    const validCount = parsedImportData.validatedRows.filter(r => r.isValid && !r.isDuplicate).length;
    const invalidCount = parsedImportData.validatedRows.filter(r => !r.isValid).length;
    const duplicateCount = parsedImportData.validatedRows.filter(r => r.isValid && r.isDuplicate).length;
    
    summaryEl.classList.remove('hidden', 'has-errors', 'has-warnings', 'all-valid');
    if (invalidCount > 0) {
        summaryEl.classList.add('has-errors');
        summaryEl.textContent = `${invalidCount} invalid row(s) will be skipped. ${duplicateCount > 0 ? `${duplicateCount} possible duplicate(s).` : ''}`;
    } else if (duplicateCount > 0) {
        summaryEl.classList.add('has-warnings');
        summaryEl.textContent = `${duplicateCount} possible duplicate(s) detected. They will still be imported.`;
    } else {
        summaryEl.classList.add('all-valid');
        summaryEl.textContent = `All ${validCount} row(s) are valid and ready to import.`;
    }
    
    headerRow.innerHTML = '<tr>' + 
        '<th>Status</th>' +
        parsedImportData.headers.map(h => `<th>${escapeHTML(h)}</th>`).join('') + 
        '</tr>';
    
    const previewRows = parsedImportData.validatedRows.slice(0, 10);
    bodyEl.innerHTML = previewRows.map(validated => {
        let rowClass = '';
        let statusHtml = '';
        
        if (!validated.isValid) {
            rowClass = 'invalid-row';
            statusHtml = `<span class="row-status error">${validated.errors.join(', ')}</span>`;
        } else if (validated.isDuplicate) {
            rowClass = 'duplicate-row';
            statusHtml = '<span class="row-status warning">Duplicate?</span>';
        } else {
            statusHtml = '<span class="row-status valid">Valid</span>';
        }
        
        return `<tr class="${rowClass}">
            <td>${statusHtml}</td>
            ${validated.row.map(cell => `<td>${escapeHTML(cell)}</td>`).join('')}
        </tr>`;
    }).join('');
    
    const totalRows = parsedImportData.rows.length;
    const showingRows = Math.min(10, totalRows);
    infoEl.textContent = `Showing ${showingRows} of ${totalRows} rows • ${validCount} valid, ${invalidCount} invalid, ${duplicateCount} duplicates`;
    
    document.getElementById('confirmImport').disabled = validCount === 0;
    document.getElementById('importPreviewModal').classList.add('active');
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function closeImportPreview() {
    document.getElementById('importPreviewModal').classList.remove('active');
    parsedImportData = { headers: [], rows: [], validatedRows: [] };
}

function confirmImport() {
    const validRows = parsedImportData.validatedRows.filter(r => r.isValid);
    
    if (validRows.length === 0) {
        alert('No valid transactions to import');
        return;
    }
    
    validRows.forEach(validated => {
        const newTransaction = {
            id: Date.now() + Math.random(),
            date: validated.date,
            amount: validated.amount,
            category: validated.category,
            type: validated.type,
            desc: validated.desc
        };
        transactions.push(newTransaction);
    });
    
    renderList();
    updateCharts();
    updateTopCategoriesChart();
    closeImportPreview();
    showImportSuccess(validRows.length);
}

function showImportSuccess(count) {
    const message = document.createElement('div');
    message.className = 'import-success';
    message.textContent = `✓ Imported ${count} transaction${count !== 1 ? 's' : ''}`;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

document.getElementById('importTransactionsInput').addEventListener('change', handleFileSelect);
document.getElementById('cancelImport').addEventListener('click', closeImportPreview);
document.getElementById('confirmImport').addEventListener('click', confirmImport);
document.getElementById('importPreviewModal').addEventListener('click', (e) => {
    if (e.target.id === 'importPreviewModal') closeImportPreview();
});

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    updateChartTheme(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function updateChartTheme(theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#e4e4e7' : '#333333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const legendColor = isDark ? '#a1a1aa' : '#666666';
    
    const chartOptions = {
        scales: {
            x: {
                ticks: { color: textColor },
                grid: { color: gridColor }
            },
            y: {
                ticks: { color: textColor },
                grid: { color: gridColor }
            }
        },
        plugins: {
            legend: {
                labels: { color: legendColor }
            }
        }
    };
    
    if (timelineChartInstance) {
        timelineChartInstance.options.scales = chartOptions.scales;
        timelineChartInstance.options.plugins = {
            ...timelineChartInstance.options.plugins,
            ...chartOptions.plugins
        };
        timelineChartInstance.update();
    }
    
    if (categoryChartInstance) {
        categoryChartInstance.options.plugins = {
            ...categoryChartInstance.options.plugins,
            legend: {
                labels: { color: legendColor }
            }
        };
        categoryChartInstance.update();
    }
    
    if (topCategoriesChartInstance) {
        topCategoriesChartInstance.options.scales.x.ticks.color = legendColor;
        topCategoriesChartInstance.options.scales.x.grid.color = gridColor;
        topCategoriesChartInstance.options.scales.y.ticks.color = textColor;
        topCategoriesChartInstance.update();
    }
}

// Settings Panel
function setupSettingsPanel() {
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('cancelSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') closeSettingsModal();
    });
    
    // Live preview updates
    document.getElementById('currencySelect').addEventListener('change', updateSettingsPreview);
    document.getElementById('dateFormatSelect').addEventListener('change', updateSettingsPreview);
    
    // Reset data handlers
    document.getElementById('resetAllDataBtn').addEventListener('click', openResetConfirmModal);
    document.getElementById('cancelReset').addEventListener('click', closeResetConfirmModal);
    document.getElementById('confirmReset').addEventListener('click', executeReset);
    document.getElementById('resetConfirmInput').addEventListener('input', validateResetInput);
    
    document.getElementById('resetConfirmModal').addEventListener('click', (e) => {
        if (e.target.id === 'resetConfirmModal') closeResetConfirmModal();
    });
}

function openSettingsModal() {
    document.getElementById('currencySelect').value = settings.currency;
    document.getElementById('dateFormatSelect').value = settings.dateFormat;
    document.getElementById('weekStartSelect').value = settings.weekStart || 'Sunday';
    updateSettingsPreview();
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function updateSettingsPreview() {
    const currency = document.getElementById('currencySelect').value;
    const dateFormat = document.getElementById('dateFormatSelect').value;
    
    const symbol = currencySymbols[currency] || '$';
    document.getElementById('currencyPreview').textContent = `${symbol}1,234.56`;
    
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    if (dateFormat === 'DD/MM/YYYY') {
        document.getElementById('datePreview').textContent = `${day}/${month}/${year}`;
    } else {
        document.getElementById('datePreview').textContent = `${month}/${day}/${year}`;
    }
}

function saveSettings(e) {
    e.preventDefault();
    
    settings.currency = document.getElementById('currencySelect').value;
    settings.dateFormat = document.getElementById('dateFormatSelect').value;
    settings.weekStart = document.getElementById('weekStartSelect').value;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Refresh all displays
    refreshAllDisplays();
    closeSettingsModal();
}

function refreshAllDisplays() {
    renderList();
    renderBudgetList();
    renderGoalList();
    renderRecurringTemplateList();
    updateSpendingMetrics();
    updateCharts();
}

// Reset Data Functions
function openResetConfirmModal() {
    document.getElementById('resetConfirmInput').value = '';
    document.getElementById('resetConfirmInput').classList.remove('valid');
    document.getElementById('confirmReset').disabled = true;
    document.getElementById('resetError').textContent = '';
    document.getElementById('resetConfirmModal').classList.add('active');
    
    // Focus the input
    setTimeout(() => {
        document.getElementById('resetConfirmInput').focus();
    }, 100);
}

function closeResetConfirmModal() {
    document.getElementById('resetConfirmModal').classList.remove('active');
}

function validateResetInput() {
    const input = document.getElementById('resetConfirmInput');
    const confirmBtn = document.getElementById('confirmReset');
    const value = input.value.trim().toUpperCase();
    
    if (value === 'RESET') {
        input.classList.add('valid');
        confirmBtn.disabled = false;
        document.getElementById('resetError').textContent = '';
    } else {
        input.classList.remove('valid');
        confirmBtn.disabled = true;
    }
}

function executeReset() {
    const input = document.getElementById('resetConfirmInput');
    const value = input.value.trim().toUpperCase();
    
    if (value !== 'RESET') {
        document.getElementById('resetError').textContent = 'Please type RESET to confirm.';
        return;
    }
    
    // Clear all localStorage data
    localStorage.removeItem('budgets');
    localStorage.removeItem('goals');
    localStorage.removeItem('recurringTemplates');
    localStorage.removeItem('settings');
    localStorage.removeItem('theme');
    
    // Reload the app
    window.location.reload();
}
