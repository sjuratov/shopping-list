const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/shopping-list') {
        fs.readFile('shopping-list.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/config' && req.method === 'GET') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
            azureKey: process.env.AZURE_OPENAI_KEY || '',
            azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview'
        }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Shopping List server running at http://localhost:${PORT}`);
    console.log(`🌐 Also available at http://127.0.0.1:${PORT}`);
    console.log(`📝 Make sure to create .env file with your Azure OpenAI credentials`);
});
