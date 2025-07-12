const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        name: String,
        price: Number,
        quantity: Number,
        _id: mongoose.Schema.Types.ObjectId
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 