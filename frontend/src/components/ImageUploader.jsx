import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, ImageIcon } from 'lucide-react';

/**
 * ImageUploader – drag & drop / browse component.
 * Converts picked images to base64 and calls onImagesChange(base64Array).
 */
const ImageUploader = ({ onImagesChange, maxImages = 5, accent = 'primary' }) => {
  const [previews, setPreviews] = useState([]);   // [{ dataUrl, name }]
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output as WebP with 80% quality
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processFiles = useCallback((files) => {
    const remaining = maxImages - previews.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      compressImage(file, (dataUrl) => {
        setPreviews((prev) => {
          const next = [...prev, { dataUrl, name: file.name }];
          onImagesChange(next.map((p) => p.dataUrl));
          return next;
        });
      });
    });
  }, [previews, maxImages, onImagesChange]);

  const remove = (idx) => {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      onImagesChange(next.map((p) => p.dataUrl));
      return next;
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const borderColor = accent === 'primary' ? 'border-red-300 hover:border-red-400' : 'border-indigo-300 hover:border-indigo-400';
  const bgActive   = accent === 'primary' ? 'bg-red-50'    : 'bg-indigo-50';
  const textAccent = accent === 'primary' ? 'text-red-500'  : 'text-indigo-500';

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => previews.length < maxImages && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-all
          ${dragging ? `${bgActive} ${borderColor} scale-[1.01]` : `bg-gray-50 ${borderColor}`}
          ${previews.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <UploadCloud size={36} className={`${textAccent} transition-transform ${dragging ? 'scale-110' : ''}`} />
        <div className="text-center">
          <p className="font-bold text-gray-700 text-sm">
            Drag & drop images here, or{' '}
            <span className={`${textAccent} underline underline-offset-2`}>browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, WEBP up to 5 MB · max {maxImages} images
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {previews.map((p, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(idx); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-500 rounded-full p-1 shadow"
                >
                  <X size={16} />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold">
                  COVER
                </span>
              )}
            </div>
          ))}
          {previews.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
            >
              <ImageIcon size={20} />
              <span className="text-[10px] mt-1 font-bold">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
