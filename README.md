# 🔍 Enterprise Entity Highlighter

> Because manually looking up 8-digit IDs is *so* last century! 🚀

## What is This?

Ever found yourself staring at a sea of cryptic entity IDs on a webpage, wondering what `ABCDE123` or `00012345` actually means? Well, wonder no more! This nifty Chrome extension automatically detects entity IDs on any webpage and gives you instant tooltip superpowers! 💪

## ✨ Features

- **🎯 Auto-Detection**: Magically finds and highlights:
  - 8-digit numbers (e.g., `00012345`)
  - Special entity codes (5 uppercase letters + 3 digits, like `ABCDE123`)
  
- **💬 Instant Tooltips**: Hover over any highlighted entity to reveal:
  - Display name
  - Type (Project, Account, Order, etc.)
  - Current status
  - Last updated date

- **🎨 Beautiful Highlighting**: Entities are elegantly highlighted in a subtle blue so they're easy to spot without being obnoxious

- **⚡ Smart Scanning**: Only scans actual content (skips scripts, styles, and input fields)

## 🎮 How to Use

1. **Install the Extension**
   - Clone this repository
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory
   - 🎉 You're ready to go!

2. **Browse Any Page**
   - Visit any webpage (or try the included `demo/index.html`)
   - Watch as entity IDs get automatically highlighted
   - Hover over any highlighted ID to see the magic happen!

3. **Re-scan on Demand**
   - Click the extension icon in your toolbar
   - Hit the "Re-scan Page" button
   - Perfect for dynamically loaded content

## 🧪 Try It Out

Open the demo page to see it in action:
```bash
# Just open demo/index.html in your browser after installing the extension
```

The demo page contains several test entities:
- `ABCDE123` - An order entity
- `00012345` - A project entity  
- `99999999` - A closed account
- `12345678` - A generic 8-digit ID

## 🏗️ How It Works

The extension consists of three main components:

1. **Content Script** (`contentScript.js`)
   - Scans the DOM for entity patterns using regex
   - Wraps matching text in highlight spans
   - Manages tooltip display and positioning

2. **API Client** (`apiClient.js`)
   - Currently uses mock data for demonstration
   - Easily swappable with a real API endpoint
   - Simulates network latency for realistic behavior

3. **Popup Interface** (`popup.html`)
   - Simple control panel
   - Manual re-scan trigger
   - Status indicator

## 🎨 Customization

Want to tweak the patterns or styling?

**Change Detection Patterns**: Edit the regex in `contentScript.js`:
```javascript
const REGEX_PATTERN = /(\b\d{8}\b)|(\b[A-Z]{5}\d{3}\b)/g;
```

**Modify Tooltip Styles**: Check out `styles.css` and look for `.ext-entity-tooltip`

**Add Your Own Data**: Update the `MOCK_DB` in `apiClient.js` or connect to a real API!

## 🔮 Future Ideas

- [ ] Support for more entity patterns
- [ ] Configurable highlighting colors
- [ ] Offline caching for frequently accessed entities
- [ ] Dark mode tooltips (because why not?)
- [ ] Multi-language support
- [ ] Export highlighted entities to clipboard

## 🛠️ Tech Stack

- Vanilla JavaScript (no frameworks needed!)
- Chrome Extension Manifest V3
- CSS3 for beautiful tooltips
- Regular Expressions for pattern matching

## 📝 File Structure

```
├── manifest.json        # Extension configuration
├── contentScript.js     # Main scanning and highlighting logic
├── apiClient.js         # Mock API for entity data
├── popup.html           # Extension popup UI
├── popup.js             # Popup control logic
├── styles.css           # Tooltip and highlight styles
└── demo/
    └── index.html       # Test page with sample entities
```

## 🤝 Contributing

Found a bug? Have a cool idea? Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📜 License

This project is open source and available under standard licensing terms.

---

*Made with ❤️ and a healthy dose of regex wizardry* ✨

**Pro Tip**: Try visiting internal company pages with lots of IDs - this extension really shines when dealing with data-heavy interfaces! 🌟
