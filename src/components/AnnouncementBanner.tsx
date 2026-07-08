import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Announcement } from '../types';
import { Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data[0]) {
        setAnnouncement(data[0] as Announcement);
      }
    };
    fetchAnnouncement();
  }, []);

  if (!announcement || !isVisible) return null;

  const bgColors = {
    info: 'bg-[#008751]',
    warning: 'bg-[#FFD700]',
    success: 'bg-[#008751]'
  };

  const textColors = {
    info: 'text-white',
    warning: 'text-[#1A1A1A]',
    success: 'text-white'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${bgColors[announcement.type]} ${textColors[announcement.type]} py-2 px-4 relative z-[60]`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 pr-8">
          <Megaphone size={14} className="shrink-0" />
          <p className="text-xs font-bold text-center leading-tight">
            {announcement.message}
          </p>
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
