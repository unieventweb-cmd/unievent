// server.js - Crash-Proof Production Setup
const express = require('express');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const cluster = require('cluster');
const os = require('os');
const path = require('path');

// Multithreading: Agar server cluster mode mein nahi hai, to CPU cores ke mutabiq divide karein
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
    const numCPUs = Number(process.env.WEB_CONCURRENCY) || os.cpus().length;
    console.log(`Master process is running. Forking for ${numCPUs} CPUs...`);
    
    // Har core ke liye ek worker process banayein
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Agar koi worker crash ho jaye, to PM2/Cluster use foran naya zinda kar dega
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    const app = express();
    app.set('trust proxy', 1);

    // 1. Security Headers (Helmet)
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
                formAction: ["'self'", 'https:']
            }
        }
    }));

    // 2. GZIP Compression (Data transfer fast karne aur bandwidth bachane ke liye)
    app.use(compression());

    app.use(express.json());

    // The public browser client is served separately from the private Edge Functions.
    const publicClientDirectory = process.env.PUBLIC_CLIENT_DIR
        ? path.resolve(__dirname, process.env.PUBLIC_CLIENT_DIR)
        : path.resolve(__dirname, '../Backend/js');
    app.use('/js', express.static(publicClientDirectory));
    app.use(express.static(__dirname));

    // 3. Rate Limiting: Ek IP se 15 mint mein max 100 requests
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, 
        max: 100, 
        message: { error: "Too many requests, please try again later." }
    });
    app.use('/api/', limiter);

    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            status: 'ok',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        });
    });

    // 4. Sample Route with Error Handling
    app.get('/api/events', async (req, res, next) => {
        try {
            // Yahan pehle Redis cache check hoga, agar nahi mila to DB se aayega
            res.json({ success: true, message: "Welcome to Pakistan University Events API" });
        } catch (error) {
            next(error); // Error ko global handler par bhejein, crash na hone dein
        }
    });

    // 5. Global Centralized Error Handler (Website ko crash hone se rokta hai)
    app.use((err, req, res, next) => {
        console.error("System Error Logged:", err.stack);
        res.status(500).json({
            success: false,
            message: "Something went wrong, but the server is safe!"
        });
    });

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
    });
}