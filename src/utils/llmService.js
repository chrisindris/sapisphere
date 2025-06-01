import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const generateLLMResponse = async (userPost) => {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt for the LLM to analyze expertise
    const expertisePrompt = `Analyze the following post for any indication of the user's expertise or professional knowledge. 
    If you detect expertise, respond with a single short sentence (under 10 words) describing their expertise.
    If no clear expertise is indicated, respond with "NO_EXPERTISE".
    Post: "${userPost}"`;

    // Create a prompt for the regular response
    const responsePrompt = `You are a helpful AI assistant. A user has posted the following message: "${userPost}". 
    Please provide a thoughtful, engaging, and helpful response. Keep your response concise and relevant.`;

    // Generate content for both prompts
    const [expertiseResult, responseResult] = await Promise.all([
      model.generateContent(expertisePrompt),
      model.generateContent(responsePrompt)
    ]);

    const expertise = (await expertiseResult.response).text();
    const response = (await responseResult.response).text();

    return {
      text: response,
      modelName: "Gemini 1.5 Flash",
      detectedExpertise: expertise !== "NO_EXPERTISE" ? expertise : null
    };
  } catch (error) {
    console.error('Error generating LLM response:', error);
    return null;
  }
}; 