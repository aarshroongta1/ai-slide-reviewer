// Test script to verify URL extraction functionality
const extractPresentationIdFromUrl = (url) => {
  try {
    // Handle different URL formats:
    // https://docs.google.com/presentation/d/PRESENTATION_ID/edit
    // https://docs.google.com/presentation/d/PRESENTATION_ID/edit#slide=id.p
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error('Error extracting presentation ID:', error);
    return null;
  }
};

// Test cases
const testUrls = [
  'https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit',
  'https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit#slide=id.p',
  'https://docs.google.com/presentation/d/1ABC123DEF456/edit',
  'https://docs.google.com/presentation/d/1ABC123DEF456/edit#slide=id.g1234567890',
  'https://docs.google.com/presentation/d/1ABC123DEF456',
  'invalid-url',
  'https://docs.google.com/document/d/123/edit', // Wrong service
];

console.log('🧪 Testing URL extraction functionality:\n');

testUrls.forEach((url, index) => {
  const extractedId = extractPresentationIdFromUrl(url);
  console.log(`Test ${index + 1}:`);
  console.log(`  URL: ${url}`);
  console.log(`  Extracted ID: ${extractedId || 'null'}`);
  console.log(`  Valid: ${extractedId ? '✅' : '❌'}`);
  console.log('');
});

console.log('✅ URL extraction test completed!');



