const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');

describe('Yale to Fale replacement logic', () => {
  
  test('should replace Yale with Fale in text content', () => {
    const $ = cheerio.load(sampleHtmlWithYale);
    
    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3; // Text nodes only
    }).each(function() {
      // Replace text content but not in URLs or attributes
      const text = $(this).text();
      console.log('Test 1 - Original text:', text);
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
      console.log('Test 1 - Modified text:', newText);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    // Process title separately
    const title = $('title').text();
    console.log('Test 1 - Original title:', title);
    const newTitle = title.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
    console.log('Test 1 - Modified title:', newTitle);
    $('title').text(newTitle);
    
    const modifiedHtml = $.html();
    console.log('Test 1 - Final HTML:', modifiedHtml);
    
    // Check text replacements
    expect(modifiedHtml).toContain('Fale University Test Page');
    expect(modifiedHtml).toContain('Welcome to Fale University');
    expect(modifiedHtml).toContain('Fale University is a private Ivy League');
    expect(modifiedHtml).toContain('Fale was founded in 1701');
    
    // Check that URLs remain unchanged
    expect(modifiedHtml).toContain('https://www.yale.edu/about');
    expect(modifiedHtml).toContain('https://www.yale.edu/admissions');
    expect(modifiedHtml).toContain('https://www.yale.edu/images/logo.png');
    expect(modifiedHtml).toContain('mailto:info@yale.edu');
    
    // Check href attributes remain unchanged
    expect(modifiedHtml).toMatch(/href="https:\/\/www\.yale\.edu\/about"/);
    expect(modifiedHtml).toMatch(/href="https:\/\/www\.yale\.edu\/admissions"/);
    
    // Check that link text is replaced
    expect(modifiedHtml).toContain('>About Fale<');
    expect(modifiedHtml).toContain('>Fale Admissions<');
    
    // Check that alt attributes are not changed
    expect(modifiedHtml).toContain('alt="Yale Logo"');
  });

  test('should handle text that has no Yale references', () => {
    const htmlWithoutYale = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello World</h1>
        <p>This is a test page with no Yale references.</p>
      </body>
      </html>
    `;
    
    const $ = cheerio.load(htmlWithoutYale);
    console.log('Test 2 - Original HTML:', $.html());
    
    // Apply the same replacement logic
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      console.log('Test 2 - Original text:', text);
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
      console.log('Test 2 - Modified text:', newText);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const modifiedHtml = $.html();
    console.log('Test 2 - Final HTML:', modifiedHtml);
    
    // Content should remain the same
    expect(modifiedHtml).toContain('<title>Test Page</title>');
    expect(modifiedHtml).toContain('<h1>Hello World</h1>');
    expect(modifiedHtml).toContain('<p>This is a test page with no Fale references.</p>');
  });

  test('should handle case-insensitive replacements', () => {
    const mixedCaseHtml = `
      <p>YALE University are all part of the same institution.</p>
    `;
    
    const $ = cheerio.load(mixedCaseHtml);
    console.log('Test 3 - Original HTML:', $.html());
    
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      console.log('Test 3 - Original text:', text);
      const newText = text.replace(/Yale/gi, function(match) {
        if (match === match.toUpperCase()) return 'FALE';
        if (match === match.toLowerCase()) return 'fale';
        return 'Fale';
      });
      console.log('Test 3 - Modified text:', newText);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const modifiedHtml = $.html();
    console.log('Test 3 - Final HTML:', modifiedHtml);
    
    expect(modifiedHtml).toContain('FALE University');
  });
});
