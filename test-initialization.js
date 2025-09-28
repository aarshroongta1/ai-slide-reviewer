// Test script to check if initialization is working
const testInitialization = async () => {
  const presentationUrl =
    "https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit";

  console.log("🧪 Testing initialization with URL:", presentationUrl);

  try {
    // Test 1: Extract presentation ID
    const match = presentationUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const presentationId = match && match[1] ? match[1] : null;
    console.log("✅ Extracted presentation ID:", presentationId);

    // Test 2: Test connection to Google Apps Script
    const response = await fetch(
      `https://script.google.com/macros/s/AKfycbwD_H7sumW6A-EkmNirJMwTviT9GROu8nz91VOaiMHjv8vqcSbjkX-LPM18ARhcLGYu9g/exec?action=getPresentationInfo&presentationUrl=${encodeURIComponent(
        presentationUrl
      )}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Google Apps Script response:", data);
    } else {
      const errorText = await response.text();
      console.error("❌ Google Apps Script error:", errorText);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

testInitialization();



