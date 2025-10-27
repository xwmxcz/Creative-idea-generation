
import React, { useState } from 'react';
import { generateImageFromImage } from '../services/geminiService';
import { fileToBase64 } from '../services/utils';
import Card from './shared/Card';
import FileInput from './shared/FileInput';
import Spinner from './shared/Spinner';
import { IconPhoto } from './shared/Icon';

const ImageToImage: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('Create a professional product shot of this item on a clean, white background with soft lighting.');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

        setLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageBase64 = await fileToBase64(imageFile);
            const resultBase64 = await generateImageFromImage(prompt, imageBase64, imageFile.type);
            setGeneratedImage(`data:image/png;base64,${resultBase64}`);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unknown error occurred while generating the image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <IconPhoto className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold">Image to Image Generator</h2>
            </div>
            <p className="mb-6 text-slate-400">Upload a product photo and describe the desired outcome to generate a new, enhanced image perfect for marketing.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FileInput onFileChange={handleFileChange} preview={imagePreview} />
                </div>
                <div>
                    <label htmlFor="prompt-image" className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                    <textarea
                        id="prompt-image"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Place this on a marble countertop with a blurred kitchen background"
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !prompt || !imageFile}
                        className="w-full mt-4 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner/> : <IconPhoto/>}
                        {loading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

             {(loading || generatedImage) && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Result</h3>
                    <div className="w-full aspect-square bg-slate-800 rounded-lg flex items-center justify-center">
                        {loading ? (
                            <div className="text-center">
                                <Spinner size="lg" />
                                <p className="mt-2 text-slate-400">Generating your image...</p>
                            </div>
                        ) : generatedImage && (
                            <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg" />
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ImageToImage;
