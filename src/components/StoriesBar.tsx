import React from "react";
import { Plus } from "lucide-react";
import { INSTAGRAM_AVATARS } from "../data";

export default function StoriesBar() {
  const users = [
    { username: "sofia_dance", avatar: INSTAGRAM_AVATARS[4], hasStory: true },
    { username: "giulia_r", avatar: INSTAGRAM_AVATARS[5], hasStory: true },
    { username: "marco_b", avatar: INSTAGRAM_AVATARS[6], hasStory: true },
    { username: "travel_dreamer", avatar: INSTAGRAM_AVATARS[7], hasStory: false },
  ];

  return (
    <div 
      id="stories-container"
      className="flex items-center gap-4 overflow-x-auto py-3 px-4 bg-white border border-gray-100 no-scrollbar select-none rounded-2xl shadow-sm"
    >
      {/* My Story */}
      <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
        <div className="relative">
          <div className="w-14 h-14 rounded-full p-[1px] bg-gray-200 flex items-center justify-center">
            <img
              src="https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg"
              alt="bildream.it"
              className="w-full h-full object-cover rounded-full border border-white"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-sky-500 rounded-full p-1 border-2 border-white text-white group-hover:scale-110 transition-transform">
            <Plus className="w-3 h-3 stroke-[3]" />
          </div>
        </div>
        <span className="text-[11px] text-neutral-500 mt-1 max-w-[65px] truncate font-semibold">
          bildream.it
        </span>
      </div>

      {/* Other Stories */}
      {users.map((user, idx) => (
        <div 
          key={idx} 
          id={`story-item-${user.username}`}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer"
        >
          <div className="relative">
            {/* Instagram famous gradient story ring */}
            <div className={`w-14 h-14 rounded-full p-[2px] flex items-center justify-center transition-transform hover:scale-105 duration-200 ${
              user.hasStory 
                ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" 
                : "bg-gray-200"
            }`}>
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover rounded-full border-2 border-white bg-gray-50"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <span className="text-[11px] text-neutral-600 mt-1 max-w-[65px] truncate font-medium hover:text-neutral-900">
            {user.username}
          </span>
        </div>
      ))}
    </div>
  );
}
