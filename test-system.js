/**
 * Simple test script to verify the system is working
 */

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwD_H7sumW6A-EkmNirJMwTviT9GROu8nz91VOaiMHjv8vqcSbjkX-LPM18ARhcLGYu9g/exec";

async function testSystem() {
  console.log("🧪 Testing the system...");

  try {
    // Test 1: Get current state
    console.log("\n1️⃣ Testing getCurrentState...");
    const stateResponse = await fetch(
      `${GOOGLE_APPS_SCRIPT_URL}?action=getCurrentState`
    );
    const stateData = await stateResponse.json();
    console.log("✅ Current State:", {
      slideCount: stateData.state?.slideCount,
      totalElements: stateData.state?.totalElements,
      monitoring: stateData.state?.isFormattingMonitoring,
    });

    // Test 2: Force detect changes
    console.log("\n2️⃣ Testing forceDetectChanges...");
    const changesResponse = await fetch(
      `${GOOGLE_APPS_SCRIPT_URL}?action=forceDetectChanges`
    );
    const changesData = await changesResponse.json();
    console.log("✅ Changes Detection:", {
      success: changesData.success,
      changeCount: changesData.changeCount,
      message: changesData.message,
    });

    if (changesData.changes && changesData.changes.length > 0) {
      console.log("📝 Sample changes:");
      changesData.changes.slice(0, 3).forEach((change, index) => {
        console.log(
          `  ${index + 1}. ${change.changeType} on Slide ${
            change.slideIndex + 1
          }`
        );
      });
    }

    // Test 3: Test Next.js API
    console.log("\n3️⃣ Testing Next.js API...");
    const nextResponse = await fetch("http://localhost:3000/api/slides/state");
    const nextData = await nextResponse.json();
    console.log("✅ Next.js API:", {
      success: nextData.success,
      slideCount: nextData.state?.slideCount,
      totalElements: nextData.state?.totalElements,
    });

    console.log("\n🎉 System test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSystem();



