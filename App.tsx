import React, { useState, useCallback } from 'react';
import { CreativeMode } from './types';
import ImageToVideo from './components/ImageToVideo';
import ImageToImage from './components/ImageToImage';
import ImageToAudio from './components/ImageToAudio';
import { IconVideo, IconPhoto, IconVolume } from './components/shared/Icon';

// FIX: Moved NavButton outside the App component to prevent it from being redeclared on every render.
// This is a React best practice and resolves a TypeScript type inference issue with the `children` prop.
const NavButton = ({
  activeMode,
  targetMode,
  onClick,
  icon,
  children,
}: {
  activeMode: CreativeMode;
  targetMode: CreativeMode;
  onClick: (mode: CreativeMode) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    onClick={() => onClick(targetMode)}
    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
      activeMode === targetMode
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{children}</span>
  </button>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<CreativeMode>(CreativeMode.VIDEO);

  const renderContent = useCallback(() => {
    switch (mode) {
      case CreativeMode.VIDEO:
        return <ImageToVideo />;
      case CreativeMode.IMAGE:
        return <ImageToImage />;
      case CreativeMode.AUDIO:
        return <ImageToAudio />;
      default:
        return null;
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Creative Suite
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
            Transform your images into stunning videos, detailed product shots, or engaging audio descriptions with the power of Gemini.
          </p>
        </header>

        <nav className="flex justify-center items-center gap-2 sm:gap-4 mb-8 p-2 bg-slate-800/50 rounded-xl max-w-md mx-auto">
          <NavButton activeMode={mode} targetMode={CreativeMode.VIDEO} onClick={setMode} icon={<IconVideo />}>
            Image to Video
          </NavButton>
          <NavButton activeMode={mode} targetMode={CreativeMode.IMAGE} onClick={setMode} icon={<IconPhoto />}>
            Image to Image
          </NavButton>
          <NavButton activeMode={mode} targetMode={CreativeMode.AUDIO} onClick={setMode} icon={<IconVolume />}>
            Image to Audio
          </NavButton>
        </nav>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
