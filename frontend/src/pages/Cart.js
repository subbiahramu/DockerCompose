import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import '../styles/Cart.css';

function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const TAX_RATE = 0.05; // 5% tax

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const generatePDF = (orderData) => {
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.text('Canteen Bill', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Order ID: ${orderData._id}`, 20, 25);
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);

        // Add items table
        const tableColumn = ["Item", "Price", "Quantity", "Total"];
        const tableRows = cart.map(item => [
            item.name,
            `₹${item.price}`,
            item.quantity,
            `₹${item.price * item.quantity}`
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid'
        });

        // Add summary
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Tax (5%): ₹${tax.toFixed(2)}`, 140, finalY + 5);
        doc.text(`Total: ₹${total.toFixed(2)}`, 140, finalY + 10);

        // Save PDF
        doc.save(`bill-${orderData._id}.pdf`);
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(itemId, newQuantity);
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            // Update stock
            await axios.put('http://localhost:5000/api/menu/updateStock', {
                items: cart.map(item => ({
                    id: item._id,
                    quantity: item.quantity
                }))
            });

            // Create order
            const response = await axios.post('http://localhost:5000/api/orders', {
                items: cart,
                subtotal,
                tax,
                total
            });

            // Generate and download PDF
            generatePDF(response.data);

            clearCart();
            alert('Order placed successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing order');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item._id} className="cart-item">
                                <img src={item.image} alt={item.name} />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>₹{item.price}</p>
                                </div>
                                <div className="quantity-controls">
                                    <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
                                </div>
                                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (5%):</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button 
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Checkout'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart; 