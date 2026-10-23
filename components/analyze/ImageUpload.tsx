'use client';

import React, { useRef } from 'react';
import { Image as ImageIcon, X, UploadCloud, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="field-image-upload"
          className="text-xs font-semibold text-foreground flex items-center gap-1.5"
        >
          <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>Optional Field Photo / Document Intake</span>
        </label>
        <span className="text-[11px] text-muted-foreground">PNG, JPG, WebP (max 5MB)</span>
      </div>

      <input
        ref={fileInputRef}
        id="field-image-upload"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        aria-label="Upload field photo or incident document"
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
          aria-label="Click or press enter to attach a field photo"
          className={`group flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/70 p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <UploadCloud className="h-6 w-6 text-muted-foreground transition-transform group-hover:scale-110 mb-1" />
          <p className="text-xs font-medium text-foreground">
            Drop an incident photo or <span className="text-primary underline">browse</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Attach visual evidence (damage, medical need, signboards)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 p-2.5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.previewUrl}
                alt={`Uploaded photo: ${attachment.name}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden text-left">
              <p className="truncate text-xs font-semibold text-foreground">
                {attachment.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {(attachment.size / 1024).toFixed(1)} KB • Image attached
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={attachment.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Open full size image"
              aria-label="Open image in new tab"
            >
              <Eye className="h-4 w-4" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label="Remove attached image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
