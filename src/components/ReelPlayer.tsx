import React, { useRef, useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Music, 
  Volume2, 
  VolumeX, 
  MoreHorizontal,
  Play,
  Check,
  Film,
  ArrowRight
} from "lucide-react";
import { ReelVideo } from "../types";

interface ReelPlayerProps {
  key?: React.Key;
  reel: ReelVideo;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (id: number) => void;
  onToggleBookmark: (id: number) => void;
  onOpenComments: (id: number) => void;
  onFollowToggle: (username: string) => void;
  followedUsers: Record<string, boolean>;
  onVideoEnded?: (id: number) => void;
  onUpdateReel?: (id: number, updatedFields: Partial<ReelVideo>) => void;
}

const FALLBACK_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4"
];

export default function ReelPlayer({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onToggleLike,
  onToggleBookmark,
  onOpenComments,
  onFollowToggle,
  followedUsers,
  onVideoEnded,
  onUpdateReel
}: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const lastTap = useRef<number>(0);

  const [videoSrc, setVideoSrc] = useState(reel.videoUrl || "");
  const [errorCount, setErrorCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sync state if reel changes
  useEffect(() => {
    setVideoSrc(reel.videoUrl || "");
    setErrorCount(0);
    setCurrentTime(0);
    setDuration(0);
  }, [reel.videoUrl, reel.id]);

  // Sync state if reel changes or active changes
  useEffect(() => {
    if (!isActive) {
      setShowQuiz(false);
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(reel.quizAnswer || null);
    }
    setCurrentTime(0);
    setDuration(0);
  }, [isActive, reel.quizAnswer]);

  const handleQuizSelect = (option: string) => {
    setSelectedAnswer(option);
    onUpdateReel?.(reel.id, { quizAnswer: option });
    setShowQuiz(false); // Immediate close
    onVideoEnded?.(reel.id); // Immediate transition
  };

  const handleVideoError = () => {
    if (errorCount < FALLBACK_VIDEOS.length) {
      const nextIndex = (reel.id + errorCount) % FALLBACK_VIDEOS.length;
      const fallbackUrl = FALLBACK_VIDEOS[nextIndex];
      console.warn(`Video failed to load (attempt ${errorCount + 1}): ${videoSrc}. Trying fallback: ${fallbackUrl}`);
      setErrorCount(prev => prev + 1);
      setVideoSrc(fallbackUrl);
    } else {
      console.error(`All fallback videos failed to load for Reel ${reel.id}.`);
    }
  };

  // Play or pause video based on active slide or source change
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log("Auto-play was prevented. Waiting for interaction.", error);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, videoSrc]);

  // Sync volume state and restart the video if it is unmuted
  const wasMuted = useRef(isMuted);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      // If we are unmuting (isMuted went from true to false)
      if (wasMuted.current && !isMuted) {
        videoRef.current.currentTime = 0;
      }
    }
    wasMuted.current = isMuted;
  }, [isMuted]);

  // Double tap handler
  const handleVideoTap = (e: React.MouseEvent) => {
    if (showQuiz) return; // Prevent tapping while quiz is shown
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap -> LIKE
      if (!reel.isLiked) {
        onToggleLike(reel.id);
      }
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    } else {
      // Single tap -> MUTE/UNMUTE
      onToggleMute();
      setShowMuteIndicator(true);
      setTimeout(() => setShowMuteIndicator(false), 800);
    }
    lastTap.current = now;
  };

  // Keyboard navigation / Interaction handler
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering video tap
    if (showQuiz) return; // Ignore during quiz
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const isFollowed = followedUsers[reel.username] || false;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingTime = Math.max(0, duration - currentTime);
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div 
      id={`reel-container-${reel.id}`}
      className="relative w-full h-full min-h-full shrink-0 bg-black flex items-center justify-center select-none snap-start snap-always"
    >
      {/* Persistent Mute/Unmute Button in Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
          setShowMuteIndicator(true);
          setTimeout(() => setShowMuteIndicator(false), 800);
        }}
        className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/50 hover:bg-black/75 border border-white/15 rounded-full flex items-center justify-center text-white backdrop-blur-xs transition-all active:scale-90 cursor-pointer shadow-xl hover:scale-105"
        title={isMuted ? "Attiva audio" : "Silenzia"}
      >
        {isMuted ? (
          <VolumeX className="w-4.5 h-4.5 text-white" />
        ) : (
          <Volume2 className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
        )}
      </button>

      {/* Video element or Empty Placeholder */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          id={`reel-video-${reel.id}`}
          className="w-full h-full object-cover cursor-pointer bg-neutral-950"
          playsInline
          autoPlay={isActive}
          muted={isMuted}
          onClick={handleVideoTap}
          onError={handleVideoError}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onDurationChange={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={() => {
            const hasQuiz = (reel.id === 3) && reel.quizOptions && reel.quizOptions.some(opt => opt && opt.trim() !== "");
            if (hasQuiz) {
              setShowQuiz(true);
              setIsPlaying(false);
            } else {
              onVideoEnded?.(reel.id);
            }
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6 text-center select-none">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 max-w-[90%] shadow-2xl flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4 bg-pink-500/10 border border-pink-500/20 rounded-full flex items-center justify-center text-pink-500 animate-pulse">
              <Film className="w-7 h-7" />
            </div>
            
            <h3 className="text-white font-bold text-base tracking-tight mb-2">
              Slot Video {reel.id} Vuoto
            </h3>
            
            <p className="text-neutral-400 text-xs leading-relaxed max-w-[240px]">
              Nessun video caricato per questo slot.
            </p>
          </div>
        </div>
      )}

      {/* Centered Play/Unmute Overlay Button when video is muted */}
      {videoSrc && isActive && isMuted && !showQuiz && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
            setShowMuteIndicator(true);
            setTimeout(() => setShowMuteIndicator(false), 800);
          }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 cursor-pointer z-10 transition-all group"
        >
          <div className="bg-black/60 group-hover:bg-black/75 p-5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-300 scale-100 group-hover:scale-110 active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-0.5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Play/Pause Overlay indicator when unmuted but paused */}
      {videoSrc && !isPlaying && !isMuted && !showQuiz && (
        <div 
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10 transition-all"
        >
          <div className="bg-black/50 p-4 rounded-full backdrop-blur-xs scale-100 transition-transform hover:scale-110">
            <Play className="w-8 h-8 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Interactive Quiz Overlay */}
      {((reel.id === 3) && reel.quizOptions && reel.quizOptions.some(opt => opt && opt.trim() !== "")) && (
        <div 
          className={`absolute inset-0 bg-transparent flex items-center justify-center p-6 z-30 pointer-events-none transition-all duration-300 ${
            showQuiz ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`bg-neutral-900/95 border border-neutral-800 rounded-2xl p-5 w-full max-w-[290px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-center pointer-events-auto transform transition-all duration-300 ease-out ${
              showQuiz ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"
            }`}
          >
            <div className="inline-flex items-center justify-center p-1.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-500 rounded-full mb-4 border border-pink-500/20">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2">Seleziona un'opzione 👇</span>
            </div>
            
            <div className="space-y-2">
              {reel.quizOptions.filter(opt => opt && opt.trim() !== "").map((option, idx) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizSelect(option)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left flex items-center justify-between border ${
                      isSelected
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg shadow-pink-500/25"
                        : "bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border-neutral-800"
                    }`}
                  >
                    <span className="max-w-[90%] break-words">{option}</span>
                    {isSelected && <Check className="w-4.5 h-4.5 text-white stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Heart Pop Animation */}
      {showHeartPop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart className="w-24 h-24 text-red-500 fill-current animate-heartbeat drop-shadow-xl" />
        </div>
      )}

      {/* Mute/Unmute Indicator */}
      {showMuteIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/60 p-4 rounded-full backdrop-blur-xs flex items-center justify-center animate-fade-out duration-700">
            {isMuted ? (
              <VolumeX className="w-8 h-8 text-white" />
            ) : (
              <Volume2 className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
      )}



      {/* Right Side Overlay Action Buttons */}
      <div 
        id={`reel-actions-${reel.id}`}
        className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            id={`action-like-${reel.id}`}
            onClick={() => onToggleLike(reel.id)}
            className="w-11 h-11 bg-neutral-900/40 hover:bg-neutral-800/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs transition-all active:scale-75 focus:outline-none cursor-pointer"
          >
            <Heart 
              className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                reel.isLiked ? "fill-red-500 text-red-500" : "text-white"
              }`} 
            />
          </button>
          <span className="text-xs font-semibold drop-shadow-md select-none">
            {reel.likes.toLocaleString()}
          </span>
        </div>

        {/* Comment (Disabled/Static) */}
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div
            id={`action-comment-${reel.id}`}
            className="w-11 h-11 bg-neutral-900/40 rounded-full flex items-center justify-center text-white backdrop-blur-xs select-none"
            title="Commenti disabilitati"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold drop-shadow-md select-none text-neutral-300">
            {reel.commentsList.length}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1 group relative">
          <button
            id={`action-share-${reel.id}`}
            onClick={handleShare}
            className="w-11 h-11 bg-neutral-900/40 hover:bg-neutral-800/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs transition-all active:scale-75 focus:outline-none cursor-pointer"
          >
            <Send className="w-6 h-6 transition-transform group-hover:scale-110 text-white" />
          </button>
          <span className="text-xs font-semibold drop-shadow-md select-none">Invia</span>

          {/* Copied URL alert */}
          {showShareTooltip && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-800 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap text-sky-400 font-semibold shadow-xl flex items-center gap-1 animate-fade-in z-30">
              <Check className="w-3.5 h-3.5 text-sky-400" />
              Link copiato!
            </div>
          )}
        </div>

        {/* Bookmark / Salva */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            id={`action-bookmark-${reel.id}`}
            onClick={() => onToggleBookmark(reel.id)}
            className="w-11 h-11 bg-neutral-900/40 hover:bg-neutral-800/60 rounded-full flex items-center justify-center text-white backdrop-blur-xs transition-all active:scale-75 focus:outline-none cursor-pointer"
          >
            <Bookmark 
              className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                reel.isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-white"
              }`} 
            />
          </button>
          <span className="text-xs font-semibold drop-shadow-md select-none">Salva</span>
        </div>
      </div>

      {/* Bottom Text Overlay */}
      <div 
        id={`reel-bottom-overlay-${reel.id}`}
        className="absolute bottom-4 left-4 right-16 z-20 text-white flex flex-col gap-3 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* User Details */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 flex-shrink-0">
              <img 
                src={reel.userAvatar} 
                alt={reel.username} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm hover:underline cursor-pointer select-all">
                {reel.username}
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <button
                id={`follow-btn-${reel.username}`}
                onClick={() => onFollowToggle(reel.username)}
                className={`text-xs font-bold transition-all px-2.5 py-1 rounded-md cursor-pointer ${
                  isFollowed 
                    ? "bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700" 
                    : "bg-sky-500 hover:bg-sky-600 text-white"
                }`}
              >
                {isFollowed ? "Segui già" : "Segui"}
              </button>
            </div>
          </div>
          
          {/* Time Remaining Badge */}
          {isActive && videoSrc && duration > 0 && (
            <div className="text-[10px] font-mono bg-black/60 px-2.5 py-1 rounded-full border border-white/10 text-neutral-300 mr-2 flex items-center gap-1 shadow-lg select-none">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          )}
        </div>

        {/* Truncatable Caption */}
        <div className="text-sm leading-relaxed max-w-sm">
          <p className="inline select-text">
            {isCaptionExpanded ? reel.caption : `${reel.caption.slice(0, 75)}`}
          </p>
          {reel.caption.length > 75 && !isCaptionExpanded && (
            <button
              id={`caption-expand-${reel.id}`}
              onClick={() => setIsCaptionExpanded(true)}
              className="text-neutral-400 hover:text-white font-medium ml-1 cursor-pointer focus:outline-none"
            >
              ...altro
            </button>
          )}
          {isCaptionExpanded && (
            <button
              id={`caption-collapse-${reel.id}`}
              onClick={() => setIsCaptionExpanded(false)}
              className="text-neutral-400 hover:text-white font-medium ml-1 cursor-pointer focus:outline-none block"
            >
              Mostra meno
            </button>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-800/40 z-20 overflow-hidden">
        {isActive && videoSrc && duration > 0 && (
          <div 
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-75 ease-out" 
            style={{ width: `${progressPercent}%` }} 
          />
        )}
      </div>
    </div>
  );
}
