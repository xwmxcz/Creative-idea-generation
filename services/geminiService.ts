
import { GoogleGenAI, Modality } from "@google/genai";

// This file assumes `process.env.API_KEY` is available globally.
// In a real Vite/Create React App, this would be `import.meta.env.VITE_API_KEY` or `process.env.REACT_APP_API_KEY`.

// --- VIDEO GENERATION ---

export const generateVideoFromImage = async (prompt: string, imageBase64: string, mimeType: string) => {
    // A new instance must be created before each call to use the latest key from the dialog.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });
    return operation;
};

export const checkVideoOperation = async (operation: any) => {
    // A new instance must be created before each call to use the latest key from the dialog.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.operations.getVideosOperation({ operation: operation });
};

// --- IMAGE GENERATION ---

export const generateImageFromImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No image data found in the response.");
};


// --- AUDIO GENERATION ---

export const generateAudioFromImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Step 1: Generate a text description from the image and prompt
    const textGenPrompt = `Based on the user's request and the provided image, generate a concise and engaging script for an audio introduction. The script should be ready for text-to-speech. User's request: "${prompt}"`;
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: textGenPrompt },
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                }
            ]
        }
    });
    const script = textResponse.text;

    if (!script) {
        throw new Error("Failed to generate a script from the image.");
    }

    // Step 2: Use the generated script to create audio
    const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("Failed to generate audio from the script.");
    }
    return base64Audio;
};
