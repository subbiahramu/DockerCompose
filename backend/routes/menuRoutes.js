const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items
router.get('/', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update stock count after order
router.put('/updateStock', async (req, res) => {
    try {
        const { items } = req.body;
        
        for (let item of items) {
            const menuItem = await MenuItem.findById(item.id);
            if (menuItem.stockCount < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${menuItem.name}`
                });
            }
            
            await MenuItem.findByIdAndUpdate(
                item.id,
                { $inc: { stockCount: -item.quantity } }
            );
        }
        
        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 