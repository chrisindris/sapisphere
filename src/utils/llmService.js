import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const generateLLMResponse = async (userPost) => {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt for the LLM to analyze expertise
    const expertisePrompt = `Analyze the following post for any indication of the user's expertise or professional knowledge.
    Look for:
    1. Technical terms or jargon specific to a field
    2. Professional experience or qualifications mentioned
    3. Industry-specific knowledge or insights
    4. Professional roles or positions
    5. Educational background in a specific field
    
    If you detect any expertise, respond with a single short sentence (under 10 words) describing their expertise.
    Example: "Software Engineering" or "Data Science" or "Financial Analysis"
    
    If no clear expertise is indicated, respond with exactly "NO_EXPERTISE".
    
    Post: "${userPost}"`;

    // Create a prompt for the regular response
    const responsePrompt = `You are a helpful AI assistant. A user has posted the following message: "${userPost}". 
    Please provide a thoughtful, engaging, and helpful response. Keep your response concise and relevant.`;

    console.log('Sending expertise prompt:', expertisePrompt);

    // Generate content for both prompts
    const [expertiseResult, responseResult] = await Promise.all([
      model.generateContent(expertisePrompt),
      model.generateContent(responsePrompt)
    ]);

    const expertise = (await expertiseResult.response).text();
    const response = (await responseResult.response).text();

    console.log('Expertise analysis result:', expertise);
    console.log('Response result:', response);

    // Always return the expertise detection result, even if it's "NO_EXPERTISE"
    return {
      text: response,
      modelName: "Gemini 1.5 Flash",
      detectedExpertise: expertise !== "NO_EXPERTISE" ? expertise : null,
      expertiseAnalysis: expertise // Include the raw expertise analysis
    };
  } catch (error) {
    console.error('Error generating LLM response:', error);
    return null;
  }
}; 