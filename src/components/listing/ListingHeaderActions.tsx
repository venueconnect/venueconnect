'use client';

import { useState, useEffect } from "react";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ListingHeaderActionsProps {
  listing: any;
  type: 'venue' | 'vendor';
}

export default function ListingHeaderActions({ listing, type }: ListingHeaderActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkFavoriteStatus();
  }, [listing.id]);

  const checkFavoriteStatus = async () => {
    const { data: { user } } = await (supabase.auth.getUser() as any);
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .eq('listing_type', type)
      .single();

    if (data) setIsFavorite(true);
    setLoading(false);
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await (supabase.auth.getUser() as any);
    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
        .eq('listing_type', type);

      if (!error) {
        setIsFavorite(false);
        toast.info("Removed from favorites");
      }
    } else {
      const { error } = await supabase.from('user_favorites').insert({
        user_id: user.id,
        listing_id: listing.id,
        listing_type: type
      });

      if (!error) {
        setIsFavorite(true);
        toast.success("Saved to favorites!");
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: listing.name,
      text: `Check out ${listing.name} on VenueConnect!`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err: any) {
      // User cancelled share or share failed — fallback to clipboard
      if (err?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied to clipboard!");
        } catch {
          // Final fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success("Link copied to clipboard!");
        }
      }
    }
  };

  return (
    <div className="flex gap-3 md:self-start">
      <Button 
        variant="outline" 
        onClick={toggleFavorite}
        disabled={loading}
        className={`h-12 px-6 rounded-xl border-2 transition-all ${isFavorite ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' : 'border-slate-100 bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-50'}`}
      >
        <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : 'text-slate-300'}`} /> 
        {isFavorite ? 'Saved' : 'Save'}
      </Button>
      <Button 
        variant="outline" 
        onClick={handleShare}
        className="h-12 px-6 rounded-xl border-2 border-slate-100 bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
      >
        <Share2 className="w-5 h-5 mr-2 text-slate-300" /> Share
      </Button>
    </div>
  );
}
