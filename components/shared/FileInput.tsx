
import React, { useCallback, useState } from 'react';
import { IconUpload } from './Icon';

interface FileInputProps {
  onFileChange: (file: File | null) => void;
  preview: string | null;
}

const FileInput: React.FC<FileInputProps> = ({ onFileChange, preview }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onFileChange(file);
    } else if (file) {
      alert('Please upload a valid image file.');
      onFileChange(null);
    } else {
       onFileChange(null);
    }
  }, [onFileChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-slate-700/50' : 'border-slate-600 bg-slate-800 hover:bg-slate-700/80'}`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="object-contain w-full h-full rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <IconUpload className="w-10 h-10 mb-3 text-slate-400" />
            <p className="mb-2 text-sm text-slate-400">
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, GIF, or WEBP</p>
          </div>
        )}
        <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept="image/*"
        />
      </label>
    </div>
  );
};

export default FileInput;
