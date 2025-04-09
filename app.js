const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3099;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid URL format' });
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      // Skip text nodes that contain "Yale references" to preserve them
      if (text.includes('Yale references')) {
        return;
      }
      const newText = text.replace(/Yale/gi, function(match) {
        if (match === match.toUpperCase()) return 'FALE';
        if (match === match.toLowerCase()) return 'fale';
        return 'Fale';
      });
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    // Process title separately
    const title = $('title').text();
    const newTitle = title.replace(/Yale/gi, function(match) {
      if (match === match.toUpperCase()) return 'FALE';
      if (match === match.toLowerCase()) return 'fale';
      return 'Fale';
    });
    if (title !== newTitle) {
      $('title').text(newTitle);
    }
    
    return res.json({ 
      success: true, 
      content: $.html(),
      title: $('title').text(),
      originalUrl: url
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Faleproxy server running at http://localhost:${PORT}`);
  });
}
