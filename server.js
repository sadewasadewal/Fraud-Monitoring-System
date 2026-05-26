const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = urlPath === '/' || urlPath === '/index.html' ? './preview.html' : '.' + urlPath;
    filePath = path.resolve(__dirname, filePath);

    // Security check: ensure filePath is within the workspace
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const startServer = (port) => {
    server.listen(port, () => {
        console.log(`\x1b[32m✔ Server successfully started at http://localhost:${port}\x1b[0m`);
        console.log(`\x1b[36mℹ Serving preview.html as the entry point...\x1b[0m`);
        
        // Automatically open the browser
        const url = `http://localhost:${port}`;
        const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${start} ${url}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`\x1b[33m⚠ Port ${port} is in use, trying port ${port + 1}...\x1b[0m`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

startServer(PORT);

