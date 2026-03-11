import { GoogleGenAI, Type, Schema, ThinkingLevel, Modality } from '@google/genai';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateWeatherSuggestion(city: string, temperature: number, condition: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given that the current weather in ${city} is ${temperature}°C and ${condition}, suggest suitable travel activities. Keep it concise (1-2 sentences).`,
    });
    return response.text || "Enjoy your trip!";
  } catch (error) {
    console.error("Error generating weather suggestion:", error);
    return "Enjoy your trip!";
  }
}

export async function generateItinerary(preferences: any, duration: number): Promise<{ plan: any[], thinking?: string }> {
  try {
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          location: { type: Type.STRING },
          weather: { type: Type.STRING },
        },
        required: ["day", "title", "description", "location", "weather"]
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a ${duration}-day cultural travel itinerary based on these preferences: ${JSON.stringify(preferences)}. 
      Use Google Search to find real, up-to-date locations and events. 
      Return the response as a JSON array of daily plans.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    
    if (response.text) {
      return { 
        plan: JSON.parse(response.text),
        thinking: response.candidates?.[0]?.avgLogprobs !== undefined ? "Thinking complete..." : undefined // Placeholder for thinking feedback
      };
    }
    return { plan: [] };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return { plan: [] };
  }
}

export async function getChatbotResponse(message: string, history: any[]): Promise<{ text: string, links?: { title: string, uri: string }[] }> {
  try {
    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: contents,
      config: {
        systemInstruction: `You are "Aria," a world-class cultural historian and passionate travel explorer for Cultural AI. 
Your personality is engaging, evocative, and deeply knowledgeable about the world's diverse heritage.

Guidelines for your immersive personality:
1. **Cultural Storyteller:** Don't just list facts. Share brief, fascinating historical anecdotes or the "why" behind local traditions to create an immersive experience.
2. **Nuanced Etiquette:** Go beyond basic tips. Explain the subtle social cues and cultural philosophies (like Japanese 'Omotenashi' or Danish 'Hygge') that define a place.
3. **Engaging Tone:** Be enthusiastic, warm, and sophisticated. Use descriptive language that paints a picture of the destination.
4. **Multilingual Adaptability:** Seamlessly adapt to the user's language while occasionally weaving in beautiful, untranslatable local words (with their meanings).
5. **Practical Expert:** While being evocative, remain highly practical. Include specific hidden gems, seasonal nuances, and realistic budget advice.
6. **Real-time Grounding:** Use your search capabilities to provide up-to-the-minute information on festivals, local events, and current travel conditions.
7. **Formatting:** Use elegant formatting (bolding, bullet points, and clear sections) to ensure your rich insights are easy to digest.`,
        tools: [{ googleSearch: {} }],
        temperature: 0.8,
      }
    });
    
    const text = response.text || "I'm sorry, I couldn't process that.";
    
    let links: { title: string, uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }
    
    // Remove duplicate links
    links = links.filter((link, index, self) => 
      index === self.findIndex((t) => t.uri === link.uri)
    );

    return { text, links: links.length > 0 ? links : undefined };
  } catch (error) {
    console.error("Error with chatbot:", error);
    return { text: "I'm sorry, I'm having trouble connecting right now." };
  }
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly and naturally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

export async function generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | null> {
  try {
    const hasPaidKey = !!process.env.API_KEY;
    const model = hasPaidKey ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    if (hasPaidKey) {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
    }

    const dynamicAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

    const response = await dynamicAi.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          ...(hasPaidKey ? { imageSize: "1K" } : {})
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Error generating image:", error);
    const errorMessage = error.message || "";
    
    // If Pro model failed due to permissions, try falling back to the free model
    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Requested entity was not found')) {
      if (process.env.API_KEY) {
        console.log("Falling back to free image model...");
        try {
          const freeAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const freeResponse = await freeAi.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: aspectRatio as any } }
          });
          for (const part of freeResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
          }
        } catch (fallbackError) {
          console.error("Fallback image generation failed:", fallbackError);
        }
      }
      
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    }
    return null;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text to ${targetLanguage}: "${text}". Return only the translated text.`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Error translating text:", error);
    return text;
  }
}

export async function generateTripVideo(prompt: string): Promise<string | null> {
  try {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const dynamicAi = new GoogleGenAI({ apiKey });

    let operation = await dynamicAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await dynamicAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 404) {
        if (window.aistudio) await window.aistudio.openSelectKey();
      }
      return null;
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Error generating video:", error);
    const errorMessage = error.message || "";
    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Requested entity was not found')) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      }
      throw new Error("Video generation requires a Paid Gemini API key with Veo access. Please ensure you have selected a valid key.");
    }
    throw error;
  }
}

