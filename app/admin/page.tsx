"use client"

import React, { useEffect, useState, useCallback } from "react";

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Jost:wght@300;400;500&display=swap');
  @keyframes slideUp { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
`;

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontFamily: "'Jost',sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: "2px", color: "#e8e0d0", fontFamily: "'Jost',sans-serif",
  fontSize: "0.875rem", fontWeight: 300, padding: "0.65rem 0.85rem",
  width: "100%", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  WebkitAppearance: "none",
};

function Input({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{ ...inputBase, ...style }}
      onFocus={e => { e.target.style.borderColor = "#c9a84c"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
      {...props}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      style={{ ...inputBase, cursor: "pointer" }}
      onFocus={e => { e.target.style.borderColor = "#c9a84c"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
      {...props}
    >
      {children}
    </select>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  background: "#c9a84c", color: "#0a0805", border: "none", borderRadius: "2px",
  fontFamily: "'Jost',sans-serif", fontSize: "0.7rem", fontWeight: 500,
  letterSpacing: "0.14em", textTransform: "uppercase", padding: "0.65rem 1.25rem",
  cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s",
};
const btnGhost: React.CSSProperties = {
  background: "transparent", color: "#7a7060", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "2px", fontFamily: "'Jost',sans-serif", fontSize: "0.7rem", fontWeight: 400,
  letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.65rem 1.1rem",
  cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s, border-color 0.2s",
};
const btnEdit: React.CSSProperties = {
  background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.28)",
  borderRadius: "2px", fontFamily: "'Jost',sans-serif", fontSize: "0.65rem", fontWeight: 500,
  letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.65rem",
  cursor: "pointer", transition: "background 0.2s",
};
const btnDanger: React.CSSProperties = {
  background: "transparent", color: "#c0392b", border: "1px solid rgba(192,57,43,0.3)",
  borderRadius: "2px", fontFamily: "'Jost',sans-serif", fontSize: "0.65rem", fontWeight: 500,
  letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 0.65rem",
  cursor: "pointer", transition: "background 0.2s",
};
const btnDangerSolid: React.CSSProperties = {
  background: "#c0392b", color: "#fff", border: "none", borderRadius: "2px",
  fontFamily: "'Jost',sans-serif", fontSize: "0.7rem", fontWeight: 500,
  letterSpacing: "0.14em", textTransform: "uppercase", padding: "0.65rem 1.25rem",
  cursor: "pointer", transition: "background 0.2s",
};

// ── Animated Modal ────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, maxWidth = "480px" }: {
  open: boolean; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Tiny delay so the browser paints the initial state before animating in
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        background: visible ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(8px)" : "blur(0px)",
        transition: "background 0.24s, backdrop-filter 0.24s",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#17160f",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "2px",
          boxShadow: "0 48px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,76,0.06) inset",
          width: "100%", maxWidth, maxHeight: "90vh", overflowY: "auto",
          padding: "2rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "opacity 0.24s cubic-bezier(0.16,1,0.3,1), transform 0.24s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
      <div>
        <p style={{ fontFamily: "'Jost',sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.2em", color: "#c9a84c", textTransform: "uppercase", marginBottom: "0.25rem" }}>{eyebrow}</p>
        <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.5rem", fontWeight: 400, color: "#e8e0d0" }}>{title}</h3>
      </div>
      <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#7a7060", borderRadius: "2px", padding: "0.3rem 0.5rem", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, transition: "color 0.15s" }}>✕</button>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
      {children}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ open, title, description, onConfirm, onCancel }: {
  open: boolean; title: string; description: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="360px">
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          <svg width="22" height="22" fill="none" stroke="#c0392b" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.4rem", fontWeight: 400, color: "#e8e0d0", marginBottom: "0.5rem" }}>{title}</h3>
        <p style={{ fontFamily: "'Jost',sans-serif", fontSize: "0.76rem", fontWeight: 300, color: "#7a7060", lineHeight: 1.65, marginBottom: "1.75rem" }}>{description}</p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
          <button style={btnGhost} onClick={onCancel}
            onMouseEnter={e => { (e.currentTarget).style.color = "#e8e0d0"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget).style.color = "#7a7060"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >Cancel</button>
          <button style={btnDangerSolid} onClick={onConfirm}
            onMouseEnter={e => { (e.currentTarget).style.background = "#a93226"; }}
            onMouseLeave={e => { (e.currentTarget).style.background = "#c0392b"; }}
          >Delete</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200,
      background: "rgba(23,22,15,0.95)", border: "1px solid rgba(201,168,76,0.3)",
      borderRadius: "2px", padding: "0.7rem 1.1rem",
      display: "flex", alignItems: "center", gap: "0.6rem",
      boxShadow: "0 16px 40px rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
      animation: "slideUp 0.2s ease-out forwards",
    }}>
      <svg width="13" height="13" fill="none" stroke="#4ade80" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      <span style={{ fontFamily: "'Jost',sans-serif", fontSize: "0.78rem", fontWeight: 400, color: "#e8e0d0" }}>{message}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

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

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false, title: '', description: '', onConfirm: () => {},
  });

  const showDelete = (title: string, description: string, onConfirm: () => void) =>
    setDeleteModal({ open: true, title, description, onConfirm });
  const closeDelete = () => setDeleteModal(d => ({ ...d, open: false }));
  const notify = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    let timer: any;
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => fetch('/api/auth/logout', { method: 'POST' }).then(() => location.reload()), 5 * 60 * 1000); };
    window.addEventListener('mousemove', reset); window.addEventListener('keydown', reset); window.addEventListener('touchstart', reset);
    reset();
    return () => { clearTimeout(timer); window.removeEventListener('mousemove', reset); window.removeEventListener('keydown', reset); window.removeEventListener('touchstart', reset); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) { setAuthenticated(true); await fetchItems(); await fetchUsers(); await fetchProducts(); }
        else setAuthenticated(false);
      } catch { setAuthenticated(false); }
      finally { setLoading(false); }
    })();
  }, []);

  const fetchProducts = async () => { try { const r = await fetch('/api/products'); if (r.ok) { const d = await r.json(); setProducts(Array.isArray(d) ? d : d?.products ?? []); } } catch {} };
  const fetchItems = async () => { try { const r = await fetch('/api/bars'); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d?.items ?? []); } } catch {} };
  const fetchUsers = async () => { try { const r = await fetch('/api/auth/users'); if (r.ok) { const d = await r.json(); setUsersList(Array.isArray(d) ? d : d?.users ?? []); } } catch {} };

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMessage('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (res.ok) { setAuthenticated(true); await fetchItems(); await fetchUsers(); }
      else { const txt = await res.text(); setMessage(txt || 'Login failed'); }
    } catch { setMessage('Network error'); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false); setItems([]); setUsersList([]);
    setTimeout(() => location.reload(), 50);
  }

  async function addEntry(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      const method = editingSerial ? 'PUT' : 'POST';
      const url = editingSerial ? `/api/bars?serial=${encodeURIComponent(editingSerial)}` : '/api/bars';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false); setEditingSerial(null);
        setForm({ serialNo: '', weight: '', purity: '', certifiedBy: '', origin: '', metal: 'Silver', production: '' });
        await fetchItems(); notify(editingSerial ? 'Record updated' : 'Record created');
      } else notify('Save failed');
    } catch { notify('Network error'); }
  }

  const confirmDeleteEntry = (serial: string) =>
    showDelete('Delete Record', `Are you sure you want to delete serial "${serial}"? This cannot be undone.`, async () => {
      closeDelete();
      const res = await fetch(`/api/bars?serial=${encodeURIComponent(serial)}`, { method: 'DELETE' });
      await fetchItems(); notify(res.ok ? 'Record deleted' : 'Delete failed');
    });

  async function createUser(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
      if (res.ok) { setShowUserModal(false); setUserForm({ username: '', password: '', role: 'admin' }); await fetchUsers(); notify('User saved'); }
      else { const t = await res.text(); notify(t || 'Failed'); }
    } catch { notify('Network error'); }
  }

  const confirmDeleteUser = (u: string) =>
    showDelete('Delete User', `Are you sure you want to delete user "${u}"? This cannot be undone.`, async () => {
      closeDelete();
      const res = await fetch(`/api/auth/users?username=${encodeURIComponent(u)}`, { method: 'DELETE' });
      await fetchUsers(); notify(res.ok ? 'User deleted' : 'Delete failed');
    });

  async function saveProduct(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', productForm.title); fd.append('weight', productForm.weight); fd.append('price', productForm.price);
      if (editingProductId) fd.append('_id', editingProductId);
      if (productForm.img) fd.append('existingImg', productForm.img);
      if (productImage) fd.append('image', productImage);
      const res = await fetch('/api/products', { method: editingProductId ? 'PUT' : 'POST', body: fd });
      if (res.ok) {
        setShowProductModal(false); setEditingProductId(null);
        setProductForm({ title: '', weight: '', price: '', img: '' });
        setProductImage(null); setProductImagePreview(null);
        await fetchProducts(); notify('Product saved');
      } else { const t = await res.text(); notify(t || 'Save failed'); }
    } catch { notify('Network error'); }
  }

  const confirmDeleteProduct = (id: string, title: string) =>
    showDelete('Delete Product', `Are you sure you want to delete "${title}"? This cannot be undone.`, async () => {
      closeDelete();
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      await fetchProducts(); notify(res.ok ? 'Product deleted' : 'Delete failed');
    });

  // ── Shared style tokens ──
  const card: React.CSSProperties = { background: "rgba(23,22,15,0.88)", border: "1px solid rgba(201,168,76,0.14)", borderRadius: "2px", backdropFilter: "blur(8px)", marginBottom: "1.5rem", padding: "1.75rem 2rem" };
  const th: React.CSSProperties = { fontFamily: "'Jost',sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", padding: "0.6rem 1rem", textAlign: "left" };
  const td: React.CSSProperties = { fontFamily: "'Jost',sans-serif", fontSize: "0.82rem", color: "#e8e0d0", padding: "0.8rem 1rem", fontWeight: 300, verticalAlign: "middle" };
  const rowHover = { onMouseEnter: (e: any) => { e.currentTarget.style.background = "rgba(201,168,76,0.03)"; }, onMouseLeave: (e: any) => { e.currentTarget.style.background = "transparent"; } };

  // ── Loading ──
  if (loading) return (
    <div className="relative z-10 min-h-screen flex items-center justify-center">
      <p style={{ color: "#c9a84c", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.1rem", letterSpacing: "0.22em" }}>LOADING…</p>
    </div>
  );

  // ── Login ──
  if (!authenticated) return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-5">
        <form onSubmit={login} style={{ background: "rgba(23,22,15,0.92)", border: "1px solid rgba(201,168,76,0.28)", borderRadius: "2px", padding: "2.75rem 2.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", animation: "slideUp 0.28s ease-out" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "2rem", fontWeight: 300, color: "#e8e0d0", lineHeight: 1.1, marginBottom: "2rem" }}>Admin Portal</h2>
          {message && <div style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "2px", color: "#e87060", fontFamily: "'Jost',sans-serif", fontSize: "0.78rem", padding: "0.6rem 0.85rem", marginBottom: "1.25rem" }}>{message}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <Field label="Username"><Input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoComplete="username" /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></Field>
          </div>
          <button type="submit" style={{ ...btnPrimary, width: "100%", marginTop: "1.75rem", padding: "0.85rem", fontSize: "0.75rem" }}
            onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
            onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
          >Sign In</button>
        </form>
      </div>
    </>
  );

  // ── Admin panel ──
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative z-10 min-h-screen" style={{ fontFamily: "'Jost',sans-serif", color: "#e8e0d0" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "2.4rem", fontWeight: 300, color: "#e8e0d0", lineHeight: 1 }}>Admin Panel</h1>
              <p style={{ fontSize: "0.73rem", color: "#7a7060", marginTop: "0.4rem", fontWeight: 300, letterSpacing: "0.04em" }}>Manage silver bar records, products, and users</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
          
              <button style={btnGhost} onClick={logout}
                onMouseEnter={e => { (e.currentTarget).style.color = "#e8e0d0"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget).style.color = "#7a7060"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >Logout</button>
            </div>
          </div>

          {/* Silver Bar Records */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.35rem", fontWeight: 400, color: "#e8e0d0" }}>Silver Bar Records</h2>
                <p style={{ fontSize: "0.71rem", color: "#7a7060", marginTop: "0.2rem", fontWeight: 300 }}>Most recent entries first</p>
              </div>
              <button style={btnPrimary} onClick={() => { setShowModal(true); setForm({ serialNo: '', weight: '', purity: '', certifiedBy: '', origin: '', metal: 'Silver', production: '' }); setEditingSerial(null); }}
                onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
                onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
              >+ Add Entry</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                  {["Serial","Weight","Purity","Certified By","Origin","Production","Actions"].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#7a7060", padding: "2.5rem 1rem", fontStyle: "italic" }}>No entries yet.</td></tr>}
                  {items.map(it => (
                    <tr key={it._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }} {...rowHover}>
                      <td style={td}>{it.serialNo}</td><td style={td}>{it.weight}</td><td style={td}>{it.purity}</td>
                      <td style={td}>{it.certifiedBy}</td><td style={td}>{it.origin}</td>
                      <td style={td}>{new Date(it.production).toLocaleString()}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={btnEdit}
                            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(201,168,76,0.22)"; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = "rgba(201,168,76,0.1)"; }}
                            onClick={() => { setForm({ serialNo: it.serialNo, weight: it.weight, purity: it.purity, certifiedBy: it.certifiedBy, origin: it.origin, metal: it.metal, production: it.production }); setShowModal(true); setEditingSerial(it.serialNo); }}
                          >Edit</button>
                          <button style={btnDanger}
                            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(192,57,43,0.12)"; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = "transparent"; }}
                            onClick={() => confirmDeleteEntry(it.serialNo)}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.35rem", fontWeight: 400, color: "#e8e0d0" }}>Products</h2>
                <p style={{ fontSize: "0.71rem", color: "#7a7060", marginTop: "0.2rem", fontWeight: 300 }}>Public-facing product catalog</p>
              </div>
              <button style={btnPrimary} onClick={() => { setShowProductModal(true); setProductForm({ title: '', weight: '', price: '', img: '' }); setProductImage(null); setProductImagePreview(null); setEditingProductId(null); }}
                onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
                onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
              >+ Add Product</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                  {["Title","Weight","Price","Image","Actions"].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {products.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#7a7060", padding: "2.5rem 1rem", fontStyle: "italic" }}>No products yet.</td></tr>}
                  {products.map(p => (
                    <tr key={p._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }} {...rowHover}>
                      <td style={td}>{p.title}</td><td style={td}>{p.weight}</td><td style={td}>{p.price}</td>
                      <td style={td}><img src={p.img} alt={p.title} style={{ height: "40px", borderRadius: "2px", objectFit: "cover", border: "1px solid rgba(201,168,76,0.2)" }} /></td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={btnEdit}
                            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(201,168,76,0.22)"; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = "rgba(201,168,76,0.1)"; }}
                            onClick={() => { setProductForm({ title: p.title, weight: p.weight, price: p.price, img: p.img }); setProductImage(null); setProductImagePreview(p.img || null); setShowProductModal(true); setEditingProductId(p._id); }}
                          >Edit</button>
                          <button style={btnDanger}
                            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(192,57,43,0.12)"; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = "transparent"; }}
                            onClick={() => confirmDeleteProduct(p._id, p.title)}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>


              
            </div>

            <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", margin: "1.75rem 0" }} />

            {/* Users */}
            <div className=" flex flex-col" style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.35rem", fontWeight: 400, color: "#e8e0d0" }}>Users</h2>
              <p style={{ fontSize: "0.71rem", color: "#7a7060", marginTop: "0.2rem", fontWeight: 300 }}>Application users and roles</p>

                  <button className="self-end absolute" style={btnPrimary} onClick={() => { setShowUserModal(true); setUserForm({ username: '', password: '', role: 'admin' }); }}
                onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
                onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
              >+ Create User</button>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                  {["Username","Role","Actions"].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {usersList.length === 0 && <tr><td colSpan={3} style={{ ...td, textAlign: "center", color: "#7a7060", padding: "2.5rem 1rem", fontStyle: "italic" }}>No users yet.</td></tr>}
                  {usersList.map(u => (
                    <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }} {...rowHover}>
                      <td style={td}>{u.username}</td>
                      <td style={{ ...td, color: "#c9a84c", textTransform: "capitalize" }}>{u.role}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={btnEdit}
                            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(201,168,76,0.22)"; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = "rgba(201,168,76,0.1)"; }}
                            onClick={() => { setUserForm({ username: u.username, password: '', role: u.role }); setShowUserModal(true); }}
                          >Edit</button>
                          <button
                            style={{ ...btnDanger, opacity: u.username === 'admin' ? 0.35 : 1, cursor: u.username === 'admin' ? 'default' : 'pointer' }}
                            disabled={u.username === 'admin'}
                            onMouseEnter={e => { if (u.username !== 'admin') (e.currentTarget).style.background = "rgba(192,57,43,0.12)"; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = "transparent"; }}
                            onClick={() => { if (u.username !== 'admin') confirmDeleteUser(u.username); }}
                          >Delete</button>
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

      {/* ── Entry Modal ── */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingSerial(null); }}>
        <ModalHeader eyebrow={editingSerial ? 'Editing' : 'New Entry'} title="Silver Bar Record" onClose={() => { setShowModal(false); setEditingSerial(null); }} />
        <form onSubmit={addEntry}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <Field label="Serial Number"><Input placeholder="e.g. SB-20240001" value={form.serialNo} onChange={e => setForm({ ...form, serialNo: e.target.value })} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Weight"><Input placeholder="e.g. 1 kg" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></Field>
              <Field label="Purity"><Input placeholder="e.g. .999" value={form.purity} onChange={e => setForm({ ...form, purity: e.target.value })} /></Field>
            </div>
            <Field label="Certified By"><Input placeholder="e.g. LBMA" value={form.certifiedBy} onChange={e => setForm({ ...form, certifiedBy: e.target.value })} /></Field>
            <Field label="Origin"><Input placeholder="e.g. Switzerland" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} /></Field>
            <Field label="Production Date (ISO)"><Input placeholder="e.g. 2024-01-15T00:00:00Z" value={form.production} onChange={e => setForm({ ...form, production: e.target.value })} /></Field>
          </div>
          <ModalFooter>
            <button type="button" style={btnGhost} onClick={() => { setShowModal(false); setEditingSerial(null); }}>Cancel</button>
            <button type="submit" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
              onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
            >Save Record</button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── Product Modal ── */}
      <Modal open={showProductModal} onClose={() => { setShowProductModal(false); setEditingProductId(null); }}>
        <ModalHeader eyebrow={editingProductId ? 'Editing' : 'New Product'} title="Product Details" onClose={() => { setShowProductModal(false); setEditingProductId(null); }} />
        <form onSubmit={saveProduct} encType="multipart/form-data">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <Field label="Title"><Input placeholder="e.g. 1 kg Silver Bar" value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Weight"><Input placeholder="e.g. 1000g" value={productForm.weight} onChange={e => setProductForm({ ...productForm, weight: e.target.value })} /></Field>
              <Field label="Price"><Input placeholder="e.g. $950.00" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></Field>
            </div>
            <Field label="Product Image">
              <input type="file" accept="image/*" style={{ ...inputBase, padding: "0.5rem 0.85rem", color: "#7a7060", cursor: "pointer" }}
                onChange={e => { const f = e.target.files?.[0] || null; setProductImage(f); setProductImagePreview(f ? URL.createObjectURL(f) : productForm.img || null); }}
              />
            </Field>
            {(productImagePreview || productForm.img) && (
              <div>
                <p style={{ fontFamily: "'Jost',sans-serif", fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7a7060", marginBottom: "0.5rem" }}>Preview</p>
                <img src={productImagePreview || productForm.img} alt="Preview" style={{ height: "80px", borderRadius: "2px", objectFit: "cover", border: "1px solid rgba(201,168,76,0.28)" }} />
              </div>
            )}
          </div>
          <ModalFooter>
            <button type="button" style={btnGhost} onClick={() => { setShowProductModal(false); setEditingProductId(null); }}>Cancel</button>
            <button type="submit" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
              onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
            >Save Product</button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── User Modal ── */}
      <Modal open={showUserModal} onClose={() => setShowUserModal(false)} maxWidth="400px">
        <ModalHeader eyebrow={userForm.username ? 'Editing' : 'New User'} title="User Account" onClose={() => setShowUserModal(false)} />
        <form onSubmit={createUser}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <Field label="Username"><Input placeholder="Enter username" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} /></Field>
            <Field label="Password"><Input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="admin" style={{ background: "#1e1c13" }}>Admin</option>
                <option value="manager" style={{ background: "#1e1c13" }}>Manager</option>
              </Select>
            </Field>
          </div>
          <ModalFooter>
            <button type="button" style={btnGhost} onClick={() => setShowUserModal(false)}>Cancel</button>
            <button type="submit" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget).style.background = "#e0c47a"; }}
              onMouseLeave={e => { (e.currentTarget).style.background = "#c9a84c"; }}
            >Save User</button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <DeleteModal
        open={deleteModal.open}
        title={deleteModal.title}
        description={deleteModal.description}
        onConfirm={deleteModal.onConfirm}
        onCancel={closeDelete}
      />

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}