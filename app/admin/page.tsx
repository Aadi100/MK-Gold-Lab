"use client"

import React, { useEffect, useState } from "react";
export default function Page() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // admin data
  const [items, setItems] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // modals and forms
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ serialNo: '', weight: '', purity: '', certifiedBy: '', origin: '', metal: 'Silver', production: '' });
  const [editingSerial, setEditingSerial] = useState<string | null>(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'admin' });
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ title: '', weight: '', price: '', img: '' });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // inactivity logout
  useEffect(() => {
    let timer: any;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fetch('/api/auth/logout', { method: 'POST' }).then(() => location.reload());
      }, 5 * 60 * 1000);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('touchstart', reset);
    reset();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setAuthenticated(true);
          await fetchItems();
          await fetchUsers();
          await fetchProducts();
        } else {
          setAuthenticated(false);
        }
      } catch (e) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data as any[]);
        else if (data?.products && Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      }
    } catch (e) { /* ignore */ }
  }

  async function fetchItems() {
    try {
      const res = await fetch('/api/bars');
      if (res.ok) {
        const data = await res.json();
        // API returns { items: [...] } — normalize to an array
        if (Array.isArray(data)) setItems(data as any[]);
        else if (data?.items && Array.isArray(data.items)) setItems(data.items);
        else setItems([]);
      }
    } catch (e) { /* ignore */ }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsersList(data as any[]);
        else if (data?.users && Array.isArray(data.users)) setUsersList(data.users);
        else setUsersList([]);
      }
    } catch (e) { /* ignore */ }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        setAuthenticated(true);
        await fetchItems();
        await fetchUsers();
      } else {
        const txt = await res.text();
        setMessage(txt || 'Login failed');
      }
    } catch (err) {
      setMessage('Network error');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setItems([]);
    setUsersList([]);
    setTimeout(() => location.reload(), 50);
  }

  async function addEntry(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      const method = editingSerial ? 'PUT' : 'POST';
      const url = editingSerial ? `/api/bars?serial=${encodeURIComponent(editingSerial)}` : '/api/bars';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        setEditingSerial(null);
        setForm({ serialNo: '', weight: '', purity: '', certifiedBy: '', origin: '', metal: 'Silver', production: '' });
        await fetchItems();
        alert('Saved');
      } else {
        alert('Save failed');
      }
    } catch (err) { alert('Network error'); }
  }

  async function deleteEntry(serial: string) {
    if (!confirm(`Delete ${serial}?`)) return;
    const res = await fetch(`/api/bars?serial=${encodeURIComponent(serial)}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchItems();
      alert('Deleted');
    } else alert('Delete failed');
  }

  async function createUser(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
      if (res.ok) {
        setShowUserModal(false);
        setUserForm({ username: '', password: '', role: 'admin' });
        await fetchUsers();
        alert('User saved');
      } else {
        const t = await res.text();
        alert(t || 'Failed');
      }
    } catch (err) { alert('Network error'); }
  }

  async function deleteUser(usernameToDelete: string) {
    if (!confirm(`Delete user ${usernameToDelete}?`)) return;
    const res = await fetch(`/api/auth/users?username=${encodeURIComponent(usernameToDelete)}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchUsers();
      alert('User deleted');
    } else alert('Delete failed');
  }

  async function saveProduct(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      const method = editingProductId ? 'PUT' : 'POST';
      const url = editingProductId ? '/api/products' : '/api/products';
      const formData = new FormData();
      formData.append('title', productForm.title);
      formData.append('weight', productForm.weight);
      formData.append('price', productForm.price);
      if (editingProductId) formData.append('_id', editingProductId);
      if (productForm.img) formData.append('existingImg', productForm.img);
      if (productImage) formData.append('image', productImage);

      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        setShowProductModal(false);
        setEditingProductId(null);
        setProductForm({ title: '', weight: '', price: '', img: '' });
        setProductImage(null);
        setProductImagePreview(null);
        await fetchProducts();
        alert('Product saved');
      } else {
        const t = await res.text();
        alert(t || 'Save failed');
      }
    } catch (err) { alert('Network error'); }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete product?')) return;
    const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchProducts();
      alert('Deleted');
    } else alert('Delete failed');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-amber-900 p-6">
        <form onSubmit={login} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>
          {message && <div className="mb-3 text-sm text-red-600">{message}</div>}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="w-full p-2 border rounded bg-gray-50 text-black placeholder-gray-400" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" className="w-full p-2 border rounded bg-gray-50 text-black placeholder-gray-400" />
          </div>
          <button className="w-full bg-amber-600 text-black py-2 rounded font-semibold">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black to-amber-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-sm text-amber-200/90">Manage silver bar entries — create, edit, or delete records.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowUserModal(true); setUserForm({ username: '', password: '', role: 'admin' }); }} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-black rounded-md shadow">Create User</button>
            <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md shadow">Logout</button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-6">
          <div className="bg-white/95 p-6 rounded-lg shadow ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-xl text-gray-800">Silver Bar Records</h2>
                <p className="text-sm text-gray-500">Recent entries — newest first</p>
              </div>
              <div>
                <button onClick={() => { setShowModal(true); setForm({ serialNo: '', weight: '', purity: '', certifiedBy: '', origin: '', metal: 'Silver', production: '' }); setEditingSerial(null); }} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-3 py-2 rounded-md font-semibold shadow">Add Entry</button>
              </div>
            </div>

            <div className="overflow-auto">
              <div className="rounded-md overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certified By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {items.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No entries yet.</td></tr>
                    )}
                    {items.map((it) => (
                      <tr key={it._id} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{it.serialNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{it.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{it.purity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{it.certifiedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{it.origin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(it.production).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => { setForm({ serialNo: it.serialNo, weight: it.weight, purity: it.purity, certifiedBy: it.certifiedBy, origin: it.origin, metal: it.metal, production: it.production }); setShowModal(true); setEditingSerial(it.serialNo); }} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black rounded-md">Edit</button>
                            <button onClick={() => deleteEntry(it.serialNo)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white/95 p-6 rounded-lg shadow ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-xl text-gray-800">Products</h2>
                <p className="text-sm text-gray-500">Manage product catalog shown on the public site</p>
              </div>
              <div>
                <button onClick={() => { setShowProductModal(true); setProductForm({ title: '', weight: '', price: '', img: '' }); setProductImage(null); setProductImagePreview(null); setEditingProductId(null); }} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-3 py-2 rounded-md font-semibold shadow">Add Product</button>
              </div>
            </div>

            <div className="overflow-auto mb-6">
              <div className="rounded-md overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {products.length === 0 && (<tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products yet.</td></tr>)}
                    {products.map(p => (
                      <tr key={p._id} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.weight}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"><img src={p.img} alt={p.title} className="h-12 rounded object-cover"/></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => { setProductForm({ title: p.title, weight: p.weight, price: p.price, img: p.img }); setProductImage(null); setProductImagePreview(p.img || null); setShowProductModal(true); setEditingProductId(p._id); }} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black rounded-md">Edit</button>
                            <button onClick={() => deleteProduct(p._id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="mb-4">
                <h2 className="font-semibold text-xl text-gray-800">Users</h2>
                <p className="text-sm text-gray-500">Manage application users and roles</p>
              </div>
              <div className="overflow-auto">
                <div className="rounded-md overflow-hidden border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {usersList.length === 0 && (<tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No users yet.</td></tr>)}
                      {usersList.map(u => (
                        <tr key={u._id} className="bg-white">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button onClick={() => { setUserForm({ username: u.username, password: '', role: u.role }); setShowUserModal(true); }} className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-black rounded-md">Edit</button>
                              <button disabled={u.username === 'admin'} onClick={() => deleteUser(u.username)} className={`px-3 py-1 rounded-md ${u.username === 'admin' ? 'bg-gray-300 text-gray-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Entry Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white shadow-2xl rounded p-6 w-full max-w-lg ring-1 ring-black/10">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Add / Edit Entry</h3>
                <button onClick={() => { setShowModal(false); setEditingSerial(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={addEntry}>
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs text-gray-600">Serial Number</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="SerialNo" value={form.serialNo} onChange={e => setForm({ ...form, serialNo: e.target.value })} />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Weight</label>
                      <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Weight" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Purity</label>
                      <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Purity" value={form.purity} onChange={e => setForm({ ...form, purity: e.target.value })} />
                    </div>
                  </div>

                  <label className="text-xs text-gray-600">Certified By</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="CertifiedBy" value={form.certifiedBy} onChange={e => setForm({ ...form, certifiedBy: e.target.value })} />

                  <label className="text-xs text-gray-600">Origin</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Origin" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} />

                  <label className="text-xs text-gray-600">Production (ISO)</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Production" value={form.production} onChange={e => setForm({ ...form, production: e.target.value })} />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditingSerial(null); }} className="px-3 py-2 border rounded bg-white text-black">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-black rounded shadow">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showProductModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white shadow-2xl rounded p-6 w-full max-w-lg ring-1 ring-black/10">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Create / Edit Product</h3>
                <button onClick={() => { setShowProductModal(false); setEditingProductId(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={saveProduct} encType="multipart/form-data">
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs text-gray-600">Title</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Title" value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Weight</label>
                      <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Weight" value={productForm.weight} onChange={e => setProductForm({ ...productForm, weight: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Price</label>
                      <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Price" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                    </div>
                  </div>

                  <label className="text-xs text-gray-600">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setProductImage(file);
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setProductImagePreview(url);
                      } else {
                        setProductImagePreview(productForm.img || null);
                      }
                    }}
                  />

                  {(productImagePreview || productForm.img) && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Preview</p>
                      <img
                        src={productImagePreview || productForm.img}
                        alt={productForm.title || 'Preview'}
                        className="h-24 rounded object-cover border"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowProductModal(false); setEditingProductId(null); }} className="px-3 py-2 border rounded bg-white text-black">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-black rounded shadow">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white shadow-2xl rounded p-6 w-full max-w-md ring-1 ring-black/10">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Create / Edit User</h3>
                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={createUser}>
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs text-gray-600">Username</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Username" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />

                  <label className="text-xs text-gray-600">Password</label>
                  <input className="p-2 border bg-gray-50 text-black placeholder-gray-400 rounded" placeholder="Password" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />

                  <label className="text-xs text-gray-600">Role</label>
                  <select className="p-2 border bg-white text-black rounded" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowUserModal(false)} className="px-3 py-2 border rounded bg-white text-black">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-black rounded shadow">Save User</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
