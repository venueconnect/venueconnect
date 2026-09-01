"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ListingShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: "pill" | "button" | "icon";
}

export default function ListingShareButton({
  title,
  text,
  url,
  className = "",
  variant = "pill",
}: ListingShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareTitle = title || "Check this venue on VenueConnect";
    const shareText = text || `Discover ${shareTitle} on VenueConnect!`;

    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        return;
      }
      
      // Clipboard fallback
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
        return;
      }

      throw new Error("Clipboard API unavailable");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return; // User dismissed share dialog
      }

      // Legacy fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        toast.error("Unable to copy link. Please copy URL from browser address bar.");
      }
    }
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-900 font-bold hover:bg-slate-200 transition-all cursor-pointer select-none active:scale-95 ${className}`}
        title="Share this page"
      >
        {copied ? (
          <>
            <Check size={16} className="text-emerald-600" />
            <span className="text-xs text-emerald-600 font-black">Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={16} />
            <span className="text-xs">Share</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer active:scale-95 ${className}`}
      title="Share this page"
    >
      {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
      <span className="text-xs font-bold">{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
