export interface CommentItem {
  id: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface ReelVideo {
  id: number;
  videoUrl: string;
  username: string;
  userAvatar: string;
  caption: string;
  likes: number;
  commentsCount: number;
  commentsList: CommentItem[];
  isLiked: boolean;
  isBookmarked: boolean;
  musicName: string;
  musicArtist: string;
  views: number;
  isUploadedByUser?: boolean;
  quizQuestion?: string;
  quizOptions?: string[];
  quizAnswer?: string;
}

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  quizAnswers?: string;
  timestamp: string;
  sourceReelId: number;
}
