import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import Button from '../../components/ui/Button';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', type: 'Medicine', stock: 0, unit: 'tablets', reorderLevel: 10 });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await inventoryService.getAllItems();
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await inventoryService.addItem(newItem);
            setShowModal(false);
            fetchItems();
            setNewItem({ name: '', type: 'Medicine', stock: 0, unit: 'tablets', reorderLevel: 10 });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500">Track medicines, consumables, and assets</p>
                </div>
                <Button onClick={() => setShowModal(true)} variant="primary" className="flex items-center gap-2">
                    <Plus size={20} /> Add Item
                </Button>
            </div>

            {/* Stats / Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Items</p>
                        <p className="text-3xl font-bold text-slate-800">{items.length}</p>
                    </div>
                    <div className="p-3 bg-brand-50 rounded-xl">
                        <Package className="text-brand-600" size={24} />
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Low Stock Alerts</p>
                        <p className="text-3xl font-bold text-red-600">
                            {items.filter(i => i.stock <= i.reorderLevel).length}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl">
                        <AlertTriangle className="text-red-600" size={24} />
                    </div>
                </div>
            </div>

            <div className="glass-effect rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-slate-500">No items found</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.type}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{item.stock}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                                        <td className="px-6 py-4">
                                            {item.stock <= item.reorderLevel ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Add Item Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Item</h2>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-modern"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="input-modern"
                                        value={newItem.type}
                                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                    >
                                        <option>Medicine</option>
                                        <option>Consumable</option>
                                        <option>Equipment</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-modern"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        placeholder="e.g. tablets"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="input-modern"
                                        value={newItem.stock}
                                        onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="input-modern"
                                        value={newItem.reorderLevel}
                                        onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1">Add Item</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
