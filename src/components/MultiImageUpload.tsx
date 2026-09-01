"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface MultiImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  initialImages?: string[];
}

interface UploadingFile {
  id: string;
  previewUrl: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMsg?: string;
}

const STORAGE_BUCKETS = ["venue-gallery", "venue_applications_images", "listings"];

export default function MultiImageUpload({
  onImagesChange,
  maxImages = 15,
  initialImages = []
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Sync with initialImages if updated externally
  useEffect(() => {
    if (initialImages && Array.isArray(initialImages)) {
      setImages(initialImages);
    }
  }, [JSON.stringify(initialImages)]);

  // Upload single file with bucket fallback
  const uploadSingleFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `uploads/${cleanFileName}`;

    let lastError: any = null;

    // Try primary bucket, then fallbacks if bucket not found
    for (const bucketName of STORAGE_BUCKETS) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          return publicUrl;
        }

        lastError = uploadError;
        // If error is not 'Bucket not found', don't retry other buckets
        if (!uploadError.message?.toLowerCase().includes("not found")) {
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (lastError) {
      console.error("Storage upload error:", lastError);
      throw new Error(lastError.message || "Bucket not found. Please ensure 'venue-gallery' storage bucket is created in Supabase.");
    }

    return null;
  };

  const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles).filter(f => f.type.startsWith('image/'));
    
    if (fileArray.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WebP)");
      return;
    }

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      toast.error(`You have reached the maximum limit of ${maxImages} images`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      toast.info(`Only ${availableSlots} images can be added (maximum ${maxImages})`);
    }

    // Create temporary placeholders
    const placeholders: UploadingFile[] = filesToUpload.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      progress: 20,
      status: "uploading"
    }));

    setUploadingFiles(prev => [...prev, ...placeholders]);

    const successfullyUploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const placeholderId = placeholders[i].id;

      try {
        const publicUrl = await uploadSingleFile(file);

        if (publicUrl) {
          successfullyUploadedUrls.push(publicUrl);
          setUploadingFiles(prev =>
            prev.map(p => p.id === placeholderId ? { ...p, status: "done", progress: 100 } : p)
          );
        } else {
          throw new Error("Upload failed to generate public URL");
        }
      } catch (err: any) {
        const errorText = err?.message || "Upload failed";
        setUploadingFiles(prev =>
          prev.map(p => p.id === placeholderId ? { ...p, status: "error", errorMsg: errorText } : p)
        );
        toast.error(`Failed to upload ${file.name}: ${errorText}`);
      }
    }

    // Clean up successful placeholders and update parent state
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(p => p.status !== "done"));
    }, 800);

    if (successfullyUploadedUrls.length > 0) {
      setImages(prev => {
        const updated = [...prev, ...successfullyUploadedUrls];
        onImagesChange(updated);
        return updated;
      });
      toast.success(`${successfullyUploadedUrls.length} image(s) uploaded successfully!`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [images, maxImages, onImagesChange, supabase]);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  const removeFailedPlaceholder = (id: string) => {
    setUploadingFiles(prev => prev.filter(p => p.id !== id));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, i) => i !== index);
    const reordered = [item, ...rest];
    setImages(reordered);
    onImagesChange(reordered);
    toast.success("Cover image updated");
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const totalCurrent = images.length + uploadingFiles.filter(u => u.status === 'uploading').length;
  const isMaxReached = totalCurrent >= maxImages;

  return (
    <div className="space-y-4">
      {/* Drag & Drop Main Zone (Active when no images or when adding more) */}
      {!isMaxReached && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01] shadow-inner"
              : "border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-slate-50 hover:shadow-sm"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drag & drop multiple photos
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Select multiple images at once · JPG, PNG, WebP · Up to {maxImages} photos
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              <span>{images.length} of {maxImages} uploaded</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Uploaded Images & Live Placeholders */}
      {(images.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {/* Confirmed Images */}
          {images.map((url, index) => (
            <div
              key={`img-${index}-${url}`}
              className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 bg-slate-100 shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={url}
                alt={`Venue image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Cover badge */}
              {index === 0 ? (
                <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" /> Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAsCover(index)}
                  className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Set as Cover Image"
                >
                  Make Cover
                </button>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/95 rounded-full text-slate-700 hover:text-red-600 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* In-progress / Failed Upload Placeholders */}
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className={`relative aspect-square rounded-xl overflow-hidden border ${
                file.status === "error" ? "border-red-300 bg-red-50" : "border-primary/40 bg-slate-100"
              }`}
            >
              <img
                src={file.previewUrl}
                alt={file.name}
                className="w-full h-full object-cover opacity-40 blur-[1px]"
              />

              {file.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-white/60">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mb-1.5" />
                  <span className="text-[10px] font-bold text-slate-700 truncate max-w-full px-1">
                    Uploading...
                  </span>
                </div>
              )}

              {file.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-red-50/90">
                  <AlertCircle className="w-6 h-6 text-red-500 mb-1" />
                  <span className="text-[10px] font-bold text-red-700 line-clamp-2 px-1">
                    {file.errorMsg || "Upload failed"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFailedPlaceholder(file.id)}
                    className="mt-1 text-[10px] font-black text-red-600 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Quick "Add More" Button in Grid if images exist */}
          {!isMaxReached && images.length > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer bg-slate-50/50"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-primary shadow-xs">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-primary">
                Add More
              </span>
            </button>
          )}
        </div>
      )}

      {/* Helper Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Minimum 1 photo required for listing approval.
        </span>
        <span className="font-semibold text-slate-600">
          {images.length} / {maxImages} photos
        </span>
      </div>
    </div>
  );
}
