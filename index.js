require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const shortid = require('shortid');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = {};

// Helper function to validate URLs
const isValidUrl = (inputUrl) => {
  try {
    const parsedUrl = new URL(inputUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST route to create a short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate the URL format
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Use DNS to check if the domain exists
  const hostname = new URL(originalUrl).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = shortid.generate();
      urlDatabase[shortUrl] = originalUrl;
      return res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// GET route to redirect to the original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

