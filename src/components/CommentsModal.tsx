import React, { useState, useEffect, useRef } from "react";
import { X, Send, Heart, Smile } from "lucide-react";
import { CommentItem } from "../types";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: CommentItem[];
  onAddComment: (text: string) => void;
  username: string;
}

export default function CommentsModal({
  isOpen,
  onClose,
  comments,
  onAddComment,
  username
}: CommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Initialize comment likes if not set
  useEffect(() => {
    const initialLikes: Record<string, { count: number; liked: boolean }> = {};
    comments.forEach(c => {
      if (!commentLikes[c.id]) {
        initialLikes[c.id] = { count: c.likes || 0, liked: false };
      }
    });
    if (Object.keys(initialLikes).length > 0) {
      setCommentLikes(prev => ({ ...prev, ...initialLikes }));
    }
  }, [comments]);

  // Scroll to bottom on new comment
  useEffect(() => {
    if (isOpen) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  const toggleCommentLike = (commentId: string) => {
    setCommentLikes(prev => {
      const current = prev[commentId] || { count: 0, liked: false };
      return {
        ...prev,
        [commentId]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked
        }
      };
    });
  };

  const italianEmojis = ["😍", "🔥", "🙌", "❤️", "👏", "😂", "✨", "💯", "😮", "👑"];

  return (
    <div 
      id="comments-backdrop"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end md:items-center justify-center z-50 transition-all duration-300 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="comments-panel"
        className="bg-white border-t md:border border-gray-200 rounded-t-2xl md:rounded-2xl w-full md:max-w-md h-[75vh] md:h-[600px] flex flex-col overflow-hidden text-neutral-800 shadow-2xl relative animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <span className="font-bold text-center w-full select-none text-neutral-800 text-[15px]">Commenti ({comments.length})</span>
          <button 
            id="close-comments-btn"
            onClick={onClose}
            className="absolute right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div 
          id="comments-list-container"
          className="flex-1 overflow-y-auto p-4 space-y-4.5 no-scrollbar bg-gray-50/25"
        >
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-8 text-center">
              <span className="text-4xl mb-2 select-none">💬</span>
              <p className="text-sm font-bold text-neutral-700">Nessun commento ancora</p>
              <p className="text-xs text-neutral-400 mt-1">Sii il primo a commentare questo Reel!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const likeState = commentLikes[comment.id] || { count: comment.likes, liked: false };
              return (
                <div 
                  key={comment.id} 
                  id={`comment-item-${comment.id}`}
                  className="flex items-start justify-between group gap-3 animate-fade-in"
                >
                  <div className="flex gap-3">
                    <img
                      src={comment.userAvatar}
                      alt={comment.username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold text-neutral-900 mr-2 hover:underline cursor-pointer">
                          {comment.username}
                        </span>
                        <span className="text-neutral-700 select-all whitespace-pre-wrap">{comment.text}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400 select-none font-medium">
                        <span>{comment.timestamp}</span>
                        {likeState.count > 0 && (
                          <span className="font-bold text-neutral-500">
                            {likeState.count} {likeState.count === 1 ? "like" : "likes"}
                          </span>
                        )}
                        <button className="hover:text-neutral-700 font-bold focus:outline-none cursor-pointer">Rispondi</button>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`like-comment-${comment.id}`}
                    onClick={() => toggleCommentLike(comment.id)}
                    className="p-1 text-neutral-300 hover:text-red-500 transition-colors focus:outline-none self-center flex-shrink-0 cursor-pointer"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        likeState.liked ? "fill-red-500 text-red-500 scale-110" : "text-neutral-300 hover:text-neutral-500"
                      }`} 
                    />
                  </button>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-gray-50/50">
          {italianEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setNewComment(prev => prev + emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer focus:outline-none"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Form */}
        <form 
          id="comment-submit-form"
          onSubmit={handleSubmit}
          className="p-3 border-t border-gray-100 bg-white flex items-center gap-3"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="My Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-100 hidden sm:block flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="relative flex-1">
            <input
              id="comment-text-input"
              type="text"
              placeholder="Aggiungi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 text-neutral-800 rounded-full py-2 px-4 pr-10 text-sm focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/20 focus:outline-none placeholder-neutral-400 transition-all font-medium"
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <button
            id="comment-submit-btn"
            type="submit"
            disabled={!newComment.trim()}
            className={`p-2 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              newComment.trim() 
                ? "bg-pink-600 text-white hover:bg-pink-700 scale-100 shadow-sm shadow-pink-100" 
                : "bg-gray-100 text-neutral-300 cursor-not-allowed scale-90"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
