
let transactions = JSON.parse(localStorage.getItem('pro_ledger_data')) || [];
let myChart = null;

const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
    expense: ['Food', 'Rent', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Health']
};

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    document.getElementById('date').valueAsDate = new Date();
});

function openModal(type) {
    const modal = document.getElementById('transactionModal');
    const typeInput = document.getElementById('transType');
    const catSelect = document.getElementById('category');
    const submitBtn = document.getElementById('submitBtn');
    const title = document.getElementById('modalTitle');

    typeInput.value = type;
    modal.style.display = 'flex';

    catSelect.innerHTML = categories[type].map(c => `<option value="${c}">${c}</option>`).join('');

    if (type === 'income') {
        submitBtn.style.backgroundColor = 'var(--success)';
        title.innerText = 'Add Income';
    } else {
        submitBtn.style.backgroundColor = 'var(--danger)';
        title.innerText = 'Add Expense';
    }
}

function closeModal() {
    document.getElementById('transactionModal').style.display = 'none';
    document.getElementById('transactionForm').reset();
}

document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const newTrans = {
        id: Date.now(),
        type: document.getElementById('transType').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    transactions.unshift(newTrans);
    saveData();
    updateUI();
    closeModal();
});

function updateUI() {
    renderTable();
    calculateTotals();
    renderChart();
}

function calculateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    document.getElementById('mainBalance').innerText = formatCurrency(balance);
    document.getElementById('totalIncome').innerText = formatCurrency(income);
    document.getElementById('totalExpense').innerText = formatCurrency(expenses);
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');

    if (transactions.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = transactions.map(t => `
                <tr>
                    <td style="color: var(--text-muted); font-size: 0.8rem;">${formatDate(t.date)}</td>
                    <td style="font-weight: 500;">${t.description}</td>
                    <td><span style="background: var(--background); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${t.category}</span></td>
                    <td style="text-align: right" class="${t.type === 'income' ? 'amt-income' : 'amt-expense'}">
                        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                    </td>
                </tr>
            `).join('');
}

function renderChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    const expenseData = transactions.filter(t => t.type === 'expense');
    const groups = {};
    expenseData.forEach(t => {
        groups[t.category] = (groups[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(groups);
    const data = Object.values(groups);

    if (myChart) myChart.destroy();

    if (labels.length === 0) {
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{ data: [1], backgroundColor: ['#e2e8f0'] }]
            },
            options: { cutout: '80%', plugins: { legend: { display: false } } }
        });
        return;
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20 }
                }
            }
        }
    });
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
}

function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

function saveData() {
    localStorage.setItem('pro_ledger_data', JSON.stringify(transactions));
}

function clearAll() {
    if (confirm('Are you sure you want to delete all records?')) {
        transactions = [];
        saveData();
        updateUI();
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('transactionModal');
    if (event.target == modal) closeModal();
}