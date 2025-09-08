import axios from 'axios';
import sharp from 'sharp';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';

export class ImageProcessingService {
  private readonly THUMBNAIL_WIDTH = 300;
  private readonly THUMBNAIL_HEIGHT = 200;
  private readonly GRID_COLS = 4;
  private readonly BORDER_WIDTH = 3;
  private readonly LABEL_HEIGHT = 30;

  async createLabeledComposite(imageUrls: string[]): Promise<string> {
    try {
      console.error(`[ImageProcessingService] Creating composite from ${imageUrls.length} images`);
      
      // Download and process images
      const processedImages = await this.downloadAndProcessImages(imageUrls);
      
      // Calculate grid dimensions
      const gridRows = Math.ceil(processedImages.length / this.GRID_COLS);
      const canvasWidth = this.GRID_COLS * (this.THUMBNAIL_WIDTH + this.BORDER_WIDTH * 2);
      const canvasHeight = gridRows * (this.THUMBNAIL_HEIGHT + this.LABEL_HEIGHT + this.BORDER_WIDTH * 2);
      
      // Create canvas
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      
      // Fill background with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw images in grid
      for (let i = 0; i < processedImages.length; i++) {
        const row = Math.floor(i / this.GRID_COLS);
        const col = i % this.GRID_COLS;
        
        const x = col * (this.THUMBNAIL_WIDTH + this.BORDER_WIDTH * 2) + this.BORDER_WIDTH;
        const y = row * (this.THUMBNAIL_HEIGHT + this.LABEL_HEIGHT + this.BORDER_WIDTH * 2) + this.BORDER_WIDTH;
        
        // Draw black border
        ctx.fillStyle = 'black';
        ctx.fillRect(x - this.BORDER_WIDTH, y - this.BORDER_WIDTH, 
                    this.THUMBNAIL_WIDTH + this.BORDER_WIDTH * 2, 
                    this.THUMBNAIL_HEIGHT + this.LABEL_HEIGHT + this.BORDER_WIDTH * 2);
        
        // Draw image
        if (processedImages[i]) {
          ctx.drawImage(processedImages[i], x, y, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
        }
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y + this.THUMBNAIL_HEIGHT, this.THUMBNAIL_WIDTH, this.LABEL_HEIGHT);
        
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((i + 1).toString(), 
                    x + this.THUMBNAIL_WIDTH / 2, 
                    y + this.THUMBNAIL_HEIGHT + this.LABEL_HEIGHT / 2 + 7);
      }
      
      // Convert to base64
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      return buffer.toString('base64');
      
    } catch (error) {
      console.error('[ImageProcessingService] Error creating composite:', error);
      throw new Error('Failed to create image composite');
    }
  }

  async downloadAndConvertToBase64(imageUrl: string): Promise<string> {
    try {
      console.error(`[ImageProcessingService] Downloading image: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Process with sharp to ensure consistent format
      const processedBuffer = await sharp(response.data)
        .jpeg({ quality: 90 })
        .toBuffer();
      
      return processedBuffer.toString('base64');
    } catch (error) {
      console.error(`[ImageProcessingService] Error downloading image ${imageUrl}:`, error);
      // Return a placeholder image base64
      return await this.createPlaceholderImageBase64();
    }
  }

  private async downloadAndProcessImages(imageUrls: string[]): Promise<any[]> {
    const images: any[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        console.error(`[ImageProcessingService] Processing image ${i + 1}/${imageUrls.length}`);
        
        const response = await axios.get(imageUrls[i], {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // Resize and convert to canvas-compatible format
        const resizedBuffer = await sharp(response.data)
          .resize(this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT, { fit: 'cover' })
          .jpeg()
          .toBuffer();
        
        // Load image into canvas
        const img = await loadImage(resizedBuffer);
        images.push(img);
        
      } catch (error) {
        console.error(`[ImageProcessingService] Error processing image ${i + 1}:`, error);
        // Add placeholder image
        const placeholder = await this.createPlaceholderImage();
        images.push(placeholder);
      }
    }
    
    return images;
  }

  private async createPlaceholderImage(): Promise<any> {
    // Create a simple placeholder image
    const canvas = createCanvas(this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
    const ctx = canvas.getContext('2d');
    
    // Gray background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
    
    // Border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);
    
    // Text
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Image not available', this.THUMBNAIL_WIDTH / 2, this.THUMBNAIL_HEIGHT / 2);
    
    return await loadImage(canvas.toBuffer());
  }

  private async createPlaceholderImageBase64(): Promise<string> {
    // Create a simple placeholder image as base64
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');
    
    // Gray background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 400, 300);
    
    // Border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 400, 300);
    
    // Text
    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Image not available', 200, 150);
    
    const buffer = canvas.toBuffer('image/jpeg');
    return buffer.toString('base64');
  }
}
