import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const generateLLMResponse = async (userPost) => {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt for the LLM
    const prompt = `You are a helpful AI assistant. A user has posted the following message: "${userPost}". 
    Please provide a thoughtful, engaging, and helpful response. Keep your response concise and relevant.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating LLM response:', error);
    return null;
  }
}; 