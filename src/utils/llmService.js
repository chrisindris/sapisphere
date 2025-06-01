import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Function to calculate similarity between two expertises using LLM
const calculateExpertiseSimilarity = async (expertise1, expertise2) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Rate the similarity between these two areas of expertise on a scale of 0 to 100, where 0 means completely unrelated and 100 means identical or extremely closely related.
    Consider factors like:
    - Shared knowledge domains
    - Common skills and tools
    - Typical career paths
    - Educational background
    - Industry overlap
    
    Expertise 1: "${expertise1}"
    Expertise 2: "${expertise2}"
    
    Respond with ONLY a number between 0 and 100.`;

    const result = await model.generateContent(prompt);
    const similarity = parseInt((await result.response).text().trim());
    
    // Ensure the result is a valid number between 0 and 100
    return Math.min(Math.max(isNaN(similarity) ? 50 : similarity, 0), 100);
  } catch (error) {
    console.error('Error calculating expertise similarity:', error);
    return 50; // Default to middle value on error
  }
};

// Function to update expertise similarities in Firestore
const updateExpertiseSimilarities = async (newExpertise) => {
  try {
    // Get all existing expertises
    const expertisesSnapshot = await getDocs(collection(db, 'expertises'));
    const existingExpertises = expertisesSnapshot.docs.map(doc => doc.id);
    
    // Calculate similarities with existing expertises
    const similarities = {};
    for (const existingExpertise of existingExpertises) {
      const similarity = await calculateExpertiseSimilarity(newExpertise, existingExpertise);
      similarities[existingExpertise] = similarity;
    }
    
    // Add the new expertise document
    await setDoc(doc(db, 'expertises', newExpertise), {
      similarity: similarities
    });
    
    // Update existing expertise documents with similarity to the new expertise
    for (const existingExpertise of existingExpertises) {
      const existingDoc = await getDoc(doc(db, 'expertises', existingExpertise));
      if (existingDoc.exists()) {
        const existingData = existingDoc.data();
        await setDoc(doc(db, 'expertises', existingExpertise), {
          similarity: {
            ...existingData.similarity,
            [newExpertise]: similarities[existingExpertise]
          }
        });
      }
    }
  } catch (error) {
    console.error('Error updating expertise similarities:', error);
  }
};

export const generateLLMResponse = async (userPost, userExpertise = []) => {
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

    // Create a prompt for the regular response that includes user's expertise
    const expertiseContext = userExpertise.length > 0 
      ? `The user has demonstrated expertise in: ${userExpertise.join(', ')}. `
      : '';
    
    const responsePrompt = `You are a helpful AI assistant. ${expertiseContext}A user has posted the following message: "${userPost}". 
    Please provide a thoughtful, engaging, and helpful response. Keep your response concise and relevant.
    ${expertiseContext ? 'You can reference their expertise when appropriate, but don\'t force it if not relevant.' : ''}`;

    console.log('Sending expertise prompt:', expertisePrompt);
    console.log('Sending response prompt:', responsePrompt);

    // Generate content for both prompts
    const [expertiseResult, responseResult] = await Promise.all([
      model.generateContent(expertisePrompt),
      model.generateContent(responsePrompt)
    ]);

    const expertise = (await expertiseResult.response).text().trim();
    const response = (await responseResult.response).text();

    console.log('Expertise analysis result:', expertise);
    console.log('Response result:', response);

    // Only set detectedExpertise if it's not "NO_EXPERTISE"
    const hasExpertise = expertise !== "NO_EXPERTISE";

    // If new expertise is detected, update the similarities
    if (hasExpertise) {
      await updateExpertiseSimilarities(expertise);
    }

    return {
      text: response,
      modelName: "Gemini 1.5 Flash",
      detectedExpertise: hasExpertise ? expertise : null,
      expertiseAnalysis: expertise // Include the raw expertise analysis
    };
  } catch (error) {
    console.error('Error generating LLM response:', error);
    return null;
  }
}; 