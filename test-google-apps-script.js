#!/usr/bin/env node

/**
 * Test Google Apps Script endpoints directly
 * This helps debug what the deployed script is actually returning
 */

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwD_H7sumW6A-EkmNirJMwTviT9GROu8nz91VOaiMHjv8vqcSbjkX-LPM18ARhcLGYu9g/exec";

async function testGoogleAppsScript() {
  console.log("🧪 Testing Google Apps Script endpoints...\n");

  // Test 1: Initialize monitoring
  console.log("1️⃣ Testing initialization...");
  try {
    const initResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "initialize",
        data: {},
      }),
    });

    const initResult = await initResponse.json();
    console.log("✅ Initialize response:", JSON.stringify(initResult, null, 2));
  } catch (error) {
    console.log("❌ Initialize error:", error);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Detect changes
  console.log("2️⃣ Testing change detection...");
  try {
    const changesResponse = await fetch(
      `${GOOGLE_APPS_SCRIPT_URL}?action=detectChanges`
    );
    const changesResult = await changesResponse.json();
    console.log(
      "✅ Detect changes response:",
      JSON.stringify(changesResult, null, 2)
    );
  } catch (error) {
    console.log("❌ Detect changes error:", error);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Get current state
  console.log("3️⃣ Testing current state...");
  try {
    const stateResponse = await fetch(
      `${GOOGLE_APPS_SCRIPT_URL}?action=getCurrentState`
    );
    const stateResult = await stateResponse.json();
    console.log(
      "✅ Current state response:",
      JSON.stringify(stateResult, null, 2)
    );
  } catch (error) {
    console.log("❌ Current state error:", error);
  }
}

// Run the test
testGoogleAppsScript().catch(console.error);
