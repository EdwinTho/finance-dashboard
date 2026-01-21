/**
 * Finance Dashboard Application
 * Main application module using ES6 module pattern
 */

import Storage from './storage.js';

const App = (() => {
    'use strict';

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const updateCurrentDate = () => {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = formatDate(new Date());
        }
    };

    const initNavigation = () => {
        const navTabs = document.querySelectorAll('.nav-tab');
        const views = document.querySelectorAll('.view');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetView = tab.dataset.view;

                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                views.forEach(view => {
                    if (view.id === `${targetView}-view`) {
                        view.classList.remove('hidden');
                        view.classList.add('active');
                    } else {
                        view.classList.add('hidden');
                        view.classList.remove('active');
                    }
                });
            });
        });
    };

    const initDarkMode = () => {
        const toggle = document.getElementById('darkModeToggle');
        const sunIcon = toggle?.querySelector('.icon-sun');
        const moonIcon = toggle?.querySelector('.icon-moon');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sunIcon?.classList.toggle('hidden');
                moonIcon?.classList.toggle('hidden');
            });
        }
    };

    const populateCategories = (type) => {
        const categorySelect = document.getElementById('transactionCategory');
        if (!categorySelect) return;

        const categories = type === 'income' ? Storage.INCOME_CATEGORIES : Storage.EXPENSE_CATEGORIES;
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    };

    const resetForm = () => {
        const form = document.getElementById('transactionForm');
        if (!form) return;

        form.reset();
        
        const expenseRadio = form.querySelector('input[name="type"][value="expense"]');
        if (expenseRadio) {
            expenseRadio.checked = true;
        }
        populateCategories('expense');

        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        clearFormErrors();
    };

    const clearFormErrors = () => {
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
    };

    const showError = (inputId, errorId, message) => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input) input.classList.add('error');
        if (error) error.textContent = message;
    };

    const validateForm = () => {
        clearFormErrors();
        let isValid = true;

        const amountInput = document.getElementById('transactionAmount');
        const amount = parseFloat(amountInput?.value);
        if (!amount || amount <= 0 || isNaN(amount)) {
            showError('transactionAmount', 'amountError', 'Please enter a positive amount');
            isValid = false;
        }

        const categorySelect = document.getElementById('transactionCategory');
        if (!categorySelect?.value) {
            showError('transactionCategory', 'categoryError', 'Please select a category');
            isValid = false;
        }

        return isValid;
    };

    const openModal = () => {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.classList.remove('hidden');
            resetForm();
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const form = e.target;
        const formData = new FormData(form);

        const transaction = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            date: formData.get('date'),
            description: formData.get('description') || '',
            tags: formData.get('tags') || ''
        };

        Storage.createTransaction(transaction);
        console.log('Transaction saved:', transaction);

        closeModal();
        renderTransactions();
    };

    const renderTransactions = () => {
        const transactions = Storage.getTransactions();
        const transactionList = document.getElementById('transactionList');
        const transactionCount = document.getElementById('transactionCount');
        const emptyState = document.getElementById('transactionEmptyState');

        if (!transactionList || !transactionCount) return;

        // Sort transactions by date, newest first
        const sortedTransactions = transactions.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // Update count
        transactionCount.textContent = `Showing ${sortedTransactions.length} transaction${sortedTransactions.length !== 1 ? 's' : ''}`;

        // Handle empty state
        if (sortedTransactions.length === 0) {
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            // Remove any existing transaction items
            const existingItems = transactionList.querySelectorAll('.transaction-item');
            existingItems.forEach(item => item.remove());
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.classList.add('hidden');
        }

        // Clear existing transaction items (but keep empty state div)
        const existingItems = transactionList.querySelectorAll('.transaction-item');
        existingItems.forEach(item => item.remove());

        // Render each transaction
        sortedTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.dataset.transactionId = transaction.id;

            const dateDiv = document.createElement('div');
            dateDiv.className = 'transaction-date';
            dateDiv.textContent = formatShortDate(transaction.date);

            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'transaction-description';
            descriptionDiv.textContent = transaction.description || transaction.category;
            descriptionDiv.title = transaction.description || transaction.category;

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'transaction-category';
            categoryDiv.textContent = transaction.category;

            const amountDiv = document.createElement('div');
            amountDiv.className = `transaction-amount ${transaction.type}`;
            const sign = transaction.type === 'income' ? '+' : '-';
            amountDiv.textContent = `${sign}${formatCurrency(transaction.amount)}`;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'transaction-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-icon btn-edit';
            editBtn.innerHTML = '✏️';
            editBtn.ariaLabel = 'Edit transaction';
            editBtn.title = 'Edit transaction';
            editBtn.addEventListener('click', () => editTransaction(transaction.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon btn-delete';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.ariaLabel = 'Delete transaction';
            deleteBtn.title = 'Delete transaction';
            deleteBtn.addEventListener('click', () => deleteTransaction(transaction.id));

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            item.appendChild(dateDiv);
            item.appendChild(descriptionDiv);
            item.appendChild(categoryDiv);
            item.appendChild(amountDiv);
            item.appendChild(actionsDiv);

            transactionList.appendChild(item);
        });
    };

    const initModal = () => {
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalOverlay = document.getElementById('transactionModal');
        const cancelBtn = document.getElementById('cancelTransactionBtn');
        const form = document.getElementById('transactionForm');
        const typeRadios = document.querySelectorAll('input[name="type"]');

        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', openModal);
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        typeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                populateCategories(e.target.value);
            });
        });

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    };

    const init = () => {
        console.log('Finance Dashboard initialized');
        updateCurrentDate();
        initNavigation();
        initDarkMode();
        initModal();

        // Load sample data if storage is empty
        if (Storage.loadSampleData()) {
            console.log('Sample data loaded');
        }

        // Load data from storage on init
        const transactions = Storage.getTransactions();
        const budgets = Storage.getBudgets();
        const goals = Storage.getGoals();
        console.log(`Loaded ${transactions.length} transactions, ${budgets.length} budgets, ${goals.length} goals`);

        // Render transactions
        renderTransactions();
    };

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        Storage
    };
})();

// Expose Storage to window for console testing
window.Storage = Storage;

export default App;
