import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from '../utils/axios';
import SearchBar from '../components/SearchBar';
import '../styles/Menu.css';

function Menu() {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('/api/menu');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const filteredItems = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower)
        );
    });

    const handleAddToCart = (item) => {
        addToCart(item);
    };

    return (
        <div className="menu-container">
            <h1>Our Menu</h1>
            <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm}
            />
            {filteredItems.length === 0 ? (
                <div className="no-results">
                    <h2>No items found</h2>
                    <p>Try searching for something else</p>
                </div>
            ) : (
                <div className="menu-grid">
                    {filteredItems.map(item => (
                        <div key={item._id} className="menu-item">
                            <img src={item.image} alt={item.name} />
                            <h3>{item.name}</h3>
                            <p className="price">₹{item.price}</p>
                            <p className="category">{item.category}</p>
                            <button
                                onClick={() => handleAddToCart(item)}
                                disabled={item.stockCount === 0}
                            >
                                {item.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <div className={`stock-status ${
                                item.stockCount === 0 ? 'out-of-stock' :
                                item.stockCount < 5 ? 'low-stock' : 'in-stock'
                            }`}>
                                {item.stockCount === 0 ? 'Out of Stock' :
                                 item.stockCount < 5 ? 'Low Stock' : 'In Stock'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Menu; 