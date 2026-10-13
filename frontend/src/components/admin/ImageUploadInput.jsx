import React, { useState, useRef } from 'react';
import { adminApi } from '../../services/api';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';

export default function ImageUploadInput({
  label,
  value,
  onChange,
  placeholder = "Image URL or upload from your device...",
  helpText = "Uploaded images are securely stored in the database.",
  required = false
}) {
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name);

    setUploading(true);
    try {
      const res = await adminApi.uploadMedia(formData);
      // Backend returns ApiResponse<MediaFile> where res.data is the MediaFile object
      const mediaData = res?.data || res;
      const url = mediaData?.fileUrl || (typeof mediaData === 'string' ? mediaData : '');
      if (url) {
        onChange(url);
      } else {
        setErrorMsg('Uploaded, but could not read the generated image URL.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload photo to the database.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopy = () => {
    if (!value) return;
    const full = resolveMediaUrl(value);
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resolvedSrc = resolveMediaUrl(value);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Thumbnail Preview / Placeholder */}
        {value ? (
          <div className="w-16 h-16 rounded-2xl border border-stone-200 overflow-hidden shrink-0 bg-stone-100 shadow-xs relative group">
            <img
              src={resolvedSrc}
              alt="Uploaded visual preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <a
                href={resolvedSrc}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-stone-900 transition-colors"
                title="View full size"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center shrink-0 text-stone-400 bg-stone-50">
            <ImageIcon className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 font-bold uppercase tracking-wider">No Photo</span>
          </div>
        )}

        {/* Input & Action buttons */}
        <div className="flex-1 w-full space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white transition-all shadow-xs"
            />

            {value && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Image URL"
                className="p-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-600 transition-colors shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            )}

            {/* Direct File Upload Button */}
            <label
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0 shadow-xs ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>
          )}

          {helpText && !errorMsg && (
            <p className="text-[11px] text-stone-400">
              {helpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
