import React from "react";
import { 
  Instagram, 
  Home, 
  Search, 
  Compass, 
  Clapperboard, 
  Send, 
  Heart, 
  PlusSquare, 
  User, 
  Menu,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  likesCount: number;
}

export default function InstagramSidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenUpload,
  likesCount 
}: SidebarProps) {
  
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Cerca", icon: Search },
    { id: "explore", label: "Esplora", icon: Compass },
    { id: "reels", label: "Reels", icon: Clapperboard },
    { id: "messages", label: "Messaggi", icon: Send },
    { id: "notifications", label: "Notifiche", icon: Heart, badge: likesCount > 0 ? likesCount : undefined },
    { id: "create", label: "Crea", icon: PlusSquare, action: onOpenUpload },
    { id: "profile", label: "Profilo", icon: User },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        id="instagram-sidebar-desktop"
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-16 xl:w-64 bg-white border-r border-gray-200 text-neutral-900 p-3 xl:p-6 transition-all duration-300 z-40 justify-between"
      >
        <div className="flex flex-col gap-8">
          {/* Instagram Logo */}
          <div className="flex items-center gap-3 py-4 px-2 select-none cursor-pointer" onClick={() => setActiveTab("reels")}>
            <Instagram className="w-7 h-7 text-black" />
            <span className="hidden xl:inline font-bold text-2xl tracking-tight italic bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Instagram
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group text-left relative ${
                    isActive ? "font-bold text-black bg-gray-100" : "text-neutral-600 hover:text-black"
                  }`}
                >
                  <div className="relative">
                    <IconComponent className={`w-6.5 h-6.5 transition-transform group-hover:scale-110 duration-200 ${
                      isActive ? "text-black stroke-[2.5]" : "text-neutral-600 group-hover:text-black"
                    }`} />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:inline text-[15px]">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer menu button */}
        <div className="flex flex-col gap-4">
          <a 
            href="https://ai.studio/build" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-300 transition-all text-xs text-purple-700"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Built with AI Studio</span>
          </a>
          <button 
            id="nav-menu-button"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 transition-all text-neutral-600 hover:text-black text-left cursor-pointer"
          >
            <Menu className="w-6.5 h-6.5" />
            <span className="hidden xl:inline text-[15px]">Altro</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header 
        id="instagram-mobile-header"
        className="md:hidden fixed top-0 left-0 w-full h-14 bg-white border-b border-gray-200 text-black px-4 flex items-center justify-between z-40"
      >
        <div className="flex items-center gap-2 select-none" onClick={() => setActiveTab("reels")}>
          <Instagram className="w-6 h-6 text-black" />
          <span className="font-semibold text-xl italic tracking-tighter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Instagram
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            id="mobile-btn-create"
            onClick={onOpenUpload}
            className="p-1 text-neutral-600 hover:text-black focus:outline-none"
          >
            <PlusSquare className="w-6 h-6" />
          </button>
          <button 
            id="mobile-btn-notifs"
            onClick={() => setActiveTab("notifications")}
            className="p-1 text-neutral-600 hover:text-black relative focus:outline-none"
          >
            <Heart className="w-6 h-6" />
            {likesCount > 0 && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        id="instagram-mobile-nav"
        className="md:hidden fixed bottom-0 left-0 w-full h-14 bg-white border-t border-gray-200 text-black flex items-center justify-around z-40 pb-safe"
      >
        {navItems
          .filter(item => ["home", "search", "reels", "messages", "profile"].includes(item.id))
          .map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`mobile-nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 flex flex-col items-center justify-center relative focus:outline-none ${
                  isActive ? "text-black" : "text-neutral-500"
                }`}
              >
                <IconComponent className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                {item.id === "profile" && isActive && (
                  <span className="w-1 h-1 bg-black rounded-full mt-0.5 absolute bottom-1" />
                )}
              </button>
            );
          })}
      </nav>
    </>
  );
}
