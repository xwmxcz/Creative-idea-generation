
import React, { useState, useRef, useCallback } from 'react';
import { generateAudioFromImage } from '../services/geminiService';
import { fileToBase64, decode, decodeAudioData } from '../services/utils';
import Card from './shared/Card';
import FileInput from './shared/FileInput';
import Spinner from './shared/Spinner';
import { IconVolume, IconPlay, IconPause } from './shared/Icon';

const ImageToAudio: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('Generate a short, enthusiastic audio introduction for this product.');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<string>('');

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopAudio = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const playAudio = useCallback(() => {
        if (audioBuffer && audioContextRef.current) {
            stopAudio();
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
            };
            source.start(0);
            audioSourceRef.current = source;
            setIsPlaying(true);
        }
    }, [audioBuffer, stopAudio]);

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
        setAudioBuffer(null);
        stopAudio();

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (audioContextRef.current.state === 'suspended') {
                 await audioContextRef.current.resume();
            }

            const imageBase64 = await fileToBase64(imageFile);
            
            setLoadingStep("Analyzing image and generating script...");
            const audioBase64 = await generateAudioFromImage(prompt, imageBase64, imageFile.type);
            
            setLoadingStep("Decoding audio data...");
            const decodedBytes = decode(audioBase64);
            const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
            setAudioBuffer(buffer);

        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unknown error occurred while generating audio.");
        } finally {
            setLoading(false);
            setLoadingStep('');
        }
    };

    const togglePlayback = () => {
        if(isPlaying) {
            stopAudio();
        } else {
            playAudio();
        }
    }

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <IconVolume className="w-8 h-8 text-teal-400" />
                <h2 className="text-2xl font-bold">Image to Audio Generator</h2>
            </div>
            <p className="mb-6 text-slate-400">Upload an image and provide a prompt to generate a high-quality audio description or advertisement.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FileInput onFileChange={handleFileChange} preview={imagePreview} />
                </div>
                <div>
                    <label htmlFor="prompt-audio" className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                    <textarea
                        id="prompt-audio"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Describe this scene in a calm, soothing voice"
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !prompt || !imageFile}
                        className="w-full mt-4 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner/> : <IconVolume/>}
                        {loading ? 'Generating...' : 'Generate Audio'}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

            {(loading || audioBuffer) && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Result</h3>
                    <div className="w-full p-4 bg-slate-800 rounded-lg flex items-center justify-center">
                        {loading ? (
                            <div className="text-center">
                                <Spinner size="lg" />
                                <p className="mt-2 text-slate-400">{loadingStep}</p>
                            </div>
                        ) : audioBuffer && (
                            <button onClick={togglePlayback} className="bg-slate-700 hover:bg-slate-600 rounded-full p-4 transition-colors">
                                {isPlaying ? <IconPause className="w-8 h-8 text-white"/> : <IconPlay className="w-8 h-8 text-white"/>}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ImageToAudio;
