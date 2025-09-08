import axios from 'axios';

export interface ImageSearchResult {
  url: string;
  title?: string;
  thumbnail?: string;
}

export class ImageSearchService {
  private readonly UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  private readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  constructor() {
    if (!this.UNSPLASH_ACCESS_KEY && !this.PEXELS_API_KEY) {
      console.error('[ImageSearchService] Warning: No API keys found. Please set UNSPLASH_ACCESS_KEY or PEXELS_API_KEY in your .env file');
    }
  }

  async searchImages(query: string, maxImages: number = 20): Promise<string[]> {
    const imageUrls: string[] = [];

    try {
      // Try Unsplash first
      if (this.UNSPLASH_ACCESS_KEY && imageUrls.length < maxImages) {
        console.error('[ImageSearchService] Searching Unsplash...');
        const unsplashUrls = await this.searchUnsplash(query, Math.min(maxImages - imageUrls.length, 20));
        imageUrls.push(...unsplashUrls);
      }

      // Try Pexels if we need more images
      if (this.PEXELS_API_KEY && imageUrls.length < maxImages) {
        console.error('[ImageSearchService] Searching Pexels...');
        const pexelsUrls = await this.searchPexels(query, Math.min(maxImages - imageUrls.length, 20));
        imageUrls.push(...pexelsUrls);
      }

      // If no API keys are available, use placeholder images
      if (imageUrls.length === 0) {
        console.error('[ImageSearchService] No API keys available, using placeholder images...');
        imageUrls.push(...this.getPlaceholderImages(query, maxImages));
      }

      return imageUrls.slice(0, maxImages);
    } catch (error) {
      console.error('[ImageSearchService] Error searching images:', error);
      // Fallback to placeholder images
      return this.getPlaceholderImages(query, maxImages);
    }
  }

  private async searchUnsplash(query: string, count: number): Promise<string[]> {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          per_page: count,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
        },
        timeout: 10000
      });

      return response.data.results.map((photo: any) => photo.urls.regular);
    } catch (error) {
      console.error('[ImageSearchService] Unsplash search failed:', error);
      return [];
    }
  }

  private async searchPexels(query: string, count: number): Promise<string[]> {
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query,
          per_page: count,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': this.PEXELS_API_KEY
        },
        timeout: 10000
      });

      return response.data.photos.map((photo: any) => photo.src.large);
    } catch (error) {
      console.error('[ImageSearchService] Pexels search failed:', error);
      return [];
    }
  }

  private getPlaceholderImages(query: string, count: number): string[] {
    // Use Lorem Picsum as a fallback with different categories
    const categories = ['nature', 'technology', 'business', 'people', 'abstract', 'architecture'];
    const urls: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      const seed = encodeURIComponent(`${query}-${category}-${i}`);
      urls.push(`https://picsum.photos/800/600?random=${seed}`);
    }
    
    return urls;
  }
}
