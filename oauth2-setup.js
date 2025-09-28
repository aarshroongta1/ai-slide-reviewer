// OAuth2 Setup for Google Apps Script
// This allows automated access with user consent

/**
 * Initialize OAuth2 flow
 */
function initializeOAuth2() {
  const oauth2Config = {
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    redirectUri:
      "https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback",
    scope: "https://www.googleapis.com/auth/presentations",
  };

  // Store OAuth2 config
  PropertiesService.getScriptProperties().setProperties(oauth2Config);

  console.log("✅ OAuth2 configured");
  return { success: true, message: "OAuth2 configured" };
}

/**
 * Get OAuth2 authorization URL
 */
function getAuthorizationUrl() {
  const config = PropertiesService.getScriptProperties();
  const clientId = config.getProperty("clientId");
  const redirectUri = config.getProperty("redirectUri");
  const scope = config.getProperty("scope");

  const authUrl =
    `https://accounts.google.com/o/oauth2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`;

  return {
    success: true,
    authUrl: authUrl,
    message: "Visit this URL to authorize access",
  };
}

/**
 * Exchange authorization code for access token
 */
function exchangeCodeForToken(authorizationCode) {
  try {
    const config = PropertiesService.getScriptProperties();
    const clientId = config.getProperty("clientId");
    const clientSecret = config.getProperty("clientSecret");
    const redirectUri = config.getProperty("redirectUri");

    const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      payload: {
        client_id: clientId,
        client_secret: clientSecret,
        code: authorizationCode,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      },
    });

    const tokenData = JSON.parse(response.getContentText());

    // Store tokens securely
    PropertiesService.getScriptProperties().setProperties({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires: (Date.now() + tokenData.expires_in * 1000).toString(),
    });

    return {
      success: true,
      message: "Tokens stored successfully",
    };
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * Get valid access token (refresh if needed)
 */
function getValidAccessToken() {
  const config = PropertiesService.getScriptProperties();
  const accessToken = config.getProperty("access_token");
  const refreshToken = config.getProperty("refresh_token");
  const tokenExpires = parseInt(config.getProperty("token_expires") || "0");

  // Check if token is still valid
  if (accessToken && Date.now() < tokenExpires) {
    return accessToken;
  }

  // Refresh token if expired
  if (refreshToken) {
    return refreshAccessToken(refreshToken);
  }

  return null;
}

/**
 * Refresh access token
 */
function refreshAccessToken(refreshToken) {
  try {
    const config = PropertiesService.getScriptProperties();
    const clientId = config.getProperty("clientId");
    const clientSecret = config.getProperty("clientSecret");

    const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      payload: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
    });

    const tokenData = JSON.parse(response.getContentText());

    // Update stored tokens
    PropertiesService.getScriptProperties().setProperties({
      access_token: tokenData.access_token,
      token_expires: (Date.now() + tokenData.expires_in * 1000).toString(),
    });

    return tokenData.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

/**
 * Access presentation using OAuth2
 */
function accessPresentationWithOAuth2(presentationId) {
  try {
    const accessToken = getValidAccessToken();
    if (!accessToken) {
      throw new Error("No valid access token available");
    }

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
      message: "Successfully accessed presentation with OAuth2",
    };
  } catch (error) {
    console.error("Error accessing presentation:", error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}



