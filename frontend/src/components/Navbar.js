import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
    const { cart } = useCart();
    const { isAdmin, logout } = useAuth();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">Canteen Management</Link>
            </div>
            <div className="nav-links">
                <Link to="/">Menu</Link>
                <Link to="/cart" className="cart-link">
                    Cart
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>
                {isAdmin ? (
                    <>
                        <Link to="/admin">Admin Dashboard</Link>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <Link to="/admin/login">Admin Login</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar; 