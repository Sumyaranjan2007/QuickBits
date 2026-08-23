'use client';
import React, { useState, useEffect } from 'react';
import { restaurantsApi } from '@quickbite/api-client';

export default function MenuCategoriesPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const r = await restaurantsApi.list();
      const d = r.data as any;
      const list = d.items || d || [];
      if (list.length > 0) {
        const full = await restaurantsApi.getById(list[0].id);
        setRestaurant(full.data);
        const cats = (full.data as any)?.menuCategories || (full.data as any)?.categories || [];
        setCategories(cats.map((c: any) => ({ ...c, itemCount: (c.items || c.menuItems || []).length })));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: '', description: '', sortOrder: categories.length });
    setShowModal(true);
  };

  const openEdit = (cat: any) => {
    setEditingCat(cat);
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Category name is required'); return; }
    setSaving(true);
    try {
      if (editingCat) {
        await restaurantsApi.updateCategory(restaurant.id, editingCat.id, form);
      } else {
        await restaurantsApi.createCategory(restaurant.id, { name: form.name, sortOrder: form.sortOrder });
      }
      await loadCategories();
      setShowModal(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to save category');
    }
    setSaving(false);
  };

  const handleDelete = async (catId: string) => {
    try {
      await restaurantsApi.deleteCategory(restaurant.id, catId);
      setCategories(prev => prev.filter(c => c.id !== catId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
    setDeleteConfirm(null);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🗂️ Menu Categories</h1>
          <p className="page-subtitle">{categories.length} categories · Organize your menu structure</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ borderRadius: 10 }}>
          + Create Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">No menu categories</div>
          <div className="empty-state-text">Create your first category to start building your menu</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>+ Create First Category</button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sort</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(cat => (
                <tr key={cat.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>#{cat.sortOrder ?? '—'}</td>
                  <td style={{ fontWeight: 800, fontSize: 15 }}>{cat.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-sec)' }}>{cat.description || '—'}</td>
                  <td>
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>{cat.itemCount} items</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(cat)} style={{ fontSize: 11 }}>✏️ Edit</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteConfirm(cat.id)}
                        style={{ fontSize: 11 }}
                        disabled={cat.itemCount > 0}
                        title={cat.itemCount > 0 ? 'Remove all items first' : 'Delete category'}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Create/Edit Modal ─── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>{editingCat ? '✏️ Edit Category' : '+ Create Category'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Category Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Burgers, Pizzas, Drinks..." />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="input" style={{ height: 70, resize: 'none' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe this category..." />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Sort Order (lower = appears first)</label>
                <input className="input" type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>⚠️ Delete Category?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 20 }}>
              This action cannot be undone. All items in this category will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(deleteConfirm)}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
