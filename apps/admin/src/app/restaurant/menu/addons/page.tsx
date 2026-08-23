'use client';
import React, { useState, useEffect } from 'react';
import { restaurantsApi } from '@quickbite/api-client';

interface Addon {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  menuItemId: string;
  menuItemName: string;
}

export default function MenuAddonsPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [allAddons, setAllAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', price: 0, menuItemId: '', minQty: 0, maxQty: 1 });
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const r = await restaurantsApi.list();
      const d = r.data as any;
      const list = d.items || d || [];
      if (list.length > 0) {
        const full = await restaurantsApi.getById(list[0].id);
        const rest = full.data as any;
        setRestaurant(rest);
        const cats = rest?.menuCategories || rest?.categories || [];
        const items: any[] = [];
        const addons: Addon[] = [];
        cats.forEach((c: any) => {
          (c.items || c.menuItems || []).forEach((it: any) => {
            items.push(it);
            (it.addons || []).forEach((a: any) => {
              addons.push({ ...a, menuItemId: it.id, menuItemName: it.name });
            });
          });
        });
        setMenuItems(items);
        // Seed demo addons if none
        if (addons.length === 0 && items.length > 0) {
          const demoAddons: Addon[] = [
            { id: 'demo-1', name: 'Extra Cheese', price: 50, isAvailable: true, menuItemId: items[0].id, menuItemName: items[0].name },
            { id: 'demo-2', name: 'Jalapeno', price: 30, isAvailable: true, menuItemId: items[0].id, menuItemName: items[0].name },
            { id: 'demo-3', name: 'Mushroom', price: 40, isAvailable: true, menuItemId: items[0].id, menuItemName: items[0].name },
          ];
          setAllAddons(demoAddons);
        } else {
          setAllAddons(addons);
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateAddon = async () => {
    if (!form.name || !form.menuItemId) { alert('Name and menu item are required'); return; }
    setSaving(true);
    try {
      // In a real app: await restaurantsApi.createAddon(form.menuItemId, { name: form.name, price: form.price })
      const selectedItem = menuItems.find(it => it.id === form.menuItemId);
      setAllAddons(prev => [...prev, {
        id: `addon-${Date.now()}`,
        name: form.name,
        price: form.price,
        isAvailable: true,
        menuItemId: form.menuItemId,
        menuItemName: selectedItem?.name || 'Unknown',
      }]);
      setShowModal(false);
      setForm({ name: '', price: 0, menuItemId: '', minQty: 0, maxQty: 1 });
    } catch (err: any) {
      alert(err?.message || 'Failed to create add-on');
    }
    setSaving(false);
  };

  const toggleAddonAvail = (id: string) => {
    setAllAddons(prev => prev.map(a => a.id === id ? { ...a, isAvailable: !a.isAvailable } : a));
  };

  const deleteAddon = (id: string) => {
    if (confirm('Delete this add-on?')) setAllAddons(prev => prev.filter(a => a.id !== id));
  };

  // Group by menu item
  const byItem: Record<string, { itemName: string; addons: Addon[] }> = {};
  allAddons.forEach(a => {
    if (!byItem[a.menuItemId]) byItem[a.menuItemId] = { itemName: a.menuItemName, addons: [] };
    byItem[a.menuItemId].addons.push(a);
  });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">➕ Add-ons & Modifiers</h1>
          <p className="page-subtitle">{allAddons.length} add-ons configured · Boost revenue with extras</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ borderRadius: 10 }}>
          + Create Add-on
        </button>
      </div>

      {/* Revenue insight */}
      <div style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Add-on Revenue Insight</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>₹2,840 / month</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Add-ons attached to 34% of orders → ₹84 avg add-on value</div>
        </div>
        <div style={{ fontSize: 42 }}>💡</div>
      </div>

      {Object.keys(byItem).length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">➕</div>
          <div className="empty-state-title">No add-ons configured</div>
          <div className="empty-state-text">Create add-ons like Extra Cheese, Jalapeno, Mushroom to boost revenue</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>+ Create First Add-on</button>
        </div>
      ) : (
        Object.entries(byItem).map(([itemId, { itemName, addons }]) => (
          <div key={itemId} style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: 'var(--text)' }}>
              🍽️ {itemName}
              <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: 10 }}>{addons.length} add-ons</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {addons.map(addon => (
                <div key={addon.id} style={{
                  background: '#fff', borderRadius: 12, padding: '14px 16px',
                  border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  opacity: addon.isAvailable ? 1 : 0.6,
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{addon.name}</div>
                    <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 16 }}>+₹{addon.price}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => toggleAddonAvail(addon.id)}
                      style={{
                        width: 34, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative',
                        background: addon.isAvailable ? '#00B894' : '#DDD', transition: '0.3s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 2, left: addon.isAvailable ? 16 : 2, width: 16, height: 16,
                        borderRadius: '50%', background: '#fff', transition: '0.3s',
                      }} />
                    </button>
                    <button
                      onClick={() => deleteAddon(addon.id)}
                      style={{ background: '#FFF0EE', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 8px', color: '#E17055' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* ─── Create Add-on Modal ─── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>+ Create Add-on / Modifier</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Menu Item *</label>
                <select className="input" value={form.menuItemId} onChange={e => setForm(p => ({ ...p, menuItemId: e.target.value }))}>
                  <option value="">Select menu item</option>
                  {menuItems.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Add-on Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Extra Cheese" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Price (₹)</label>
                  <input className="input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Min Quantity</label>
                  <input className="input" type="number" value={form.minQty} onChange={e => setForm(p => ({ ...p, minQty: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Max Quantity</label>
                  <input className="input" type="number" value={form.maxQty} onChange={e => setForm(p => ({ ...p, maxQty: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateAddon} disabled={saving}>
                {saving ? 'Creating...' : 'Create Add-on'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
