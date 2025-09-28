// Test URL extraction
const extractPresentationIdFromUrl = (url) => {
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error('Error extracting presentation ID:', error);
    return null;
  }
};

// Test with your specific URL
const testUrl = 'https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit';
const extractedId = extractPresentationIdFromUrl(testUrl);

console.log('Test URL:', testUrl);
console.log('Extracted ID:', extractedId);
console.log('✅ URL extraction works:', extractedId ? 'YES' : 'NO');

