
import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoFromImage, checkVideoOperation } from '../services/geminiService';
import { fileToBase64 } from '../services/utils';
import Card from './shared/Card';
import FileInput from './shared/FileInput';
import Spinner from './shared/Spinner';
import { IconVideo } from './shared/Icon';

const loadingMessages = [
    "Warming up the digital director's chair...",
    "Choreographing pixels into motion...",
    "Rendering your vision, frame by frame...",
    "This can take a few minutes, good things come to those who wait!",
    "Almost there, adding the final cinematic touches...",
];

const ImageToVideo: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A neon hologram of this subject driving at top speed');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);

    const checkApiKey = useCallback(async () => {
        try {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            } else {
                setApiKeySelected(false);
            }
        } catch (e) {
            console.error("Error checking API key:", e);
            setApiKeySelected(false);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    useEffect(() => {
        let interval: number;
        if (loading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleSelectKey = async () => {
        try {
            if(window.aistudio) {
                await window.aistudio.openSelectKey();
                // Assume success to avoid race condition and re-check on next action
                setApiKeySelected(true); 
            }
        } catch (e) {
            console.error("Could not open API key dialog", e);
            setError("Failed to open API key selection. Please try again.");
        }
    };
    
    const handleFileChange = (file: File | null) => {
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async () => {
        if (!prompt || !imageFile) {
            setError("Please provide a prompt and an image.");
            return;
        }

        await checkApiKey();
        if (!apiKeySelected) {
             setError("Please select an API key to generate videos.");
             return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const imageBase64 = await fileToBase64(imageFile);
            let operation = await generateVideoFromImage(prompt, imageBase64, imageFile.type);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await checkVideoOperation(operation);
            }
            
            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const downloadLink = operation.response.generatedVideos[0].video.uri;
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch video: ${response.statusText}`);
                }
                const videoBlob = await response.blob();
                setVideoUrl(URL.createObjectURL(videoBlob));
            } else {
                throw new Error("Video generation completed but no video URI was found.");
            }
        } catch (e: any) {
            console.error(e);
            let errorMessage = e.message || "An unknown error occurred.";
            if (errorMessage.includes("Requested entity was not found")) {
                errorMessage = "API Key not found or invalid. Please re-select your key.";
                setApiKeySelected(false);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                 <IconVideo className="w-8 h-8 text-indigo-400" />
                <h2 className="text-2xl font-bold">Image to Video Generator</h2>
            </div>
            <p className="mb-6 text-slate-400">Upload an image, describe a scene, and watch it come to life as a short video. Note: Video generation can take several minutes.</p>

             {!apiKeySelected && (
                <div className="mb-4 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg text-center">
                    <p className="mb-2 text-yellow-300">An API key is required for video generation.</p>
                     <p className="text-sm text-yellow-400 mb-3">Billing is enabled for this feature. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200">Learn more</a></p>
                    <button onClick={handleSelectKey} className="bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                        Select API Key
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FileInput onFileChange={handleFileChange} preview={imagePreview} />
                </div>
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A cinematic shot of this car driving through a neon-lit city"
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !prompt || !imageFile || !apiKeySelected}
                        className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner/> : <IconVideo/>}
                        {loading ? 'Generating...' : 'Generate Video'}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

            {(loading || videoUrl) && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Result</h3>
                    <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                        {loading ? (
                             <div className="text-center">
                                <Spinner size="lg" />
                                <p className="mt-4 text-slate-400">{loadingMessage}</p>
                            </div>
                        ) : videoUrl && (
                            <video src={videoUrl} controls autoPlay loop className="w-full h-full rounded-lg" />
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ImageToVideo;
