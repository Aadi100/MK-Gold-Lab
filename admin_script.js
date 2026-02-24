document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return;
    }

    const currentUser = JSON.parse(userStr);
    document.getElementById("current-username").textContent = currentUser.username;
    
    if (currentUser.role === "admin") {
        const userSection = document.getElementById("user-management-section");
        if (userSection) userSection.classList.remove("hidden");
        loadUsers();
    }

    const barForm = document.getElementById("bar-form");
    const productForm = document.getElementById("product-form");
    const userForm = document.getElementById("user-form");
    const barsList = document.getElementById("bars-list");
    const productsList = document.getElementById("products-list");
    const usersList = document.getElementById("users-list");
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }

    const getHeaders = (isJson = true) => {
        const h = { "Authorization": `Bearer ${token}` };
        if (isJson) h["Content-Type"] = "application/json";
        return h;
    };

    window.openModal = (id) => {
        document.getElementById(id).classList.add('active');
    };

    window.closeModal = (id) => {
        document.getElementById(id).classList.remove('active');
        const form = document.getElementById(id).querySelector('form');
        if (form) form.reset();
        if (form.querySelector('[name="id"]')) form.querySelector('[name="id"]').value = "";
    };

    // Load Data
    async function loadBars() {
        try {
            const res = await fetch("/api/bars.php");
            if (res.ok) {
                const data = await res.json();
                renderBars(data.items || []);
            }
        } catch (error) { console.error("Failed to load bars:", error); }
    }

    async function loadProducts() {
        try {
            const res = await fetch("/api/products.php");
            if (res.ok) {
                const data = await res.json();
                renderProducts(data);
            }
        } catch (error) { console.error("Failed to load products:", error); }
    }

    async function loadUsers() {
        try {
            const res = await fetch("/api/auth/users.php", { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                renderUsers(data);
            }
        } catch (error) { console.error("Failed to load users:", error); }
    }

    // Render Data
    function renderBars(items) {
        if (!barsList) return;
        barsList.innerHTML = items.map(item => `
            <tr>
                <td>${item.serialNo}</td>
                <td>${item.weight || "—"}</td>
                <td>${item.purity || "—"}</td>
                <td>${item.certifiedBy || "—"}</td>
                <td>${item.origin || "—"}</td>
                <td>${new Date(item.production).toLocaleDateString() || "—"}</td>
                <td>
                    <button onclick="editBar('${item.serialNo}')" class="edit-btn uppercase tracking-widest font-bold">Edit</button>
                    <button onclick="deleteBar('${item.serialNo}')" class="delete-btn uppercase tracking-widest font-bold">Delete</button>
                </td>
            </tr>
        `).join("") || '<tr><td colspan="7" class="text-center italic py-10 opacity-40">No records found.</td></tr>';
    }

    function renderProducts(items) {
        if (!productsList) return;
        productsList.innerHTML = items.map(item => `
            <tr>
                <td class="gold-text font-medium">${item.title}</td>
                <td>${item.weight}</td>
                <td>${item.price}</td>
                <td class="text-[0.6rem] opacity-30 select-all">${item.img}</td>
                <td>
                    <button onclick="editProduct('${item.id}')" class="edit-btn uppercase tracking-widest font-bold">Edit</button>
                    <button onclick="deleteProduct('${item.id}')" class="delete-btn uppercase tracking-widest font-bold">Delete</button>
                </td>
            </tr>
        `).join("") || '<tr><td colspan="5" class="text-center italic py-10 opacity-40">No products found.</td></tr>';
    }

    function renderUsers(items) {
        if (!usersList) return;
        usersList.innerHTML = items.map(u => `
            <tr>
                <td class="gold-text font-medium">${u.username}</td>
                <td><span class="text-[0.6rem] uppercase bg-gold/10 text-gold px-2 py-1 rounded-sm border border-gold/20 tracking-tighter">${u.role}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                    ${u.username !== 'admin' ? `
                        <button onclick="deleteUser('${u.id}')" class="delete-btn uppercase tracking-widest font-bold">Remove</button>
                    ` : '<span class="text-[0.6rem] opacity-20 uppercase font-bold tracking-widest">Protected</span>'}
                </td>
            </tr>
        `).join("") || '<tr><td colspan="4" class="text-center italic py-10 opacity-40 uppercase tracking-widest text-xs">No staff found.</td></tr>';
    }

    // Forms
    barForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(barForm).entries());
        const res = await fetch("/api/bars.php", { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
        if (res.ok) { closeModal('bar-modal'); loadBars(); }
        else alert("Failed to save bar");
    };

    productForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(productForm);
        const res = await fetch("/api/products.php", { 
            method: "POST", 
            headers: getHeaders(false), // Pass false to not send JSON header
            body: formData 
        });
        if (res.ok) { closeModal('product-modal'); loadProducts(); }
        else alert("Failed to save product");
    };

    userForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(userForm).entries());
        const res = await fetch("/api/auth/users.php", { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
        if (res.ok) { closeModal('user-modal'); loadUsers(); }
        else alert("Failed to add user");
    };

    // Actions
    window.deleteBar = async (serial) => {
        if (!confirm(`Delete ${serial}?`)) return;
        const res = await fetch(`/api/bars.php?serial=${serial}`, { method: "DELETE", headers: getHeaders() });
        if (res.ok) loadBars();
    };

    window.editBar = async (serial) => {
        try {
            const res = await fetch(`/api/bars.php?serial=${serial}`);
            if (res.ok) {
                const json = await res.json();
                const data = json.data;
                // Format date for <input type="date">
                if (data.production) {
                    data.production = new Date(data.production).toISOString().split('T')[0];
                }
                for (const key in data) {
                    const el = barForm.querySelector(`[name="${key}"]`);
                    if (el) el.value = data[key];
                }
                openModal('bar-modal');
            }
        } catch (e) { console.error(e); }
    };

    window.deleteProduct = async (id) => {
        if (!confirm(`Delete product?`)) return;
        const res = await fetch(`/api/products.php?id=${id}`, { method: "DELETE", headers: getHeaders() });
        if (res.ok) loadProducts();
    };

    window.editProduct = async (id) => {
        // Find in current data
        const res = await fetch("/api/products.php");
        const items = await res.json();
        const item = items.find(i => i.id == id);
        if (item) {
            for (const key in item) {
                const el = productForm.querySelector(`[name="${key}"]:not([type="file"])`);
                if (el) el.value = item[key];
            }
            // Manually set existingImg hidden field
            if (productForm.querySelector('[name="existingImg"]')) {
                productForm.querySelector('[name="existingImg"]').value = item.img || "";
            }
            openModal('product-modal');
        }
    };

    window.deleteUser = async (id) => {
        if (!confirm(`Remove this user?`)) return;
        const res = await fetch(`/api/auth/users.php?id=${id}`, { method: "DELETE", headers: getHeaders() });
        if (res.ok) loadUsers();
        else alert("Failed to remove user");
    };

    loadBars();
    loadProducts();
    if (currentUser.role === "admin") {
        loadUsers();
    }
});
