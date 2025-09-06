import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyBnWqnVLgQ8yj_uAOfepTQupfwWWeGu2C4';

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

export async function generateResponse(prompt: string, imageData?: string): Promise<string> {
  try {
    if (imageData) {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: 'image/jpeg'
          }
        }
      ]);
      return result.response.text();
    } else {
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, but I encountered an error processing your question. Please try again.';
  }
}
