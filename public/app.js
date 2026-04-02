const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let user = null;
try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
        user = JSON.parse(storedUser);
    }
} catch (e) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    token = null;
}

const mainContent = document.getElementById('main-content');
const authState = document.getElementById('auth-state');

// Ensure token setup for authenticated requests
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

function init() {
    if (token) {
        renderDashboard();
        renderHeader();
    } else {
        renderLogin();
        renderHeader();
    }
}

// --------------------------------------------------------- //
// UI LAYOUT RENDERERS
// --------------------------------------------------------- //

function renderHeader() {
    if (user) {
        authState.innerHTML = `
            <span>Hello, ${user.name}</span>
            <button class="btn-small" onclick="logout()">Logout</button>
        `;
    } else {
        authState.innerHTML = ``;
    }
}

function renderLogin() {
    mainContent.innerHTML = `
        <div class="auth-container card">
            <h2>Welcome Back</h2>
            <form id="login-form">
                <input type="email" id="email" placeholder="Email" required />
                <input type="password" id="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <div class="toggle-auth" onclick="renderRegister()">Need an account? <span>Register</span></div>
        </div>
    `;
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await handleAuth('/auth/login', { email, password });
    });
}

function renderRegister() {
    mainContent.innerHTML = `
        <div class="auth-container card">
            <h2>Create Account</h2>
            <form id="register-form">
                <input type="text" id="name" placeholder="Name" required />
                <input type="email" id="email" placeholder="Email" required />
                <input type="password" id="password" placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
            <div class="toggle-auth" onclick="renderLogin()">Already have an account? <span>Login</span></div>
        </div>
    `;
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await handleAuth('/auth/register', { name, email, password });
    });
}

async function renderDashboard() {
    mainContent.innerHTML = `
        <div class="dashboard-metrics" id="metrics-container">
            <div class="metric-card"><div class="metric-title">Loading...</div></div>
            <div class="metric-card"><div class="metric-title">Loading...</div></div>
            <div class="metric-card"><div class="metric-title">Loading...</div></div>
        </div>

        <div class="card">
            <h3>Add New Record</h3>
            <form id="add-record-form" style="display:flex; gap:10px; flex-wrap:wrap;">
                <input type="number" id="amt" placeholder="Amount" step="0.01" style="width:150px" required />
                <select id="type" style="width:150px" required>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input type="text" id="cat" placeholder="Category" style="flex:1" required />
                <button type="submit" style="width:150px">Add</button>
            </form>
        </div>

        <div class="card">
            <h3>Recent Records</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody id="records-table">
                    <tr><td colspan="4">Loading records...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Fetch dashboard and records natively
    loadDashboardData();
    loadRecords();

    // Hook up form
    document.getElementById('add-record-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('amt').value;
        const type = document.getElementById('type').value;
        const category = document.getElementById('cat').value;

        try {
            const res = await fetch(`${API_URL}/records`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ amount, type, category })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Record added!');
                document.getElementById('add-record-form').reset();
                loadDashboardData();
                loadRecords();
            } else {
                showToast(data.error || 'Failed to add record');
            }
        } catch (error) {
            showToast('Server error');
        }
    });
}

// --------------------------------------------------------- //
// API ACTIONS
// --------------------------------------------------------- //

async function handleAuth(endpoint, bodyData) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        const data = await res.json();
        
        if (data.success) {
            token = data.data.token;
            user = data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            showToast('Welcome back!');
            init();
        } else {
            showToast(data.error || 'Authentication error');
        }
    } catch (err) {
        showToast('Failed to connect to server');
    }
}

async function loadDashboardData() {
    try {
        const res = await fetch(`${API_URL}/dashboard/summary`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) {
            const sum = data.data;
            document.getElementById('metrics-container').innerHTML = `
                <div class="metric-card">
                    <div class="metric-title">Total Income</div>
                    <div class="metric-value income">$ ${sum.totalIncome}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Total Expenses</div>
                    <div class="metric-value expense">$ ${sum.totalExpense}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Net Balance</div>
                    <div class="metric-value">$ ${sum.netBalance}</div>
                </div>
            `;
        }
    } catch(err) {
        console.log(err);
    }
}

async function loadRecords() {
    try {
        const res = await fetch(`${API_URL}/records?limit=10`, { headers: authHeaders() });
        const obj = await res.json();
        if (obj.success) {
            const table = document.getElementById('records-table');
            if(obj.data.length === 0) {
                table.innerHTML = `<tr><td colspan="4" style="text-align:center">No records found. Create one!</td></tr>`;
                return;
            }
            
            table.innerHTML = obj.data.map(rec => `
                <tr>
                    <td>${new Date(rec.date).toLocaleDateString()}</td>
                    <td style="text-transform:capitalize">${rec.type}</td>
                    <td>${rec.category}</td>
                    <td class="amount ${rec.type}">${rec.type === 'income'?'+':'-'}$ ${rec.amount}</td>
                </tr>
            `).join('');
        }
    } catch(err) {
       console.log(err);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    user = null;
    init();
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Bootstrap
init();
