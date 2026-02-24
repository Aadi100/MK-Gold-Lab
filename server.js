const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;
const JWT_SECRET = 'silverlab_secret_key_889922';

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

let pool;
async function connectDB() {
    try {
        pool = mysql.createPool({
            host: 'localhost',
            //user: 'u262457491_srkadmin',
            //password: 'srkadmin@12345$%^GDRW',
            user: 'root',
            password: '123456',
            
            //database: 'u262457491_silverlab',
            database: 'silverlab',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        console.log('Connected to MySQL via pool');

        // Automatic Table Creation
        await pool.query(`
            CREATE TABLE IF NOT EXISTS silver_bars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                serialNo VARCHAR(50) UNIQUE NOT NULL,
                weight VARCHAR(50),
                purity VARCHAR(50),
                metal VARCHAR(50) DEFAULT 'Silver',
                origin VARCHAR(100),
                certifiedBy VARCHAR(100) DEFAULT 'MK Gold Lab',
                production DATE,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                price VARCHAR(50),
                img VARCHAR(255),
                weight VARCHAR(50)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert Default Admin if not exists
        const [users] = await pool.query('SELECT * FROM users WHERE username = "admin"');
        if (users.length === 0) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
            console.log('Default admin user created.');
        }

    } catch (err) {
        console.error('Database Initialization Failed:', err.message);
    }
}

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!pool) return res.status(500).json({ error: 'DB not connected' });

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

app.get('/api/auth/users', authenticateToken, async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    try {
        const [rows] = await pool.query('SELECT id, username, role, createdAt FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// User Creation (Admin only)
app.post('/api/auth/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role || 'admin']);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'User creation failed' });
    }
});

app.delete('/api/auth/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// API Routes
app.get('/api/bars', async (req, res) => {
    const serial = req.query.serial;
    if (!pool) return res.status(500).json({ error: 'DB not connected' });

    try {
        if (serial) {
            const [rows] = await pool.query('SELECT * FROM silver_bars WHERE UPPER(serialNo) = ?', [serial.toUpperCase()]);
            if (rows.length === 0) return res.status(404).json({ found: false });
            return res.json({ found: true, data: rows[0] });
        }

        const [rows] = await pool.query('SELECT * FROM silver_bars ORDER BY id DESC LIMIT 200');
        res.json({ items: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.get('/api/products', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// Admin routes (Protected)
app.post('/api/products', authenticateToken, upload.single('img'), async (req, res) => {
    const { id, title, weight, price, existingImg } = req.body;
    let img = existingImg || ""; // use hidden field path by default

    if (req.file) {
        img = 'uploads/' + req.file.filename;
    }

    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    try {
        if (id) {
            await pool.query('UPDATE products SET title=?, weight=?, price=?, img=? WHERE id=?', [title, weight, price, img, id]);
        } else {
            await pool.query('INSERT INTO products (title, weight, price, img) VALUES (?, ?, ?, ?)', [title, weight, price, img]);
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Deletion failed' });
    }
});

app.post('/api/bars', authenticateToken, async (req, res) => {
    const body = req.body;
    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    
    try {
        const serial = String(body.serialNo).toUpperCase();
        // Check if exists
        const [existing] = await pool.query('SELECT serialNo FROM silver_bars WHERE serialNo = ?', [serial]);
        
        if (existing.length > 0) {
            // Update
            const query = `UPDATE silver_bars SET weight=?, purity=?, certifiedBy=?, origin=?, metal=?, production=? WHERE serialNo=?`;
            await pool.query(query, [
                body.weight || '',
                body.purity || '',
                body.certifiedBy || 'MK Gold Lab',
                body.origin || '',
                body.metal || 'Silver',
                body.production || new Date().toISOString().split('T')[0],
                serial
            ]);
        } else {
            // Insert
            const query = `INSERT INTO silver_bars (serialNo, weight, purity, certifiedBy, origin, metal, production) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await pool.query(query, [
                serial,
                body.weight || '',
                body.purity || '',
                body.certifiedBy || 'MK Gold Lab',
                body.origin || '',
                body.metal || 'Silver',
                body.production || new Date().toISOString().split('T')[0]
            ]);
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/bars', authenticateToken, async (req, res) => {
    const serial = req.query.serial;
    if (!pool) return res.status(500).json({ error: 'DB not connected' });
    
    try {
        await pool.query('DELETE FROM silver_bars WHERE serialNo = ?', [serial]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database deletion failed' });
    }
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});