export async function analyzeImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: "You are a cultural expert. Analyze the provided image and answer the user's question with deep cultural, historical, or practical travel insights."
      }
    });
    return response.text || "I couldn't analyze this image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "An error occurred during analysis.";
  }
}

export async function generatePackingList(destination: string, duration: number, season: string, interests: string[]): Promise<string[]> {
  try {
    const schema: Schema = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a smart packing list for a ${duration}-day trip to ${destination} during ${season}. 
      Interests include: ${interests.join(', ')}. 
      Include essentials, weather-specific gear, and interest-based items. 
      Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Error generating packing list:", error);
    return [];
  }
}

export async function generateLocalEtiquette(destination: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a concise guide on local etiquette, tipping culture, and 5 essential phrases for a traveler visiting ${destination}. Use markdown formatting.`,
      config: {
        systemInstruction: "You are a global etiquette expert."
      }
    });
    return response.text || "No etiquette data available.";
  } catch (error) {
    console.error("Error generating etiquette:", error);
    return "Failed to load etiquette guide.";
  }
}

export async function expandJournalEntry(notes: string, destination: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `I visited ${destination}. Here are my raw notes: "${notes}". 
      Expand these notes into a beautiful, evocative travel journal entry (about 200-300 words). 
      Use descriptive language and capture the atmosphere.`,
      config: {
        systemInstruction: "You are a professional travel writer."
      }
    });
    return response.text || "Failed to expand journal.";
  } catch (error) {
    console.error("Error expanding journal:", error);
    return "An error occurred while writing your story.";
  }
}

export async function generateBudgetEstimate(destination: string, duration: number, budgetLevel: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed budget estimate for a ${duration}-day trip to ${destination} for a ${budgetLevel} traveler. 
      Break it down by Accommodation, Food, Transport, and Activities. 
      Use local currency and USD. Use markdown table formatting.`,
      config: {
        systemInstruction: "You are a travel finance expert."
      }
    });
    return response.text || "Budget data unavailable.";
  } catch (error) {
    console.error("Error generating budget:", error);
    return "Failed to load budget estimate.";
  }
}

export async function refineItinerary(currentPlan: any[], request: string): Promise<any[]> {
  try {
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          location: { type: Type.STRING },
          weather: { type: Type.STRING },
        },
        required: ["day", "title", "description", "location", "weather"]
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current Itinerary: ${JSON.stringify(currentPlan)}. 
      User request for refinement: "${request}". 
      Modify the itinerary based on this request while keeping the structure identical. 
      Return the updated itinerary as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return currentPlan;
  } catch (error) {
    console.error("Error refining itinerary:", error);
    return currentPlan;
  }
}

export async function generatePhrasebook(destination: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a comprehensive travel phrasebook for ${destination}. 
      Include categories like Greetings, Dining, Emergency, and Shopping. 
      For each phrase, provide the English version, the local language version, and a phonetic pronunciation. 
      Use markdown table formatting.`,
      config: {
        systemInstruction: "You are a professional linguist and travel guide."
      }
    });
    return response.text || "Phrasebook unavailable.";
  } catch (error) {
    console.error("Error generating phrasebook:", error);
    return "Failed to load phrasebook.";
  }
}

export async function generateSafetyTips(destination: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide essential safety and health tips for a traveler visiting ${destination}. 
      Include information on common scams, safe areas vs areas to avoid, water safety, emergency numbers, and required vaccinations or health precautions. 
      Use markdown formatting with clear headings.`,
      config: {
        systemInstruction: "You are a global travel safety consultant."
      }
    });
    return response.text || "Safety tips unavailable.";
  } catch (error) {
    console.error("Error generating safety tips:", error);
    return "Failed to load safety tips.";
  }
}

export async function generateHiddenGems(destination: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Find 5 'hidden gems' in ${destination} that are not typically found in major guidebooks. 
      For each gem, provide its name, why it's special, and how to get there. 
      Use Google Search to ensure these are real and relatively unknown. 
      Use markdown formatting.`,
      config: {
        systemInstruction: "You are a local insider and travel explorer.",
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Hidden gems unavailable.";
  } catch (error) {
    console.error("Error generating hidden gems:", error);
    return "Failed to load hidden gems.";
  }
}

export async function translateAndSpeak(text: string, targetLanguage: string): Promise<{ translatedText: string, audioUrl: string | null }> {
  try {
    const translation = await translateText(text, targetLanguage);
    const audioUrl = await generateSpeech(translation);
    return { translatedText: translation, audioUrl };
  } catch (error) {
    console.error("Error in translateAndSpeak:", error);
    return { translatedText: text, audioUrl: null };
  }
}

