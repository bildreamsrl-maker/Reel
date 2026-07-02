import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  Settings, 
  CheckCircle,
  Play,
  ArrowRight,
  Database,
  X,
  Heart,
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  PlusSquare,
  User,
  MoreHorizontal,
  Send,
  Bookmark,
  Menu,
  Tv
} from "lucide-react";
import { INITIAL_REELS } from "./data";
import { ReelVideo, CommentItem, LeadItem } from "./types";
import ReelPlayer from "./components/ReelPlayer";
import VideoManager from "./components/VideoManager";
import CommentsModal from "./components/CommentsModal";
import LeadForm from "./components/LeadForm";

export default function App() {
  // --- STATE ---
  const [reels, setReels] = useState<ReelVideo[]>(INITIAL_REELS);

  const [leads, setLeads] = useState<LeadItem[]>([]);

  const [formConfig, setFormConfig] = useState({
    title: "Prenota una Consulenza Gratuita",
    subtitle: "Hai completato la visione! Compila il modulo di candidatura qui sotto per essere ricontattato da un nostro consulente strategico.",
    buttonText: "Invia la mia Candidatura",
    autoUnlock: true
  });

  const [activeReelId, setActiveReelId] = useState<number>(1);
  const [isCtaVisible, setIsCtaVisible] = useState<boolean>(false);

  // Handles the CTA button visibility (visible after 4 seconds on slide 1, immediately on others)
  useEffect(() => {
    if (activeReelId === 1) {
      setIsCtaVisible(false);
      const timer = setTimeout(() => {
        setIsCtaVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setIsCtaVisible(true);
    }
  }, [activeReelId]);

  const [viewedReelIds, setViewedReelIds] = useState<number[]>([1]);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Standard autoplay muted
  const [hasUnmuted, setHasUnmuted] = useState<boolean>(false);
  const [activeCommentReelId, setActiveCommentReelId] = useState<number | null>(null);
  
  // Custom sidebar follow states
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

  // Controls whether the Admin Control Panel / Creator panel is visible
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Hidden Access State
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    const saved = localStorage.getItem("ig_leads_admin_authorized");
    if (saved === "true") return true;
    
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("creator") === "true" || params.get("edit") === "true") {
      localStorage.setItem("ig_leads_admin_authorized", "true");
      return true;
    }
    return false;
  });

  const [secretClicks, setSecretClicks] = useState<number>(0);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin") {
      setIsAdminAuthorized(true);
      localStorage.setItem("ig_leads_admin_authorized", "true");
      setShowPasswordModal(false);
      setIsAdminOpen(true);
      setPasswordError("");
      setPasswordInput("");
    } else {
      setPasswordError("Password errata. Riprova!");
    }
  };

  const handleSecretClick = () => {
    setSecretClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowPasswordModal(true);
        return 0;
      }
      return next;
    });
  };

  // Reset clicks after 3 seconds of silence
  useEffect(() => {
    if (secretClicks > 0) {
      const timer = setTimeout(() => setSecretClicks(0), 3005);
      return () => clearTimeout(timer);
    }
  }, [secretClicks]);

  // Auto-open panel if authorized
  useEffect(() => {
    if (isAdminAuthorized) {
      setIsAdminOpen(true);
    }
  }, [isAdminAuthorized]);

  // Load database from Server on mount
  useEffect(() => {
    fetch("/api/reels")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setReels(data);
        }
      })
      .catch(err => console.error("Error loading reels:", err));

    fetch("/api/leads")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setLeads(data);
        }
      })
      .catch(err => console.error("Error loading leads:", err));

    fetch("/api/form-config")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setFormConfig(data);
        }
      })
      .catch(err => console.error("Error loading form config:", err));
  }, []);

  // Note: We removed the automatic page-wide unmute interaction listener 
  // so that the user is forced to click the specific "ATTIVA AUDIO" overlay button to unlock scrolling.

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE HELPERS ---
  const saveReelsToStorage = (updatedReels: ReelVideo[]) => {
    setReels(updatedReels);
    fetch("/api/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedReels)
    }).catch(err => console.error("Error saving reels to server:", err));
  };

  // --- ACTIONS ---
  // Tracking viewed reels as the user scrolls
  useEffect(() => {
    if (activeReelId >= 1 && activeReelId <= reels.length) {
      setViewedReelIds(prev => prev.includes(activeReelId) ? prev : [...prev, activeReelId]);
    }
  }, [activeReelId, reels.length]);

  // Is the Lead Generation Form unlocked?
  const isFormUnlocked = !formConfig.autoUnlock || viewedReelIds.length >= reels.length || activeReelId === 5;

  // Monitor scroll within phone viewport
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    
    const containerHeight = container.clientHeight;
    if (containerHeight === 0) return;

    // Standard Reels height is exactly 100% of scroller clientHeight
    const index = Math.round(container.scrollTop / containerHeight);
    
    if (index >= 0 && index <= reels.length) {
      if (index === reels.length) {
        setActiveReelId(5); // Active slide is 5 (The Contact Form slide)
      } else {
        const currentReel = reels[index];
        if (currentReel && currentReel.id !== activeReelId) {
          setActiveReelId(currentReel.id);
        }
      }
    }
  };

  // Scroll to a specific slide (1 to 5)
  const scrollToReel = (id: number) => {
    setActiveReelId(id);
    const container = scrollRef.current;
    if (!container) return;

    const targetIndex = id === 5 ? reels.length : id - 1;
    const scrollTarget = targetIndex * container.clientHeight;
    
    container.scrollTo({
      top: scrollTarget,
      behavior: "smooth"
    });
  };

  // Desktop keyboard / Chevron Up & Down navigation
  const navigateFeed = (direction: "up" | "down") => {
    const totalSlides = reels.length + 1; // 4 videos + 1 contact form
    const currentIndex = activeReelId === 5 ? reels.length : activeReelId - 1;
    let targetIndex = currentIndex;
    
    if (direction === "up" && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === "down" && currentIndex < totalSlides - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex !== currentIndex) {
      const targetId = targetIndex === reels.length ? 5 : reels[targetIndex].id;
      scrollToReel(targetId);
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateFeed("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateFeed("down");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReelId, reels.length]);

  // Like video
  const toggleLike = (id: number) => {
    const updated = reels.map(r => {
      if (r.id === id) {
        const nextLiked = !r.isLiked;
        return {
          ...r,
          isLiked: nextLiked,
          likes: nextLiked ? r.likes + 1 : r.likes - 1
        };
      }
      return r;
    });
    saveReelsToStorage(updated);
  };

  // Bookmark video
  const toggleBookmark = (id: number) => {
    const updated = reels.map(r => {
      if (r.id === id) {
        return {
          ...r,
          isBookmarked: !r.isBookmarked
        };
      }
      return r;
    });
    saveReelsToStorage(updated);
  };

  // Toggle user follow state
  const handleFollowToggle = (username: string) => {
    setFollowedUsers(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  // Add mock comment
  const addComment = (text: string) => {
    if (activeCommentReelId === null) return;
    
    const newCommentItem: CommentItem = {
      id: `comment_user_${Date.now()}`,
      username: "interessato_leads",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      text: text,
      timestamp: "Ora",
      likes: 0
    };

    const updated = reels.map(r => {
      if (r.id === activeCommentReelId) {
        return {
          ...r,
          commentsCount: r.commentsCount + 1,
          commentsList: [...r.commentsList, newCommentItem]
        };
      }
      return r;
    });
    saveReelsToStorage(updated);
  };

  // Update specific reel details (from video manager panel or from user quiz action)
  const handleUpdateReel = (id: number, updatedFields: Partial<ReelVideo>) => {
    const updated = reels.map(r => {
      if (r.id === id) {
        return { ...r, ...updatedFields };
      }
      return r;
    });
    
    // Always update client-side state
    setReels(updated);

    // If it is just a user selecting a quiz answer, DO NOT persist it on the server database.
    // This avoids leaking one user's selection to other concurrent users and prevents the race condition when submitting leads.
    const isQuizSelection = "quizAnswer" in updatedFields && Object.keys(updatedFields).length === 1;
    if (!isQuizSelection) {
      fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch(err => console.error("Error saving reels to server:", err));
    }
  };

  // Reset reels database
  const handleResetToDefault = () => {
    if (window.confirm("Sei sicuro di voler ripristinare i 4 video verticali predefiniti? Tutti i video e i testi caricati andranno persi.")) {
      fetch("/api/reset", { method: "POST" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReels(data.reels);
            setLeads(data.leads);
            setFormConfig(data.formConfig);
            setActiveReelId(1);
            scrollToReel(1);
          }
        })
        .catch(err => console.error("Error resetting database:", err));
    }
  };

  // Register candidate lead
  const handleAddLead = (leadData: { name: string; email: string; phone: string; notes: string; sourceReelId: number }) => {
    const quizAnswersList = reels
      .filter(r => r.quizAnswer)
      .map(r => `Video ${r.id}: ${r.quizAnswer}`)
      .join(" | ");

    const newLead: LeadItem = {
      id: `lead_${Date.now()}`,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      notes: leadData.notes,
      quizAnswers: quizAnswersList || undefined,
      timestamp: new Date().toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      sourceReelId: leadData.sourceReelId === 5 ? 4 : leadData.sourceReelId // fallback if filled inside form slide
    };

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeads(data.leads);
        }
      })
      .catch(err => console.error("Error saving lead:", err));

    // Also submit to Netlify Forms (so Netlify detects and saves leads on their dashboard)
    const encodeForm = (data: Record<string, string>) => {
      return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
    };

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm({
        "form-name": "candidatura-form",
        name: newLead.name,
        phone: newLead.phone,
        notes: newLead.notes,
        quizAnswers: newLead.quizAnswers || "",
        sourceReelId: String(newLead.sourceReelId),
        timestamp: newLead.timestamp
      })
    })
      .then(() => console.log("Form successfully submitted to Netlify Forms!"))
      .catch(err => console.error("Error submitting to Netlify Forms:", err));

    // Clear quiz answers for the next session (locally ONLY, no server request needed)
    const resetReelsQuiz = reels.map(r => {
      const { quizAnswer, ...rest } = r;
      return rest;
    });
    setReels(resetReelsQuiz);
  };

  // Delete lead
  const handleDeleteLead = (id: string) => {
    fetch(`/api/leads/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeads(data.leads);
        }
      })
      .catch(err => console.error("Error deleting lead:", err));
  };

  // Clear leads
  const handleClearAllLeads = () => {
    fetch("/api/leads", { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeads([]);
        }
      })
      .catch(err => console.error("Error clearing leads:", err));
  };

  // Form configuration update
  const handleUpdateFormConfig = (updatedFields: Partial<typeof formConfig>) => {
    const nextConfig = { ...formConfig, ...updatedFields };
    setFormConfig(nextConfig);
    fetch("/api/form-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields)
    }).catch(err => console.error("Error saving form config:", err));
  };

  // Active comments list
  const activeCommentReel = reels.find(r => r.id === activeCommentReelId);
  
  // Find current active reel for side-details
  const currentActiveReel = reels.find(r => r.id === activeReelId) || reels[0];

  return (
    <div className="min-h-dvh h-dvh w-screen bg-[#111113] text-white font-sans flex items-center justify-center overflow-hidden antialiased select-none relative p-4">
      
      {/* Desktop Background Image (striped gray and black with transparency) */}
      <div 
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-30 z-0"
        style={{ backgroundImage: `url('https://wallpapers.com/images/hd/striped-gray-and-black-color-background-xwd91y5wsthmjwzd.jpg')` }}
      />

      {/* FLOATING CREATOR PANEL TOGGLE (Desktop) */}
      <div className="hidden md:flex absolute top-6 right-6 z-50 items-center gap-2">
        <button
          onClick={() => {
            if (isAdminAuthorized) {
              setIsAdminOpen(prev => !prev);
            } else {
              setShowPasswordModal(true);
            }
          }}
          className="bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800/80 hover:border-neutral-700 text-white font-semibold py-2 px-4 rounded-full text-xs shadow-xl flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95"
        >
          <Settings className={`w-4 h-4 text-neutral-400 ${isAdminOpen ? 'rotate-90' : ''} transition-transform duration-300`} />
          <span>{isAdminOpen ? "Chiudi Pannello" : "Pannello Creator"}</span>
        </button>
      </div>

      {/* MAIN CONTAINER: SIDE-BY-SIDE ON DESKTOP */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-full relative z-10 w-full lg:w-auto h-full lg:h-auto overflow-hidden">
        
        {/* MAIN IMMERSIVE FEED CANVAS - Centered, no sidebars */}
        <main className="w-full md:w-[420px] h-full md:h-[80vh] flex flex-col justify-center items-center shrink-0">
          
          {/* CENTER PLAYER CONTAINER */}
          <div className="w-full h-full md:h-auto relative flex flex-col justify-center items-center p-0">
            
            {/* NATIVE OVERLAYS FOR MOBILE */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-30 flex items-center justify-between px-4 pointer-events-none">
              <span 
                onClick={handleSecretClick}
                className="text-white font-bold text-lg pointer-events-auto flex items-center gap-1 cursor-pointer select-none"
              >
                Reels <ChevronDown className="w-4 h-4 text-white" />
              </span>
              <div className="flex items-center gap-4 pointer-events-auto">
                <Tv className="w-6 h-6 text-white cursor-pointer" />
                <Settings 
                  onClick={() => {
                    if (isAdminAuthorized) {
                      setIsAdminOpen(prev => !prev);
                    } else {
                      setShowPasswordModal(true);
                    }
                  }}
                  className="w-6 h-6 text-white cursor-pointer hover:rotate-45 transition-transform duration-200" 
                />
              </div>
            </div>

            {/* STAGE PLAYER FRAME (9:16 aspect ratio box) */}
            <div className="relative w-full h-full md:h-[80vh] md:w-auto md:aspect-[9/16] md:rounded-3xl overflow-hidden bg-black border-y md:border border-neutral-800/80 shadow-2xl flex flex-col">
              
              {/* MICRO SCROLLER HEADER LINE */}
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900 z-30">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${(Math.min(activeReelId, reels.length) / reels.length) * 100}%` }}
                />
              </div>

              {/* PURE INSTAGRAM SCROLLER CONTAINER */}
              <div 
                ref={scrollRef}
                id="reels-scroller"
                onScroll={handleScroll}
                className={`flex-1 snap-y snap-mandatory scroll-smooth no-scrollbar h-full relative bg-black ${
                  hasUnmuted ? "overflow-y-scroll" : "overflow-y-hidden"
                }`}
              >
                {reels.map((reel) => (
                  <ReelPlayer
                    key={reel.id}
                    reel={reel}
                    isActive={reel.id === activeReelId}
                    isMuted={isMuted}
                    onToggleMute={() => {
                      const nextMute = !isMuted;
                      setIsMuted(nextMute);
                      if (!nextMute) {
                        setHasUnmuted(true);
                      }
                    }}
                    onToggleLike={toggleLike}
                    onToggleBookmark={toggleBookmark}
                    onOpenComments={(id) => setActiveCommentReelId(id)}
                    onFollowToggle={handleFollowToggle}
                    followedUsers={followedUsers}
                    onVideoEnded={(id) => scrollToReel(id + 1)}
                    onUpdateReel={handleUpdateReel}
                  />
                ))}

                {/* 5TH SLIDE: THE CONTACT LEAD FORM (INLINE ON MOBILE & DESKTOP) */}
                <div 
                  id="reel-container-leadform"
                  className="relative w-full h-full min-h-full shrink-0 bg-[#000000] flex flex-col justify-center snap-start snap-always"
                >
                  <LeadForm 
                    viewedCount={viewedReelIds.length}
                    totalCount={reels.length}
                    onAddLead={handleAddLead}
                    activeReelId={activeReelId}
                    isUnlocked={isFormUnlocked}
                    formTitle={formConfig.title}
                    formSubtitle={formConfig.subtitle}
                    formButtonText={formConfig.buttonText}
                    isEmbeddedInPhone={true}
                  />
                </div>
              </div>

              {/* MOBILE & DESKTOP FLOATING CTA ONLY FOR SLIDE 1 */}
              {activeReelId === 1 && isCtaVisible && (
                <div className="absolute bottom-24 left-0 right-0 px-4 z-20 pointer-events-none flex justify-center animate-fade-in">
                  <button
                    onClick={() => {
                      setIsMuted(false);
                      setHasUnmuted(true);
                      scrollToReel(3);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 hover:shadow-emerald-600/20 border py-2.5 px-5 rounded-full font-bold text-xs shadow-xl pointer-events-auto flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Partiamo!</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* CHEVRON SCROLL CONTROLS FOR DESKTOP (Styled as floaters next to video) */}
            <div className="hidden md:flex absolute right-[-70px] bottom-1/2 translate-y-1/2 flex-col gap-2.5 z-20 select-none">
              <button
                onClick={() => navigateFeed("up")}
                disabled={activeReelId === 1}
                className={`p-3 rounded-full transition-all border ${
                  activeReelId === 1 
                    ? "border-neutral-900 bg-neutral-950 text-neutral-700 opacity-30 cursor-not-allowed" 
                    : "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                }`}
                title="Precedente"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="text-center font-mono text-[10px] text-neutral-400 font-bold select-none py-1.5 bg-neutral-900/50 border border-neutral-800/60 rounded-full px-2 shadow-sm">
                {activeReelId === 5 ? "Form" : `${activeReelId}/${reels.length}`}
              </div>
              <button
                onClick={() => navigateFeed("down")}
                disabled={activeReelId === 5}
                className={`p-3 rounded-full transition-all border ${
                  activeReelId === 5 
                    ? "border-neutral-900 bg-neutral-950 text-neutral-700 opacity-30 cursor-not-allowed" 
                    : "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                }`}
                title="Successivo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* NATIVE OVERLAYS FOR MOBILE: BOTTOM BAR (Authentic app layout) */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 h-14 bg-black border-t border-neutral-900/60 z-30 flex items-center justify-around text-neutral-400">
              <Home className="w-5.5 h-5.5" />
              <Search className="w-5.5 h-5.5" />
              <div 
                onClick={() => {
                  if (isAdminAuthorized) {
                    setIsAdminOpen(prev => !prev);
                  } else {
                    setShowPasswordModal(true);
                  }
                }}
                className="w-10 h-10 border border-neutral-700 rounded-lg flex items-center justify-center font-bold text-lg bg-neutral-900 text-white cursor-pointer active:scale-90 transition-transform"
              >
                +
              </div>
              <Film className="w-5.5 h-5.5 text-white fill-white" />
              <div 
                className="w-6 h-6 rounded-full overflow-hidden border border-white transition-transform"
              >
                <img 
                  src={currentActiveReel.userAvatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </main>

        {/* DESKTOP SIDE PANEL FOR CREATOR / VIDEO MANAGER */}
        {isAdminOpen && (
          <aside className="hidden lg:block w-[480px] h-[80vh] bg-white rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden animate-fade-in shrink-0">
            <VideoManager
              reels={reels}
              onUpdateReel={handleUpdateReel}
              onResetToDefault={handleResetToDefault}
              onSelectReel={scrollToReel}
              activeReelId={activeReelId}
              leads={leads}
              onDeleteLead={handleDeleteLead}
              onClearAllLeads={handleClearAllLeads}
              formConfig={formConfig}
              onUpdateFormConfig={handleUpdateFormConfig}
            />
          </aside>
        )}
      </div>

      {/* MOBILE FULL-SCREEN CREATOR DRAWER */}
      {isAdminOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col animate-fade-in text-neutral-900">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-neutral-700" />
              <h2 className="font-bold text-neutral-900 text-sm">Pannello Creator</h2>
            </div>
            <button 
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <VideoManager
              reels={reels}
              onUpdateReel={handleUpdateReel}
              onResetToDefault={handleResetToDefault}
              onSelectReel={scrollToReel}
              activeReelId={activeReelId}
              leads={leads}
              onDeleteLead={handleDeleteLead}
              onClearAllLeads={handleClearAllLeads}
              formConfig={formConfig}
              onUpdateFormConfig={handleUpdateFormConfig}
            />
          </div>
        </div>
      )}

      {/* COMMENTS MODAL overlay */}
      <CommentsModal
        isOpen={activeCommentReelId !== null}
        onClose={() => setActiveCommentReelId(null)}
        comments={activeCommentReel ? activeCommentReel.commentsList : []}
        onAddComment={addComment}
        username="interessato_leads"
      />

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-sm mx-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError("");
                setPasswordInput("");
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Accesso Area Riservata</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Inserisci la password di amministrazione per sbloccare il caricamento dei tuoi video.
              </p>
              <div className="mt-2.5 text-[11px] bg-neutral-950 text-neutral-400 px-3 py-1.5 rounded-lg border border-neutral-800/60 font-mono flex items-center gap-1">
                <span>Suggerimento:</span> <span className="text-purple-400 font-bold">admin</span>
              </div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password di amministrazione"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-purple-500 text-white placeholder-neutral-500 transition-colors"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {passwordError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-purple-600/10"
              >
                Sblocca Pannello
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
