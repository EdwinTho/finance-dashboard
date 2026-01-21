/**
 * Storage Module
 * Handles all data persistence using localStorage
 */

const Storage = (() => {
    'use strict';

    const KEYS = {
        TRANSACTIONS: 'finance_transactions',
        BUDGETS: 'finance_budgets',
        GOALS: 'finance_goals'
    };

    const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];

    const EXPENSE_CATEGORIES = [
        'Housing',
        'Food',
        'Transport',
        'Entertainment',
        'Healthcare',
        'Shopping',
        'Bills',
        'Other'
    ];

    const generateId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const getData = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error reading ${key} from localStorage:`, e);
            return [];
        }
    };

    const setData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error saving ${key} to localStorage:`, e);
            return false;
        }
    };

    // Transaction CRUD
    const getTransactions = () => getData(KEYS.TRANSACTIONS);

    const createTransaction = (transaction) => {
        const transactions = getTransactions();
        const newTransaction = {
            id: generateId(),
            ...transaction,
            createdAt: new Date().toISOString()
        };
        transactions.push(newTransaction);
        setData(KEYS.TRANSACTIONS, transactions);
        return newTransaction;
    };

    const updateTransaction = (id, updates) => {
        const transactions = getTransactions();
        const index = transactions.findIndex(t => t.id === id);
        if (index === -1) return null;
        
        transactions[index] = {
            ...transactions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        setData(KEYS.TRANSACTIONS, transactions);
        return transactions[index];
    };

    const deleteTransaction = (id) => {
        const transactions = getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        if (filtered.length === transactions.length) return false;
        
        setData(KEYS.TRANSACTIONS, filtered);
        return true;
    };

    // Budget CRUD
    const getBudgets = () => getData(KEYS.BUDGETS);

    const createBudget = (budget) => {
        const budgets = getBudgets();
        const newBudget = {
            id: generateId(),
            ...budget,
            createdAt: new Date().toISOString()
        };
        budgets.push(newBudget);
        setData(KEYS.BUDGETS, budgets);
        return newBudget;
    };

    const updateBudget = (id, updates) => {
        const budgets = getBudgets();
        const index = budgets.findIndex(b => b.id === id);
        if (index === -1) return null;
        
        budgets[index] = {
            ...budgets[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        setData(KEYS.BUDGETS, budgets);
        return budgets[index];
    };

    const deleteBudget = (id) => {
        const budgets = getBudgets();
        const filtered = budgets.filter(b => b.id !== id);
        if (filtered.length === budgets.length) return false;
        
        setData(KEYS.BUDGETS, filtered);
        return true;
    };

    // Goal CRUD
    const getGoals = () => getData(KEYS.GOALS);

    const createGoal = (goal) => {
        const goals = getGoals();
        const newGoal = {
            id: generateId(),
            ...goal,
            createdAt: new Date().toISOString()
        };
        goals.push(newGoal);
        setData(KEYS.GOALS, goals);
        return newGoal;
    };

    const updateGoal = (id, updates) => {
        const goals = getGoals();
        const index = goals.findIndex(g => g.id === id);
        if (index === -1) return null;
        
        goals[index] = {
            ...goals[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        setData(KEYS.GOALS, goals);
        return goals[index];
    };

    const deleteGoal = (id) => {
        const goals = getGoals();
        const filtered = goals.filter(g => g.id !== id);
        if (filtered.length === goals.length) return false;
        
        setData(KEYS.GOALS, filtered);
        return true;
    };

    // Utility to check if data exists
    const hasData = () => {
        return getTransactions().length > 0 || 
               getBudgets().length > 0 || 
               getGoals().length > 0;
    };

    // Clear all data
    const clearAll = () => {
        localStorage.removeItem(KEYS.TRANSACTIONS);
        localStorage.removeItem(KEYS.BUDGETS);
        localStorage.removeItem(KEYS.GOALS);
    };

    // Load sample data if localStorage is empty
    const loadSampleData = () => {
        if (hasData()) {
            return false;
        }

        const now = new Date();
        const transactions = [];

        // Generate transactions spanning last 6 months
        for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
            
            // Add salary income for each month
            transactions.push({
                id: generateId(),
                type: 'income',
                category: 'Salary',
                amount: 5000,
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0],
                description: 'Monthly salary',
                tags: 'work,regular',
                createdAt: new Date().toISOString()
            });

            // Add freelance income every other month
            if (monthOffset % 2 === 0) {
                transactions.push({
                    id: generateId(),
                    type: 'income',
                    category: 'Freelance',
                    amount: 500 + Math.floor(Math.random() * 500),
                    date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString().split('T')[0],
                    description: 'Freelance project',
                    tags: 'freelance',
                    createdAt: new Date().toISOString()
                });
            }

            // Add various expenses for each month
            const expenseData = [
                { category: 'Housing', amount: 1500, description: 'Rent payment', day: 1 },
                { category: 'Food', amount: 300 + Math.floor(Math.random() * 200), description: 'Groceries', day: 5 },
                { category: 'Food', amount: 100 + Math.floor(Math.random() * 100), description: 'Dining out', day: 18 },
                { category: 'Transport', amount: 100 + Math.floor(Math.random() * 50), description: 'Gas and transit', day: 10 },
                { category: 'Bills', amount: 150, description: 'Utilities', day: 15 },
                { category: 'Entertainment', amount: 50 + Math.floor(Math.random() * 100), description: 'Streaming and games', day: 20 }
            ];

            // Add some variety - not all expenses every month
            const expensesToAdd = expenseData.filter((_, i) => monthOffset === 0 || i < 4 || Math.random() > 0.3);
            
            expensesToAdd.forEach(exp => {
                transactions.push({
                    id: generateId(),
                    type: 'expense',
                    category: exp.category,
                    amount: exp.amount,
                    date: new Date(monthDate.getFullYear(), monthDate.getMonth(), exp.day).toISOString().split('T')[0],
                    description: exp.description,
                    tags: exp.category.toLowerCase(),
                    createdAt: new Date().toISOString()
                });
            });
        }

        // Add some additional varied transactions
        transactions.push({
            id: generateId(),
            type: 'expense',
            category: 'Healthcare',
            amount: 250,
            date: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString().split('T')[0],
            description: 'Doctor visit',
            tags: 'medical',
            createdAt: new Date().toISOString()
        });

        transactions.push({
            id: generateId(),
            type: 'expense',
            category: 'Shopping',
            amount: 180,
            date: new Date(now.getFullYear(), now.getMonth() - 2, 22).toISOString().split('T')[0],
            description: 'New clothes',
            tags: 'clothing',
            createdAt: new Date().toISOString()
        });

        transactions.push({
            id: generateId(),
            type: 'income',
            category: 'Investment',
            amount: 120,
            date: new Date(now.getFullYear(), now.getMonth() - 3, 28).toISOString().split('T')[0],
            description: 'Dividend payment',
            tags: 'investment,passive',
            createdAt: new Date().toISOString()
        });

        setData(KEYS.TRANSACTIONS, transactions);

        // Generate 4 sample budgets
        const budgets = [
            { id: generateId(), category: 'Food', limit: 600, createdAt: new Date().toISOString() },
            { id: generateId(), category: 'Transport', limit: 200, createdAt: new Date().toISOString() },
            { id: generateId(), category: 'Entertainment', limit: 150, createdAt: new Date().toISOString() },
            { id: generateId(), category: 'Shopping', limit: 300, createdAt: new Date().toISOString() }
        ];
        setData(KEYS.BUDGETS, budgets);

        // Generate 3 sample savings goals
        const goals = [
            {
                id: generateId(),
                name: 'Emergency Fund',
                targetAmount: 10000,
                currentAmount: 3500,
                targetDate: new Date(now.getFullYear(), now.getMonth() + 12, 1).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Vacation',
                targetAmount: 3000,
                currentAmount: 800,
                targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'New Laptop',
                targetAmount: 2000,
                currentAmount: 1200,
                targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        ];
        setData(KEYS.GOALS, goals);

        return true;
    };

    return {
        INCOME_CATEGORIES,
        EXPENSE_CATEGORIES,
        getTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        getBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
        getGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        hasData,
        clearAll,
        loadSampleData
    };
})();

export default Storage;
