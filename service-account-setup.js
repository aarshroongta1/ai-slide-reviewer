// Service Account Setup for Google Apps Script
// This allows automated access to any Google Slides presentation

/**
 * Initialize service account authentication
 */
function initializeServiceAccount() {
  // You'll need to add your service account JSON key here
  const serviceAccountKey = {
    type: "service_account",
    project_id: "your-project-id",
    private_key_id: "your-private-key-id",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
    client_email: "your-service-account@your-project.iam.gserviceaccount.com",
    client_id: "your-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  };

  // Store in PropertiesService for security
  PropertiesService.getScriptProperties().setProperty(
    "SERVICE_ACCOUNT_KEY",
    JSON.stringify(serviceAccountKey)
  );

  console.log("✅ Service account initialized");
  return { success: true, message: "Service account configured" };
}

/**
 * Get access token using service account
 */
function getAccessToken() {
  try {
    const serviceAccountKey = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("SERVICE_ACCOUNT_KEY")
    );

    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const payload = {
      iss: serviceAccountKey.client_email,
      scope: "https://www.googleapis.com/auth/presentations",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Create JWT token (simplified - you'd need a proper JWT library)
    const token = createJWT(header, payload, serviceAccountKey.private_key);

    // Exchange JWT for access token
    const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      payload: {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: token,
      },
    });

    const tokenData = JSON.parse(response.getContentText());
    return tokenData.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

/**
 * Access presentation using service account
 */
function accessPresentationWithServiceAccount(presentationId) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    // Use the access token to access the presentation
    const response = UrlFetchApp.fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const presentationData = JSON.parse(response.getContentText());
    return {
      success: true,
      presentation: presentationData,
      message: "Successfully accessed presentation with service account",
    };
  } catch (error) {
    console.error("Error accessing presentation:", error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * Create JWT token (simplified version)
 * Note: In production, use a proper JWT library
 */
function createJWT(header, payload, privateKey) {
  // This is a simplified version
  // In production, you'd use a proper JWT library
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(payload));

  const signature = Utilities.computeRsaSha256Signature(
    `${encodedHeader}.${encodedPayload}`,
    privateKey
  );

  return `${encodedHeader}.${encodedPayload}.${Utilities.base64EncodeWebSafe(
    signature
  )}`;
}



