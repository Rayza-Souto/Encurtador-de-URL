require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({ extended: false }));

let urlDict = {};
let id = 1;

// Verify URL, add to dictionary, and return it with a short URL (int)
app.post('/api/shorturl', (req, res) => {
    let url = req.body.url;
    // Add http:// if missing
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }

    try {
        const urlObj = new URL(url);
        dns.lookup(urlObj.hostname, (err) => {
            if (err) return res.json({ error: 'invalid url' });

            urlDict[id] = url;
            res.json({
                original_url: url,
                short_url: id
            });
            id++;
        });
    } catch (err) {
        res.json({ error: 'invalid url' });
    }
});

// Access the URL via its index in the dictionary
app.get('/api/shorturl/:n', (req, res) => {
    const shortUrl = req.params.n;
    const originalUrl = urlDict[shortUrl];

    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.json({ error: 'No short URL found for the given input' });
    }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
