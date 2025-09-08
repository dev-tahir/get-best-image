#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from 'dotenv';
import { ImageSearchService } from './services/ImageSearchService.js';
import { ImageProcessingService } from './services/ImageProcessingService.js';
import { AISelectionService } from './services/AISelectionService.js';

// Load environment variables
dotenv.config();

class MCPImageServer {
  private server: Server;
  private imageSearchService: ImageSearchService;
  private imageProcessingService: ImageProcessingService;
  private aiSelectionService: AISelectionService;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-image-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.imageSearchService = new ImageSearchService();
    this.imageProcessingService = new ImageProcessingService();
    this.aiSelectionService = new AISelectionService();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_and_select_best_image",
            description: "Search for images matching a query, label them 1-20, combine them, and use AI to select the best match",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query for images"
                },
                maxImages: {
                  type: "number",
                  description: "Maximum number of images to search (default: 20)",
                  default: 20,
                  minimum: 1,
                  maximum: 20
                }
              },
              required: ["query"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "search_and_select_best_image":
          return await this.handleImageSearchAndSelection(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleImageSearchAndSelection(args: any) {
    try {
      const { query, maxImages = 20 } = args;

      if (!query || typeof query !== 'string') {
        throw new Error('Query parameter is required and must be a string');
      }

      // Step 1: Search for images
      console.error(`[MCP] Searching for images with query: ${query}`);
      const imageUrls = await this.imageSearchService.searchImages(query, maxImages);
      
      if (imageUrls.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No images found for query: ${query}`
            }
          ]
        };
      }

      console.error(`[MCP] Found ${imageUrls.length} images`);

      // Step 2: Download and process images (add labels and borders)
      console.error(`[MCP] Processing and labeling images`);
      const compositeImageBase64 = await this.imageProcessingService.createLabeledComposite(imageUrls);

      // Step 3: Use AI to select the best image
      console.error(`[MCP] Using AI to select best image`);
      const selectedImageNumber = await this.aiSelectionService.selectBestImage(
        compositeImageBase64,
        query
      );

      // Step 4: Return the selected image
      console.error(`[MCP] AI selected image number: ${selectedImageNumber}`);
      const selectedImageUrl = imageUrls[selectedImageNumber - 1];
      const selectedImageBase64 = await this.imageProcessingService.downloadAndConvertToBase64(selectedImageUrl);

      return {
        content: [
          {
            type: "text",
            text: `Found ${imageUrls.length} images for "${query}". AI selected image #${selectedImageNumber} as the best match.`
          },
          {
            type: "image",
            data: selectedImageBase64,
            mimeType: "image/jpeg"
          }
        ]
      };

    } catch (error) {
      console.error(`[MCP] Error in handleImageSearchAndSelection:`, error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("[MCP] MCP Image Server running on stdio");
  }
}

const server = new MCPImageServer();
server.run().catch(console.error);
