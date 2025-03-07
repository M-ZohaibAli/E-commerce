// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database'); // MySQL connection pool

// Registration
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!(email && password)) {
            return res.status(400).send("All input is required");
        }

        // Check existing user
        const [existing] = await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        
        if (existing.length > 0) {
            return res.status(409).send("User already exists");
        }

        // Hash password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create user
        await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, encryptedPassword]
        );

        // Generate JWT
        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(201).json({ email, token });
    } catch (err) {
        console.error(err);
        res.status(500).send("Registration failed");
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!(email && password)) {
            return res.status(400).send("All input is required");
        }

        // Get user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        
        if (users.length === 0) {
            return res.status(404).send("User not found");
        }

        // Verify password
        const user = users[0];
        if (await bcrypt.compare(password, user.password)) {
            // Create JWT
            const token = jwt.sign(
                { email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            return res.json({ email: user.email, token });
        }
        res.status(401).send("Invalid credentials");
    } catch (err) {
        console.error(err);
        res.status(500).send("Login failed");
    }
};

// Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(403).send("Token required");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send("Invalid token");
    }
};

module.exports = { register, login, authMiddleware };