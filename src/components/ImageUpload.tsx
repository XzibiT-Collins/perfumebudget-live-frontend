import React, { useCallback } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../utils';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxFiles = 1,
  className
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange([...images, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, maxFiles, onChange]);

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: images.length >= maxFiles,
    multiple: maxFiles > 1,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <img 
              src={url} 
              alt={`Uploaded ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {images.length < maxFiles && (
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-accent bg-accent/5" 
                : "border-[#E5E5E5] dark:border-zinc-800 hover:border-accent/50 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-3 rounded-full bg-[#F5F5F5] dark:bg-zinc-800 mb-2">
              <Upload className="h-5 w-5 text-[#999999]" />
            </div>
            <p className="text-xs font-medium text-[#666666] dark:text-zinc-400 text-center px-2">
              {isDragActive ? "Drop here" : "Upload Image"}
            </p>
            <p className="text-[10px] text-[#999999] mt-1">
              {images.length}/{maxFiles}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
