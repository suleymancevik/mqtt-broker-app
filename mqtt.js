const express = require('express');
const WebSocket = require('ws');

const app = express();

// Serve the HTML file
app.use(express.static('public'));

const PORT_HTTP = 8080; // HTTP port for HTML
const PORT_MQTT = 8085; // WebSocket port for MQTT

// Start the HTTP server
app.listen(PORT_HTTP, () => {
    console.log(`HTTP server is running at http://localhost:${PORT_HTTP}`);
});

// WebSocket MQTT server
const wss = new WebSocket.Server({ port: PORT_MQTT }, () => {
    console.log(`WebSocket MQTT Broker started on port ${PORT_MQTT}`);
});

const clients = new Map();

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            if (msg.type === 'auth') {
                const { username, password } = msg;
                if (username === 'admin' && password === 'password') {
                    ws.send(JSON.stringify({ type: 'auth', success: true }));
                    clients.set(ws, { authenticated: true });
                } else {
                    ws.send(JSON.stringify({ type: 'auth', success: false }));
                }
            } else if (msg.type === 'publish' || msg.type === 'subscribe') {
                const client = clients.get(ws);
                if (client && client.authenticated) {
                    ws.send(JSON.stringify({ type: msg.type, success: true }));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Please authenticate first.' }));
                }
            }
        } catch (error) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('WebSocket client disconnected');
    });
});