# Update Google Apps Script

Your local `Code.js` file has been updated, but your deployed Google Apps Script still has the old code. You need to update the deployed script.

## Steps to Update:

### 1. Open Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Find your project: "AI Slide Reviewer" (or similar name)
3. Open the project

### 2. Replace the Code

1. Select all the code in the editor (Ctrl+A / Cmd+A)
2. Delete it
3. Copy the entire contents of your local `Code.js` file
4. Paste it into the Google Apps Script editor

### 3. Save and Deploy

1. Click **Save** (Ctrl+S / Cmd+S)
2. Go to **Deploy** → **Manage deployments**
3. Click the **Edit** (pencil) icon on your existing deployment
4. Click **Deploy** to update the existing deployment

### 4. Test the Update

After updating, test the endpoints:

- **Test Connection**: `GET /api/slides/connect?testConnection=true`
- **Initialize**: `POST /api/slides/connect` with `{"action": "initializeChangeTracking"}`
- **Detect Changes**: `GET /api/slides/changes`

## Expected Behavior After Update:

✅ **Before Update**: `{ error: 'Formatting monitoring not initialized' }`
✅ **After Update**: `{ error: 'Monitoring not initialized' }` (if not initialized)
✅ **After Initialization**: `{ changes: [], changeCount: 0, timestamp: "..." }`

## Quick Test Commands:

```bash
# Test connection
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=testConnection"

# Initialize monitoring
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{"action": "initializeChangeTracking", "data": {}}'

# Detect changes
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=detectChanges"
```

## Troubleshooting:

If you still get errors after updating:

1. Check the Google Apps Script execution logs
2. Make sure the script has proper permissions
3. Verify the deployment URL is correct
4. Test individual functions in the Google Apps Script editor
