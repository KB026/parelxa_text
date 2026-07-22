import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  bucket: string;
  folder: string;
  multiple?: boolean;
  maxFiles?: number;
  value: string | string[];
  onChange: (url: string | string[]) => void;
  label?: string;
  helperText?: string;
}

export function ImageUpload({ bucket, folder, multiple = false, maxFiles = 6, value, onChange, label, helperText }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const filesToUpload = Array.from(e.target.files);
      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        if (currentUrls.length + filesToUpload.length > maxFiles) {
          alert(`You can only upload up to ${maxFiles} images.`);
          return;
        }
      }

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 5MB limit.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Attempt server-side upload via API route first
        let uploadedUrl: string | null = null;
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bucket', bucket);
          formData.append('filePath', filePath);

          const apiRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.publicUrl) {
              uploadedUrl = apiData.publicUrl;
            }
          }
        } catch (apiErr) {
          console.warn('Server upload route failed, falling back to client upload:', apiErr);
        }

        // Fallback to direct client Supabase storage upload if API route was not used or failed
        if (!uploadedUrl) {
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          uploadedUrl = data.publicUrl;
        }

        newUrls.push(uploadedUrl);
      }

      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentUrls, ...newUrls]);
      } else {
        onChange(newUrls[newUrls.length - 1]);
      }
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((_, idx) => idx !== indexToRemove));
    } else {
      onChange('');
    }
  };

  const renderPreviews = () => {
    const urls = Array.isArray(value) ? value : (value ? [value] : []);
    if (urls.length === 0) return null;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
        {urls.map((url, idx) => (
          <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <img src={url} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              type="button" 
              onClick={() => removeImage(idx)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="listing-field">
      {label && <label className="listing-label">{label} {helperText && <span className="optional">({helperText})</span>}</label>}
      <div style={{ position: 'relative' }}>
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          multiple={multiple}
          onChange={handleFileChange} 
          disabled={uploading}
          style={{ 
            position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: uploading ? 'not-allowed' : 'pointer', zIndex: 10 
          }} 
        />
        <div style={{ 
          border: '2px dashed var(--border-subtle)', borderRadius: '12px', padding: '24px', 
          textAlign: 'center', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s ease', color: 'var(--text-muted)'
        }}>
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              <div style={{ fontSize: '14px' }}>Uploading...</div>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8" />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Click or drag files to upload</div>
              <div style={{ fontSize: '12px' }}>PNG, JPG or WEBP (Max 5MB)</div>
            </>
          )}
        </div>
      </div>
      {renderPreviews()}
    </div>
  );
}
