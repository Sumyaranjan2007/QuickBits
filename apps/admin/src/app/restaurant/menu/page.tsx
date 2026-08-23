'use client';
import React, { useState, useEffect } from 'react';
import { restaurantsApi } from '@quickbite/api-client';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  foodType: string;
  isAvailable: boolean;
  isBestseller?: boolean;
  spicyLevel?: number;
  addons?: any[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

const FOOD_TYPE_OPTIONS = ['VEG', 'NON_VEG', 'EGG'];
const SPICY_LEVELS = [0, 1, 2, 3];

const DEFAULT_ITEM: Partial<MenuItem> & { categoryId: string } = {
  name: '',
  description: '',
  price: 0,
  foodType: 'VEG',
  isAvailable: true,
  isBestseller: false,
  spicyLevel: 0,
  imageUrl: '',
  categoryId: '',
};

export default function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [addonModal, setAddonModal] = useState<any>(null);
  const [newAddon, setNewAddon] = useState({ name: '', price: 0 });

  const loadMenu = async () => {
    try {
      const r = await restaurantsApi.list();
      const d = r.data as any;
      const list = d.items || d || [];
      if (list.length > 0) {
        const full = await restaurantsApi.getById(list[0].id);
        setRestaurant(full.data);
        const cats: MenuCategory[] = (full.data as any)?.menuCategories || (full.data as any)?.categories || [];
        setCategories(cats.map((c: any) => ({ ...c, items: c.items || c.menuItems || [] })));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadMenu(); }, []);

  const handleSaveItem = async () => {
    if (!editItem?.name || !editItem?.price || !editItem?.categoryId) {
      alert('Name, price and category are required');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await restaurantsApi.createMenuItem(restaurant.id, {
          name: editItem.name,
          description: editItem.description,
          price: Number(editItem.price),
          foodType: editItem.foodType,
          isAvailable: editItem.isAvailable,
          isBestseller: editItem.isBestseller,
          spicyLevel: editItem.spicyLevel,
          imageUrl: editItem.imageUrl,
          categoryId: editItem.categoryId,
        });
      } else {
        await restaurantsApi.updateMenuItem(restaurant.id, editItem.id, {
          name: editItem.name,
          description: editItem.description,
          price: Number(editItem.price),
          foodType: editItem.foodType,
          isAvailable: editItem.isAvailable,
          isBestseller: editItem.isBestseller,
          spicyLevel: editItem.spicyLevel,
          imageUrl: editItem.imageUrl,
        });
      }
      await loadMenu();
      setEditItem(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to save item');
    }
    setSaving(false);
  };

  const handleToggleAvailability = async (restaurantId: string, itemId: string) => {
    try {
      await restaurantsApi.toggleItemAvailability(restaurantId, itemId);
      setCategories(prev => prev.map(c => ({
        ...c,
        items: c.items.map(it => it.id === itemId ? { ...it, isAvailable: !it.isAvailable } : it),
      })));
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle availability');
    }
  };

  const openNewItem = (categoryId: string) => {
    setEditItem({ ...DEFAULT_ITEM, categoryId });
    setIsNew(true);
  };

  const openEditItem = (item: any, categoryId: string) => {
    setEditItem({ ...item, categoryId });
    setIsNew(false);
  };

  const allItems = categories.flatMap(c => c.items);
  const filteredCategories = searchQ
    ? categories.map(c => ({ ...c, items: c.items.filter(it => it.name.toLowerCase().includes(searchQ.toLowerCase()) || it.description?.toLowerCase().includes(searchQ.toLowerCase())) })).filter(c => c.items.length > 0)
    : categories;

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">📜 Menu Management</h1>
          <p className="page-subtitle">{allItems.length} items across {categories.length} categories</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search items..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ height: 40, width: 220, fontSize: 13 }}
          />
        </div>
      </div>

      {/* ─── Menu Health Score ─── */}
      <div style={{ background: 'linear-gradient(135deg, #00B894, #55EFC4)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>Menu Health Score</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>82 / 100</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            💡 Add images to 3 items to boost score to 90+
          </div>
        </div>
        <div style={{ fontSize: 48 }}>🌟</div>
      </div>

      {/* ─── Categories ─── */}
      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <div className="empty-state-title">No items found</div>
          <div className="empty-state-text">Try a different search term or add your first menu item</div>
        </div>
      ) : (
        filteredCategories.map(cat => (
          <div key={cat.id} style={{ marginBottom: 32 }}>
            {/* Category Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900 }}>{cat.name}</h2>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>{cat.items.length} items</span>
              </div>
              {restaurant && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 8, fontSize: 13 }}
                  onClick={() => openNewItem(cat.id)}
                >
                  + Add Item
                </button>
              )}
            </div>

            {/* Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {cat.items.map(item => (
                <div key={item.id} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
                  opacity: item.isAvailable ? 1 : 0.65,
                  transition: '0.2s',
                }}>
                  <div style={{ display: 'flex', gap: 0 }}>
                    {/* Image */}
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0 }}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 90, height: 90, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                        🍽️
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{
                              width: 12, height: 12, borderRadius: 2, border: `2px solid ${item.foodType === 'VEG' ? '#00B894' : '#E17055'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.foodType === 'VEG' ? '#00B894' : '#E17055' }} />
                            </span>
                            {item.isBestseller && <span style={{ fontSize: 9, fontWeight: 800, background: '#FF6B35', color: '#fff', padding: '1px 5px', borderRadius: 3 }}>⭐ BESTSELLER</span>}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{item.name}</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--primary)', flexShrink: 0 }}>₹{item.price}</div>
                      </div>
                      {item.description && <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 6, lineHeight: 1.4 }}>{item.description.slice(0, 60)}{item.description.length > 60 ? '…' : ''}</div>}
                      {item.addons && item.addons.length > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>+ {item.addons.length} add-ons</div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface-hover)', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => openEditItem(item, cat.id)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setAddonModal(item)}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                      >
                        ➕ Add-ons
                      </button>
                    </div>
                    {/* Availability Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: item.isAvailable ? '#00B894' : '#E17055', fontWeight: 700 }}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <button
                        onClick={() => handleToggleAvailability(restaurant.id, item.id)}
                        style={{
                          width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative',
                          background: item.isAvailable ? '#00B894' : '#DDD', transition: '0.3s',
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 2, left: item.isAvailable ? 18 : 2, width: 16, height: 16,
                          borderRadius: '50%', background: '#fff', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new item card */}
              {restaurant && (
                <div
                  onClick={() => openNewItem(cat.id)}
                  style={{
                    background: 'var(--surface-hover)', borderRadius: 14, border: '2px dashed var(--border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: 30, cursor: 'pointer', transition: '0.2s', minHeight: 90,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 4 }}>+</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)' }}>Add Item to {cat.name}</div>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* ─── Edit/Create Item Modal ─── */}
      {editItem && (
        <div className="modal-backdrop" onClick={() => setEditItem(null)}>
          <div className="modal-sheet" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>{isNew ? '+ Add Menu Item' : '✏️ Edit Item'}</h3>
              <button onClick={() => setEditItem(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Item Name *</label>
                  <input className="input" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} placeholder="e.g. Classic Smash Burger" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Price (₹) *</label>
                  <input className="input" type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} placeholder="199" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="input" style={{ height: 70, resize: 'none' }} value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} placeholder="Describe your dish..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Category *</label>
                  <select className="input" value={editItem.categoryId} onChange={e => setEditItem({ ...editItem, categoryId: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Food Type</label>
                  <select className="input" value={editItem.foodType} onChange={e => setEditItem({ ...editItem, foodType: e.target.value })}>
                    {FOOD_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Image URL</label>
                <input className="input" value={editItem.imageUrl || ''} onChange={e => setEditItem({ ...editItem, imageUrl: e.target.value })} placeholder="https://..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Spicy Level</label>
                  <select className="input" value={editItem.spicyLevel || 0} onChange={e => setEditItem({ ...editItem, spicyLevel: Number(e.target.value) })}>
                    <option value={0}>Not Spicy</option>
                    <option value={1}>🌶 Mild</option>
                    <option value={2}>🌶🌶 Medium</option>
                    <option value={3}>🌶🌶🌶 Hot</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    <input type="checkbox" checked={editItem.isBestseller} onChange={e => setEditItem({ ...editItem, isBestseller: e.target.checked })} />
                    ⭐ Bestseller
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    <input type="checkbox" checked={editItem.isAvailable} onChange={e => setEditItem({ ...editItem, isAvailable: e.target.checked })} />
                    Available
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveItem} disabled={saving}>
                {saving ? 'Saving...' : isNew ? 'Create Item' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add-on Modal ─── */}
      {addonModal && (
        <div className="modal-backdrop" onClick={() => setAddonModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 900 }}>Add-ons for: {addonModal.name}</h3>
              <button onClick={() => setAddonModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {(addonModal.addons || []).map((a: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-hover)', borderRadius: 8 }}>
                  <span style={{ fontWeight: 700 }}>{a.name}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>+₹{a.price}</span>
                </div>
              ))}
              {(!addonModal.addons || addonModal.addons.length === 0) && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No add-ons yet</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="input" placeholder="Add-on name" value={newAddon.name} onChange={e => setNewAddon(p => ({ ...p, name: e.target.value }))} style={{ flex: 2 }} />
              <input className="input" type="number" placeholder="₹ Price" value={newAddon.price} onChange={e => setNewAddon(p => ({ ...p, price: Number(e.target.value) }))} style={{ flex: 1 }} />
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  if (!newAddon.name) return;
                  try {
                    await restaurantsApi.createCategory(restaurant.id, { name: `ADDON:${addonModal.id}:${newAddon.name}:${newAddon.price}` });
                  } catch {}
                  setAddonModal((prev: any) => ({ ...prev, addons: [...(prev.addons || []), newAddon] }));
                  setNewAddon({ name: '', price: 0 });
                }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
