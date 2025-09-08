#!/usr/bin/env node

/**
 * Test script for the MCP Image Server
 * This simulates how the server would be called by an MCP client
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const testQuery = "beautiful sunset over mountains";

console.log('Testing MCP Image Server...');
console.log(`Query: "${testQuery}"`);

// Spawn the MCP server
const serverProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: true
});

// JSON-RPC messages
const initMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};

const listToolsMessage = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/list"
};

const callToolMessage = {
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "search_and_select_best_image",
    arguments: {
      query: testQuery,
      maxImages: 5
    }
  }
};

let responseCount = 0;
let fullResponse = '';

serverProcess.stdout.on('data', (data) => {
  const response = data.toString();
  fullResponse += response;
  
  try {
    const messages = response.trim().split('\n').filter(line => line.trim());
    
    for (const message of messages) {
      if (message.trim()) {
        console.log('Server Response:', message);
        const parsed = JSON.parse(message);
        
        responseCount++;
        
        if (responseCount === 1) {
          // After initialization, list tools
          console.log('Sending list tools request...');
          serverProcess.stdin.write(JSON.stringify(listToolsMessage) + '\n');
        } else if (responseCount === 2) {
          // After listing tools, call the tool
          console.log('Sending tool call request...');
          serverProcess.stdin.write(JSON.stringify(callToolMessage) + '\n');
        } else if (responseCount === 3) {
          // Process the final result
          if (parsed.result && parsed.result.content) {
            console.log('\n=== FINAL RESULT ===');
            
            for (const content of parsed.result.content) {
              if (content.type === 'text') {
                console.log('Text:', content.text);
              } else if (content.type === 'image' && content.data) {
                console.log('Image received as base64 (length:', content.data.length, ')');
                
                // Save the image for inspection
                const imageBuffer = Buffer.from(content.data, 'base64');
                writeFileSync('./test_result.jpg', imageBuffer);
                console.log('Image saved as test_result.jpg');
              }
            }
          }
          
          console.log('\nTest completed successfully!');
          serverProcess.kill();
        }
      }
    }
  } catch (e) {
    // Ignore parsing errors for incomplete messages
  }
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Send initialization message
console.log('Sending initialization request...');
serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');

// Timeout after 30 seconds
setTimeout(() => {
  console.log('Test timeout reached');
  serverProcess.kill();
}, 30000);
