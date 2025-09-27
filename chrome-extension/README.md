# Cedar Spells Chrome Extension

A Chrome extension that injects Cedar spells into Google Slides using React and the official Cedar-OS components.

## Features

- **React-based**: Built with React and TypeScript
- **Official Cedar Spells**: Uses your existing Cedar spell components
- **Google Slides Integration**: Automatically injects into Google Slides pages
- **P Key Activation**: Hold P key to activate radial menu
- **Static Options**: Test implementation with static menu options

## Installation

### Quick Setup

1. **Install dependencies**:
   ```bash
   cd chrome-extension
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension/dist` folder

### Development Mode

```bash
npm run dev
```

This builds the extension in watch mode for development.

## Usage

1. **Open Google Slides** in your browser
2. **Hold the P key** to activate the Cedar radial menu
3. **Click on any option** to trigger the corresponding Cedar spell
4. **Press ESC** to close the menu

## Cedar Spells Available

- **🔍 Analyze Slide**: Analyze current slide content
- **💡 Generate Insights**: Generate AI insights for improvements
- **👁️ Monitor Changes**: Start monitoring slide changes
- **🔎 Search Content**: Search through slide content

## Development

### Project Structure

```
chrome-extension/
├── src/
│   ├── contents/
│   │   └── cedar-spells.tsx    # Main content script with Cedar spells
│   ├── popup.tsx               # Extension popup
│   └── style.css               # Global styles
├── manifest.json               # Extension manifest
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript config
```

### Key Files

- **`src/contents/cedar-spells.tsx`**: Contains the main Cedar spells integration
- **`src/popup.tsx`**: Extension popup with usage instructions
- **`manifest.json`**: Chrome extension configuration

### Cedar Spells Integration

The extension imports and uses your existing Cedar spell components:

```typescript
import RadialMenuSpell from "../../../src/app/cedar-os/components/spells/RadialMenuSpell"
import type { RadialMenuItem } from "../../../src/app/cedar-os/components/spells/RadialMenuSpell"
```

## Customization

### Adding New Spells

1. **Add menu items** in `src/contents/cedar-spells.tsx`:
   ```typescript
   const menuItems: RadialMenuItem[] = [
     // Add your new spell here
     {
       title: 'Your New Spell',
       icon: YourIcon,
       onInvoke: async () => {
         console.log('Your spell logic here')
       },
     },
   ]
   ```

2. **Update activation key** if needed (currently P key)

### Styling

Modify `src/style.css` to customize the appearance of the Cedar spells.

## Testing

1. **Load the extension** in Chrome
2. **Open Google Slides**
3. **Test the P key activation**
4. **Verify Cedar spells work** as expected

## Troubleshooting

### Extension Not Loading
- Check Chrome console for errors
- Verify manifest.json syntax
- Ensure all dependencies are installed

### Cedar Spells Not Working
- Check if Cedar-OS components are properly imported
- Verify React components are rendering
- Check browser console for errors

### P Key Not Responding
- Ensure you're on a Google Slides page
- Check if extension has proper permissions
- Verify content script is running

## Next Steps

This is a test implementation. Future enhancements could include:

- **Real Google Slides API integration**
- **Dynamic spell options based on slide content**
- **AI processing integration**
- **More sophisticated UI integration**

## Support

For issues or questions, check the browser console for error messages and ensure all dependencies are properly installed.
