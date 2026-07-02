import { ReelVideo } from "./types";

export const INITIAL_REELS: ReelVideo[] = [
  {
    id: 1,
    videoUrl: "/uploads/video-1782730960617-773636027.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Riflessi al neon e vibrazioni notturne ✨ Qual è la vostra combinazione di colori preferita? 💜💙 #neonart #aesthetic #vibes #cyberpunk",
    likes: 12430,
    commentsCount: 84,
    views: 45200,
    musicName: "Sunset Drive",
    musicArtist: "Lofi Dreamer",
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      {
        id: "c1_1",
        username: "giulia_r",
        userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        text: "Questo video ha un'atmosfera incredibile! 😍",
        timestamp: "2h",
        likes: 42,
      },
      {
        id: "c1_2",
        username: "marco_b",
        userAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
        text: "Che camera usi per fare queste riprese? Pazzesco 🎥",
        timestamp: "4h",
        likes: 12,
      },
      {
        id: "c1_3",
        username: "cyber_aesthetic",
        userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        text: "Vola dritto nei preferiti! Neon is life 💜",
        timestamp: "1g",
        likes: 8,
      }
    ]
  },
  {
    id: 2,
    videoUrl: "/uploads/video-1782838116229-824853052.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Lasciati trasportare dal ritmo sotto le luci della città ⚡️ Nuova coreografia fuori ora! Ditemi cosa ne pensate nei commenti 👇 #dance #neonlights #streetdance #freestyle",
    likes: 8940,
    commentsCount: 126,
    views: 31800,
    musicName: "Neon Pulse",
    musicArtist: "The Synthwave Band",
    isLiked: false,
    isBookmarked: false,
    quizQuestion: "Qual è la tua attuale esperienza con i social?",
    quizOptions: ["Principiante assoluto", "Gestisco già dei profili", "Lavoro già nel settore"],
    commentsList: [
      {
        id: "c2_1",
        username: "sofia_dance",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        text: "La fluidità dei movimenti è pazzesca! Bravissima 🔥",
        timestamp: "1h",
        likes: 56,
      },
      {
        id: "c2_2",
        username: "luca_sports",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        text: "Adoro la traccia musicale di sottofondo 🎵",
        timestamp: "3h",
        likes: 18,
      },
      {
        id: "c2_3",
        username: "elena_dance",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        text: "Dobbiamo assolutamente fare una collab! Scrivimi in DM 📩",
        timestamp: "5h",
        likes: 31,
      }
    ]
  },
  {
    id: 3,
    videoUrl: "/uploads/video-1782838133105-936590175.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Un respiro profondo tra i colori della primavera 🌼 C'è qualcosa di magico nel modo in cui il vento accarezza questi petali dorati. #naturelovers #relax #springvibes #cinematic #slowmotion",
    likes: 15302,
    commentsCount: 92,
    views: 58100,
    musicName: "Peaceful Breeze",
    musicArtist: "Acoustic Nature",
    isLiked: false,
    isBookmarked: false,
    quizQuestion: "Qual è il budget che vorresti investire?",
    quizOptions: ["Meno di 500€", "Da 500€ a 1500€", "Più di 1500€"],
    commentsList: [
      {
        id: "c3_1",
        username: "travel_dreamer",
        userAvatar: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=100&auto=format&fit=crop&q=80",
        text: "Questo reel mi dà una pace incredibile... Grazie per la condivisione 🙏",
        timestamp: "10m",
        likes: 112,
      },
      {
        id: "c3_2",
        username: "alessandro_flora",
        userAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
        text: "Splendida ripresa macro, la luce dorata è perfetta! 💛",
        timestamp: "1h",
        likes: 24,
      }
    ]
  },
  {
    id: 4,
    videoUrl: "/uploads/video-1782838157023-714300220.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "La forza immensa dell'oceano vista dall'alto 🌊 Un ipnotico infrangersi di onde che rinfresca la mente. Guarda fino alla fine per sentire la potenza del blu. #dronephotography #oceanlife #hypnotic #dji #aerialview",
    likes: 21050,
    commentsCount: 147,
    views: 92400,
    musicName: "Deep Ocean Waves",
    musicArtist: "Ambient Sea",
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      {
        id: "c4_1",
        username: "drone_master_it",
        userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
        text: "Inquadratura stupenda! Che drone hai usato? Mavic 3? 🚁",
        timestamp: "30m",
        likes: 45,
      },
      {
        id: "c4_2",
        username: "chiara_deep",
        userAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80",
        text: "Posso guardarlo per ore di fila. Veramente ipnotico! 😍🌊",
        timestamp: "2h",
        likes: 87,
      },
      {
        id: "c4_3",
        username: "sea_soul",
        userAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80",
        text: "La natura è l'artista migliore 💙",
        timestamp: "1g",
        likes: 19,
      }
    ]
  }
];
export const INSTAGRAM_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&auto=format&fit=crop&q=80"
];
