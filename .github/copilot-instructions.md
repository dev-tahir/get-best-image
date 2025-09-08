<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MCP Image Server Project

This project creates an MCP server that:
1. Searches for images using web APIs
2. Labels and combines images (1-20) with black borders
3. Uses Flash 2.5 AI to select the best image match
4. Returns base64 encoded images to users

## Development Progress

- [x] Clarify Project Requirements
  - Creating MCP server for image search and AI-powered selection
  - Uses TypeScript/Node.js for MCP server implementation
  - Integrates with image search APIs and Google's Flash 2.5 model

- [x] Scaffold the Project
  - Set up TypeScript project with proper configuration
  - Installed MCP SDK, image processing libraries (Sharp, Canvas), and Google AI SDK
  - Created modular service architecture for image search, processing, and AI selection

- [x] Customize the Project
  - Implemented ImageSearchService with Unsplash, Pexels APIs and fallback to Lorem Picsum
  - Created ImageProcessingService for image labeling, borders, and composite creation
  - Integrated AISelectionService using Google's Gemini 2.0 Flash for intelligent selection
  - Added base64 conversion and comprehensive error handling

- [ ] Install Required Extensions
  - Install TypeScript and Node.js extensions if recommended

- [x] Compile the Project
  - Successfully built TypeScript to JavaScript
  - All compilation completed without errors

- [x] Create and Run Task
  - Created build task for TypeScript compilation
  - Created development task for running the server
  - All tasks execute successfully

- [x] Launch the Project
  - Server launches successfully and listens on stdio
  - Proper error handling and logging implemented
  - Ready for MCP client connections

- [x] Ensure Documentation is Complete
  - Comprehensive README with setup instructions and API documentation
  - Environment variables template with all required keys
  - VS Code MCP configuration for easy debugging
