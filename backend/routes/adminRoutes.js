const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const MenuItem = require('../models/MenuItem');
const upload = require('../config/multer');

// Admin signup
router.post('/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingAdmin) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Create new admin user
        const adminUser = new AdminUser({
            username,
            password,
            email
        });

        await adminUser.save();

        // Generate token
        const token = jwt.sign(
            { userId: adminUser._id, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Admin user created successfully',
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin user
        const adminUser = await AdminUser.findOne({ username });
        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await adminUser.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: adminUser._id, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await AdminUser.findById(decoded.userId);
        
        if (!adminUser) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        req.adminUser = adminUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Add new item with image upload
router.post('/items', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = 'default-food.jpg';
        
        if (req.file) {
            // Save the path relative to the uploads directory
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const menuItem = new MenuItem({
            ...req.body,
            image: imageUrl
        });

        await menuItem.save();
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update item with image
router.put('/items/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body };
        
        if (req.file) {
            // Save the path relative to the uploads directory
            updates.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        res.json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete item
router.delete('/items/:id', verifyAdmin, async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete the associated image file if it exists
        if (item.image && item.image !== 'default-food.jpg') {
            try {
                const fs = require('fs');
                const path = require('path');
                const imagePath = item.image.split('/uploads/')[1];
                if (imagePath) {
                    const fullPath = path.join(__dirname, '../uploads', imagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            } catch (error) {
                console.error('Error deleting image file:', error);
                // Continue with item deletion even if image deletion fails
            }
        }

        // Delete the item from database
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
});

module.exports = router; 