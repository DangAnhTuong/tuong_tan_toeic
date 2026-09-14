import React from 'react';

/**
 * AvatarWithCrownFrame: Renders authentic luxury 3D royal crown avatar frames
 * matching the user's exact royal crown reference artwork:
 * - Rank 1: Royal Gold Crown Frame with Wings & Ruby Gemstones
 * - Rank 2: Platinum Silver Crown Frame with Angel Wings & Blue Sapphires
 * - Rank 3: Antique Bronze Crown Frame with Phoenix Wings & Amber Gems
 */
export default function AvatarWithCrownFrame({ 
  rank, 
  avatar, 
  name = 'U', 
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className = '',
  onClick = null
}) {
  const initial = (name || 'U').charAt(0).toUpperCase();

  // Container dimensions (the frame is large and grand with wings)
  const sizeConfig = {
    sm: {
      container: 'w-14 h-14',
      avatarSize: 'w-7 h-7 text-[11px]',
      goldOffset: 'top-[54%] left-[50%] w-[54%] h-[54%]',
      silverOffset: 'top-[55%] left-[50%] w-[55%] h-[55%]',
      bronzeOffset: 'top-[52%] left-[50%] w-[50%] h-[50%]',
      badge: 'w-4 h-4 text-[9px] -bottom-0.5',
      glow: 'blur-xs'
    },
    md: {
      container: 'w-24 h-24',
      avatarSize: 'w-12 h-12 text-base',
      goldOffset: 'top-[54%] left-[50%] w-[54%] h-[54%]',
      silverOffset: 'top-[55%] left-[50%] w-[55%] h-[55%]',
      bronzeOffset: 'top-[52%] left-[50%] w-[50%] h-[50%]',
      badge: 'w-5 h-5 text-[10px] -bottom-1',
      glow: 'blur-sm'
    },
    lg: {
      container: 'w-36 h-36',
      avatarSize: 'w-18 h-18 text-xl',
      goldOffset: 'top-[54%] left-[50%] w-[54%] h-[54%]',
      silverOffset: 'top-[55%] left-[50%] w-[55%] h-[55%]',
      bronzeOffset: 'top-[52%] left-[50%] w-[50%] h-[50%]',
      badge: 'w-6 h-6 text-xs -bottom-1.5',
      glow: 'blur-md'
    },
    xl: {
      container: 'w-44 h-44',
      avatarSize: 'w-22 h-22 text-2xl',
      goldOffset: 'top-[54%] left-[50%] w-[54%] h-[54%]',
      silverOffset: 'top-[55%] left-[50%] w-[55%] h-[55%]',
      bronzeOffset: 'top-[52%] left-[50%] w-[50%] h-[50%]',
      badge: 'w-7 h-7 text-xs -bottom-2',
      glow: 'blur-lg'
    },
    '2xl': {
      container: 'w-52 h-52',
      avatarSize: 'w-26 h-26 text-3xl',
      goldOffset: 'top-[54%] left-[50%] w-[54%] h-[54%]',
      silverOffset: 'top-[55%] left-[50%] w-[55%] h-[55%]',
      bronzeOffset: 'top-[52%] left-[50%] w-[50%] h-[50%]',
      badge: 'w-8 h-8 text-sm -bottom-2.5',
      glow: 'blur-xl'
    }
  }[size] || sizeConfig.md;

  // Rank 1: Royal Gold Crown Frame with Wings & Rubies
  if (rank === 1) {
    return (
      <div 
        onClick={onClick}
        className={`relative flex items-center justify-center select-none shrink-0 ${sizeConfig.container} ${className}`}
      >
        {/* Soft Golden Glow behind the crown */}
        <div className={`absolute inset-4 rounded-full bg-amber-500/30 ${sizeConfig.glow} pointer-events-none animate-pulse`} />

        {/* Centered User Photo / Avatar behind the frame */}
        <div className={`absolute ${sizeConfig.goldOffset} -translate-x-1/2 -translate-y-1/2 rounded-full dark:bg-[#0b1329] bg-amber-100 border dark:border-amber-500/40 border-amber-300 flex items-center justify-center font-heading font-black dark:text-amber-300 text-amber-800 overflow-hidden shadow-inner z-0`}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{initial}</span>
          )}
        </div>

        {/* Authentic 3D Royal Gold Crown & Wings Frame Overlay */}
        <img 
          src="/assets/frames/gold_frame.png" 
          alt="Top 1 Gold Royal Crown Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_4px_16px_rgba(234,179,8,0.5)] transform hover:scale-105 transition-transform duration-300"
        />

        {/* Bottom Gold Rank #1 Pill Badge */}
        <div className={`absolute ${sizeConfig.badge} inset-x-0 mx-auto rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xl border border-yellow-200 z-20`}>
          1
        </div>
      </div>
    );
  }

  // Rank 2: Platinum Silver Crown Frame with Angel Wings & Sapphires
  if (rank === 2) {
    return (
      <div 
        onClick={onClick}
        className={`relative flex items-center justify-center select-none shrink-0 ${sizeConfig.container} ${className}`}
      >
        {/* Soft Silver Cyan Glow */}
        <div className={`absolute inset-4 rounded-full bg-cyan-400/20 ${sizeConfig.glow} pointer-events-none`} />

        {/* Centered User Photo / Avatar behind the frame */}
        <div className={`absolute ${sizeConfig.silverOffset} -translate-x-1/2 -translate-y-1/2 rounded-full dark:bg-[#0b1329] bg-slate-100 border dark:border-slate-400/40 border-slate-300 flex items-center justify-center font-heading font-black dark:text-slate-200 text-slate-700 overflow-hidden shadow-inner z-0`}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{initial}</span>
          )}
        </div>

        {/* Authentic 3D Platinum Silver Crown Frame Overlay */}
        <img 
          src="/assets/frames/silver_frame.png" 
          alt="Top 2 Silver Royal Crown Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_4px_14px_rgba(148,163,184,0.4)] transform hover:scale-105 transition-transform duration-300"
        />

        {/* Bottom Silver Rank #2 Pill Badge */}
        <div className={`absolute ${sizeConfig.badge} inset-x-0 mx-auto rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-300 text-slate-950 font-black flex items-center justify-center shadow-xl border border-white z-20`}>
          2
        </div>
      </div>
    );
  }

  // Rank 3: Antique Bronze Crown Frame with Phoenix Wings & Ambers
  if (rank === 3) {
    return (
      <div 
        onClick={onClick}
        className={`relative flex items-center justify-center select-none shrink-0 ${sizeConfig.container} ${className}`}
      >
        {/* Soft Warm Bronze Glow */}
        <div className={`absolute inset-4 rounded-full bg-orange-600/20 ${sizeConfig.glow} pointer-events-none`} />

        {/* Centered User Photo / Avatar behind the frame */}
        <div className={`absolute ${sizeConfig.bronzeOffset} -translate-x-1/2 -translate-y-1/2 rounded-full dark:bg-[#0b1329] bg-orange-100 border dark:border-amber-600/40 border-orange-300 flex items-center justify-center font-heading font-black dark:text-amber-500 text-amber-800 overflow-hidden shadow-inner z-0`}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{initial}</span>
          )}
        </div>

        {/* Authentic 3D Antique Bronze Crown Frame Overlay */}
        <img 
          src="/assets/frames/bronze_frame.png" 
          alt="Top 3 Bronze Royal Crown Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_4px_14px_rgba(180,83,9,0.4)] transform hover:scale-105 transition-transform duration-300"
        />

        {/* Bottom Bronze Rank #3 Pill Badge */}
        <div className={`absolute ${sizeConfig.badge} inset-x-0 mx-auto rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-600 text-white font-black flex items-center justify-center shadow-xl border border-amber-300 z-20`}>
          3
        </div>
      </div>
    );
  }

  // Standard/Normal User Avatar (Rank 4+)
  return (
    <div 
      onClick={onClick}
      className={`relative rounded-full dark:border-slate-700 border-slate-300 dark:bg-slate-900 bg-slate-100 flex items-center justify-center font-bold dark:text-slate-300 text-slate-700 shadow ${sizeConfig.avatarSize} ${className}`}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
      ) : (
        initial
      )}
    </div>
  );
}
