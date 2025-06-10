const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../models/data');
const { errorResponse, successResponse } = require('../utils/helpers');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Register New user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json(errorResponse('Username and password are required', 400));
    }
    
    if (username.length < 3) {
        return res.status(400).json(errorResponse('Username must be at least 3 characters long', 400));
    }
    
    if (password.length < 6) {
        return res.status(400).json(errorResponse('Password must be at least 6 characters long', 400));
    }
    
    if (users[username]) {
        return res.status(409).json(errorResponse('User already exists', 409));
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users[username] = { password: hashedPassword };
        res.status(201).json(successResponse(null, 'User registered successfully'));
    } catch (error) {
        res.status(500).json(errorResponse('Error registering user', 500));
    }
});

// Login as a Registered user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json(errorResponse('Username and password are required', 400));
    }
    
    if (!users[username]) {
        return res.status(401).json(errorResponse('Invalid credentials', 401));
    }
    
    try {
        const validPassword = await bcrypt.compare(password, users[username].password);
        if (!validPassword) {
            return res.status(401).json(errorResponse('Invalid credentials', 401));
        }
        
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        req.session.user = username;
        
        const responseData = {
            token,
            user: username,
            expiresIn: '1 hour'
        };
        
        res.json(successResponse(responseData, 'Login successful'));
    } catch (error) {
        res.status(500).json(errorResponse('Error during login', 500));
    }
});

module.exports = router;