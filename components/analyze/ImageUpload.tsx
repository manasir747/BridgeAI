'use client';

import React, { useRef, useState } from 'react';
import { Image as ImageIcon, X, UploadCloud, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ImageAttachment {
  name: string;
  size: number;
  previewUrl: string;
  type: string;
}

interface ImageUploadProps {
  attachment: ImageAttachment | null;
  onAttachmentChange: (attachment: ImageAttachment | null) => void;
  disabled?: boolean;
}

export function ImageUpload({
  attachment,
  onAttachmentChange,
  disabled = false,
}: ImageUploadProps) {
  const { t, format } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t.upload.invalidType);
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError(format(t.upload.fileTooLarge, { size: (file.size / (1024 * 1024)).toFixed(1) }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onAttachmentChange({
      name: file.name,
      size: file.size,
      previewUrl,
      type: file.type,
    });
  };

  const handleRemove = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    onAttachmentChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContainerClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <label
          htmlFor="field-image-upload"
          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span>{t.upload.label}</span>
        </label>
        <span className="text-[11px] font-mono text-slate-400">{t.upload.formats}</span>
      </div>

      <input
        ref={fileInputRef}
        id="field-image-upload"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        aria-label={t.upload.inputAria}
      />

      {!attachment ? (
        <div
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleContainerClick();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label={t.upload.boxAria}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/40 p-6 sm:p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-all mb-2.5 shadow-sm">
            <UploadCloud className="h-6 w-6 transition-transform group-hover:scale-110" />
          </div>
          <p className="text-sm font-semibold text-slate-200 leading-snug">
            {t.upload.dropPrompt} <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-2">{t.upload.browse}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">
            {t.upload.subtext}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/80 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.previewUrl}
                alt={`Uploaded photo: ${attachment.name}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden text-left space-y-0.5">
              <p className="truncate text-xs sm:text-sm font-semibold text-slate-100">
                {attachment.name}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {(attachment.size / 1024).toFixed(1)} KB • {t.upload.imageAttached}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={attachment.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
              title="Open full size image"
              aria-label={t.upload.viewFullAria}
            >
              <Eye className="h-4 w-4" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 rounded-xl"
              aria-label={t.upload.removeAria}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-400 font-medium pt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
