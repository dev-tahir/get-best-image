# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Get API Keys (Optional but Recommended)

#### Google AI API Key (for AI image selection)
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Copy your key

#### Image Search APIs (for better image results)
- **Unsplash**: [Get free API key](https://unsplash.com/developers) (5000 requests/hour)
- **Pexels**: [Get free API key](https://www.pexels.com/api/) (200 requests/hour)

### 3. Configure Environment
```bash
# Copy template
copy .env.example .env

# Edit .env and add your keys:
GOOGLE_AI_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_key_here
PEXELS_API_KEY=your_key_here
```

## 🎯 Test the Server

### Option 1: Basic Test
```bash
npm run dev
```

### Option 2: Full Integration Test
```bash
npm test
```

## 🔧 Use with Claude Desktop

Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "mcp-image-server": {
      "command": "node",
      "args": ["C:/your/path/to/build/index.js"]
    }
  }
}
```

## 💡 Example Usage

Once connected to Claude Desktop, try:
```
"Find me the best image of a sunset over mountains"
"Search for a professional headshot photo"
"Get me an image of a modern office space"
```

## 🆘 Troubleshooting

**No images found?**
- Check your API keys in `.env`
- Server works without API keys using placeholder images

**AI selection not working?**
- Make sure `GOOGLE_AI_API_KEY` is set
- Server falls back to algorithm-based selection

**Build errors?**
- Run `npm install` again
- Check Node.js version (requires 18+)

**Need help?**
- Check the full README.md for detailed documentation
- All errors are logged to console for debugging
