import { useState, useRef } from 'react';
import { uploadToCloudinary, isCloudinaryConfigured } from '../cloudinary';
import { compressImage } from '../utils';

export default function CloudinaryUpload({ onUploaded, accept = 'image/*', label = 'Upload', multiple = false, existingItems = [] }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState(existingItems);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const results = [];
    for (const file of Array.from(files)) {
      try {
        if (isCloudinaryConfigured()) {
          // Real Cloudinary upload
          const result = await uploadToCloudinary(file, setProgress);
          results.push(result);
        } else {
          // Fallback: compress and use base64
          setProgress(30);
          const isVideo = file.type.startsWith('video/');
          if (isVideo) {
            // For video fallback, use object URL (session only)
            const url = URL.createObjectURL(file);
            results.push({ url, type: 'video', thumbnail: null, isLocal: true, fileName: file.name });
          } else {
            const src = await compressImage(file, 1200, 0.8);
            results.push({ url: src, type: 'image', thumbnail: src, isLocal: false });
          }
          setProgress(100);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    const newItems = [...items, ...results];
    setItems(newItems);
    onUploaded && onUploaded(newItems);
    setUploading(false);
    setProgress(0);
  }

  function removeItem(idx) {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    onUploaded && onUploaded(newItems);
  }

  const isImage = accept.includes('image');
  const isVideo = accept.includes('video');

  return (
    <div>
      <div
        className={`upload-area${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{ borderColor: dragOver ? 'var(--teal)' : undefined }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: 28, marginBottom: 8 }}>{isVideo ? '🎬' : '🖼️'}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>
          {uploading ? `Uploading... ${progress}%` : `${label} — click or drag here`}
        </div>
        <div style={{ fontSize: 11, color: '#aaa' }}>
          {isCloudinaryConfigured()
            ? 'Uploaded permanently to cloud'
            : isVideo
              ? '⚠️ Video uploads are session-only until Cloudinary is set up — use YouTube links for permanent videos'
              : 'Photos saved permanently in browser'
          }
        </div>
        {uploading && (
          <div className="upload-progress">
            <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="uploaded-preview">
          {items.map((item, idx) => (
            <div key={idx} className="uploaded-thumb">
              {item.type === 'video' ? (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🎬
                </div>
              ) : (
                <img src={item.thumbnail || item.url} alt="" />
              )}
              <button className="uploaded-thumb-remove" onClick={e => { e.stopPropagation(); removeItem(idx); }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
