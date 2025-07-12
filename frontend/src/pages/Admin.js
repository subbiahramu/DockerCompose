import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/Admin.css';
import { useAuth } from '../context/AuthContext';

function Admin() {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        stockCount: '',
        category: '',
        image: null
    });
    const [editingItem, setEditingItem] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('/api/menu');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newItem.name);
            formData.append('price', newItem.price);
            formData.append('stockCount', newItem.stockCount);
            formData.append('category', newItem.category);
            if (newItem.image) {
                formData.append('image', newItem.image);
            }

            await axios.post('/api/admin/items', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setNewItem({
                name: '',
                price: '',
                stockCount: '',
                category: '',
                image: null
            });
            setImagePreview('');
            fetchItems();
        } catch (error) {
            alert('Error adding item');
        }
    };

    const handleUpdateItem = async (id) => {
        try {
            const formData = new FormData();
            Object.keys(editingItem).forEach(key => {
                if (key !== 'image' || (key === 'image' && editingItem[key] instanceof File)) {
                    formData.append(key, editingItem[key]);
                }
            });

            await axios.put(`/api/admin/items/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setEditingItem(null);
            fetchItems();
        } catch (error) {
            alert('Error updating item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`/api/admin/items/${id}`);
                fetchItems();
            } catch (error) {
                console.error('Delete error:', error);
                alert(error.response?.data?.message || 'Error deleting item');
            }
        }
    };

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            
            <section className="add-item-section">
                <h2>Add New Item</h2>
                <form onSubmit={handleAddItem}>
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={e => setNewItem({...newItem, price: e.target.value})}
                    />
                    <input
                        type="number"
                        placeholder="Stock Count"
                        value={newItem.stockCount}
                        onChange={e => setNewItem({...newItem, stockCount: e.target.value})}
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="image-preview"
                        />
                    )}
                    <button type="submit">Add Item</button>
                </form>
            </section>

            <section className="manage-items-section">
                <h2>Manage Items</h2>
                <div className="items-grid">
                    {items.map(item => (
                        <div key={item._id} className="item-card">
                            {editingItem && editingItem._id === item._id ? (
                                <div className="edit-form">
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={e => setEditingItem({
                                            ...editingItem,
                                            name: e.target.value
                                        })}
                                    />
                                    <input
                                        type="number"
                                        value={editingItem.price}
                                        onChange={e => setEditingItem({
                                            ...editingItem,
                                            price: e.target.value
                                        })}
                                    />
                                    <input
                                        type="number"
                                        value={editingItem.stockCount}
                                        onChange={e => setEditingItem({
                                            ...editingItem,
                                            stockCount: e.target.value
                                        })}
                                    />
                                    <button onClick={() => handleUpdateItem(item._id)}>
                                        Save
                                    </button>
                                    <button onClick={() => setEditingItem(null)}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <img src={item.image} alt={item.name} />
                                    <h3>{item.name}</h3>
                                    <p>Price: ₹{item.price}</p>
                                    <p>Stock: {item.stockCount}</p>
                                    <div className="item-actions">
                                        <button onClick={() => setEditingItem(item)}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteItem(item._id)}>
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Admin; 