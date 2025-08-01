// proxy-server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/proxy/businesses', async (req, res) => {
    try {
        const apiRes = await fetch('http://texnoxizmat.uz:8082/ru/GetBusiness', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${req.headers['authorization'] || ''}`,
                'api-key': 'b463026f-f02a-483e-9750-4c3890474604',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await apiRes.json();
        res.status(apiRes.status).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Proxy failed', details: err.message });
    }
});

app.listen(4000, () => console.log('Proxy listening on http://91.99.164.161:4000'));
