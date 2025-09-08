import { GoogleGenerativeAI } from '@google/generative-ai';

export class AISelectionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('[AISelectionService] Warning: GOOGLE_AI_API_KEY not found in environment variables');
      console.error('[AISelectionService] Please set your Google AI API key to use Flash 2.5 for image selection');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
    // Use Gemini 2.0 Flash (latest model)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async selectBestImage(compositeImageBase64: string, originalQuery: string): Promise<number> {
    try {
      if (!process.env.GOOGLE_AI_API_KEY) {
        console.error('[AISelectionService] No API key available, using fallback selection');
        return this.fallbackSelection(originalQuery);
      }

      console.error('[AISelectionService] Using Google AI to analyze images...');

      const prompt = `I need you to analyze this composite image that contains multiple numbered images (1-20) arranged in a grid. Each image is labeled with a number in a black border.

Your task: Tell me which numbered image is most relevant to this search query: "${originalQuery}"

Instructions:
1. Look at each numbered image in the composite
2. Evaluate how well each image matches the query "${originalQuery}"
3. Consider relevance, quality, and how well it represents the concept
4. Return ONLY the number (1-20) of the best matching image
5. Do not include any explanation, just the number

Query: ${originalQuery}

Please respond with only the number of the best matching image.`;

      const result = await this.model.generateContent([
        {
          inlineData: {
            data: compositeImageBase64,
            mimeType: "image/jpeg"
          }
        },
        prompt
      ]);

      const response = await result.response;
      const text = response.text().trim();
      
      console.error(`[AISelectionService] AI response: ${text}`);

      // Parse the response to get the number
      const selectedNumber = this.parseAIResponse(text);
      
      if (selectedNumber >= 1 && selectedNumber <= 20) {
        return selectedNumber;
      } else {
        console.error(`[AISelectionService] Invalid number from AI: ${selectedNumber}, using fallback`);
        return this.fallbackSelection(originalQuery);
      }

    } catch (error) {
      console.error('[AISelectionService] Error with AI selection:', error);
      return this.fallbackSelection(originalQuery);
    }
  }

  private parseAIResponse(response: string): number {
    // Extract number from the response
    const match = response.match(/\b(\d+)\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Try to find written numbers
    const numberWords: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
      'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
      'nineteen': 19, 'twenty': 20
    };
    
    const lowerResponse = response.toLowerCase();
    for (const [word, num] of Object.entries(numberWords)) {
      if (lowerResponse.includes(word)) {
        return num;
      }
    }
    
    return 1; // Default fallback
  }

  private fallbackSelection(query: string): number {
    // Simple fallback logic - could be enhanced with keyword matching
    const hash = this.simpleHash(query);
    return (hash % 20) + 1;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
