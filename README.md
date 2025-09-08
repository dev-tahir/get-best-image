# MCP Image Server

An intelligent MCP (Model Context Protocol) server that searches for images, labels them, combines them into a composite image, and uses Google's Gemini 2.0 Flash AI to select the best match for your query.

## Features

- 🔍 **Image Search**: Searches multiple sources (Unsplash, Pexels, with fallback to Lorem Picsum)
- 🏷️ **Smart Labeling**: Labels each image (1-20) with black borders for easy identification
- 🖼️ **Image Composition**: Combines all images into a single grid view
- 🤖 **AI Selection**: Uses Google's Gemini 2.0 Flash to intelligently select the best matching image
- 📦 **Base64 Output**: Returns images as base64 for easy integration

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   copy .env.example .env
   ```

4. Edit `.env` and add your API keys:
   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   PEXELS_API_KEY=your_pexels_api_key_here
   ```

## Getting API Keys

### Google AI API Key (Required for AI selection)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env` file as `GOOGLE_AI_API_KEY`

### Unsplash API Key (Optional but recommended)
1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key
4. Add it to your `.env` file as `UNSPLASH_ACCESS_KEY`

### Pexels API Key (Optional but recommended)
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Create a free account and get your API key
3. Add it to your `.env` file as `PEXELS_API_KEY`

## Usage

### Development Mode
```bash
npm run dev
```

### Build and Run
```bash
npm run build
npm start
```

### Using with Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "mcp-image-server": {
      "command": "node",
      "args": ["C:/path/to/your/project/build/index.js"]
    }
  }
}
```

## Available Tools

### `search_and_select_best_image`

Searches for images matching your query and returns the AI-selected best match.

**Parameters:**
- `query` (string, required): The search query for images
- `maxImages` (number, optional): Maximum number of images to search (1-20, default: 20)

**Example usage in Claude:**
```
"Search for the best image of a sunset over mountains"
```

## How It Works

1. **Search**: Queries multiple image APIs (Unsplash, Pexels) for relevant images
2. **Download**: Downloads up to 20 images and resizes them to thumbnails
3. **Label**: Adds numbered labels (1-20) with black borders to each image
4. **Compose**: Combines all labeled images into a single grid
5. **AI Analysis**: Sends the composite to Google's Gemini 2.0 Flash with your original query
6. **Select**: AI analyzes each numbered image and selects the best match
7. **Return**: Downloads and returns the selected image as base64

## Error Handling

- If no API keys are provided, the server uses placeholder images from Lorem Picsum
- If Google AI API is not available, it uses a fallback selection algorithm
- Failed image downloads are replaced with placeholder images
- All errors are logged to stderr for debugging

## Project Structure

```
src/
├── index.ts                    # Main MCP server entry point
└── services/
    ├── ImageSearchService.ts   # Handles image search from various APIs
    ├── ImageProcessingService.ts # Processes and combines images
    └── AISelectionService.ts   # Uses Google AI for selection
```

## Development

- `npm run dev` - Run in development mode with auto-restart
- `npm run build` - Build TypeScript to JavaScript
- `npm run clean` - Clean build directory

## License

MIT License

## Contributing

Feel free to submit issues and enhancement requests!
