import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";

const app = express();
const PORT = 3000;

// Resolve paths
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial default reels
const INITIAL_REELS = [
  {
    id: 1,
    videoUrl: "/videos/primo.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Riflessi al neon e vibrazioni notturne ✨ Qual è la vostra combinazione di colori preferita? 💜💙 #neonart #aesthetic #vibes #cyberpunk",
    likes: 1240,
    commentsCount: 84,
    sharesCount: 320,
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      {
        id: "c1",
        username: "neon_rider",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        text: "Incredibile questo video! Che luci pazzesche 🤩",
        timestamp: "2g",
        likes: 14
      },
      {
        id: "c2",
        username: "cyber_girl",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        text: "Uso sempre il viola e blu nei miei design! 💜💙",
        timestamp: "1g",
        likes: 8
      },
      {
        id: "c3",
        username: "art_vibes",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
        text: "Bellissima atmosfera, complimenti!",
        timestamp: "12h",
        likes: 3
      }
    ]
  },
  {
    id: 2,
    videoUrl: "/videos/secondo.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Lasciati trasportare dal ritmo sotto le luci della città ⚡️ Nuova coreografia fuori ora! Ditemi cosa ne pensate nei commenti 👇 #dance #neonlights #streetdance #freestyle",
    likes: 3820,
    commentsCount: 142,
    sharesCount: 890,
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      {
        id: "c4",
        username: "dance_lover",
        userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        text: "Pazzesco il movimento a 0:12! Spettacolo 🔥",
        timestamp: "3g",
        likes: 22
      },
      {
        id: "c5",
        username: "street_flow",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        text: "Le luci al neon sul set rendono tutto magico.",
        timestamp: "2g",
        likes: 12
      }
    ]
  },
  {
    id: 3,
    videoUrl: "/videos/terzo.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Un respiro profondo tra i colori della primavera 🌼 C'è qualcosa di magico nel modo in cui il vento accarezza questi petali dorati. #naturelovers #relax #springvibes #cinematic #slowmotion",
    likes: 950,
    commentsCount: 31,
    sharesCount: 95,
    isLiked: false,
    isBookmarked: false,
    quizOptions: ["Azienda", "Libero professionista", "Negozio", "start-up"],
    commentsList: [
      {
        id: "c6",
        username: "nature_lens",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        text: "Che pace trasmette questo reel... adoro la fotografia biologica 💚",
        timestamp: "4g",
        likes: 9
      },
      {
        id: "c7",
        username: "green_soul",
        userAvatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop&q=80",
        text: "I fiori gialli sono la cura per lo spirito 🌼",
        timestamp: "3g",
        likes: 5
      }
    ]
  },
  {
    id: 4,
    videoUrl: "/videos/quarto.mp4",
    username: "bildream.it",
    userAvatar: "https://i.ibb.co/BVBhMt98/SFONDO-BLU.jpg",
    caption: "Cosa aspetti? Il tuo momento è adesso. Sblocca il tuo potenziale e candidati compilando il modulo qui sotto! 🚀 #business #success #growth #motivation #leads",
    likes: 5600,
    commentsCount: 290,
    sharesCount: 1250,
    isLiked: false,
    isBookmarked: false,
    commentsList: [
      {
        id: "c8",
        username: "success_mindset",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        text: "Candidato subito! Non vedo l'ora di parlarne 📈",
        timestamp: "5g",
        likes: 45
      },
      {
        id: "c9",
        username: "growth_hacker",
        userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        text: "Ottima opportunità strategica, consigliatissimo.",
        timestamp: "4g",
        likes: 18
      }
    ]
  }
];

// Load or initialize DB
function getDB() {
  let db;
  if (!fs.existsSync(DB_FILE)) {
    db = {
      reels: INITIAL_REELS,
      leads: [],
      formConfig: {
        title: "Prenota una Consulenza Gratuita",
        subtitle: "Hai completato la visione! Compila il modulo di candidatura qui sotto per essere ricontattato da un nostro consulente strategico.",
        buttonText: "Invia la mia Candidatura",
        autoUnlock: true,
        webhookUrl: ""
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } else {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading database, restoring initial state", e);
      db = {
        reels: INITIAL_REELS,
        leads: [],
        formConfig: {
          title: "Prenota una Consulenza Gratuita",
          subtitle: "Hai completato la visione! Compila il modulo di candidatura qui sotto per essere ricontattato da un nostro consulente strategico.",
          buttonText: "Invia la mia Candidatura",
          autoUnlock: true,
          webhookUrl: ""
        }
      };
    }
  }

  // Self-healing: Upgrade any stale/expired Vimeo links or missing uploads in saved DB, and clear legacy session quiz selections
  let hasStaleUrls = false;
  if (db && db.reels && Array.isArray(db.reels)) {
    db.reels = db.reels.map((reel: any) => {
      let shouldReset = false;
      
      // Strip any saved user quizAnswer to keep shared DB clean
      if ("quizAnswer" in reel) {
        delete reel.quizAnswer;
        hasStaleUrls = true;
      }
      
      // Check for vimeo links
      if (reel.videoUrl && reel.videoUrl.includes("vimeo.com")) {
        shouldReset = true;
      }
      
      // Check for uploads that don't exist on disk or are 0 bytes
      if (reel.videoUrl && reel.videoUrl.startsWith("/uploads/")) {
        const fileName = reel.videoUrl.replace("/uploads/", "");
        const filePath = path.join(UPLOADS_DIR, fileName);
        if (!fs.existsSync(filePath)) {
          console.log(`Self-healing: Uploaded file ${filePath} does not exist. Resetting to default video.`);
          shouldReset = true;
        } else {
          try {
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
              console.log(`Self-healing: Uploaded file ${filePath} is 0 bytes. Resetting to default video.`);
              shouldReset = true;
              // Clean up 0-byte file
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error(`Error reading stats for ${filePath}:`, e);
          }
        }
      }
      
      if (shouldReset) {
        const matchingInit = INITIAL_REELS.find((init: any) => init.id === reel.id);
        if (matchingInit) {
          reel.videoUrl = matchingInit.videoUrl;
          reel.isUploadedByUser = false;
          hasStaleUrls = true;
        }
      }
      return reel;
    });
  }
  if (hasStaleUrls) {
    saveDB(db);
  }
  return db;
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Multer storage setup for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static serving for uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// API Endpoints
app.get("/api/reels", (req, res) => {
  const db = getDB();
  res.json(db.reels);
});

app.post("/api/reels", (req, res) => {
  const db = getDB();
  db.reels = req.body;
  saveDB(db);
  res.json({ success: true, reels: db.reels });
});

app.get("/api/leads", (req, res) => {
  const db = getDB();
  res.json(db.leads);
});

app.post("/api/leads", (req, res) => {
  const db = getDB();
  const newLead = req.body;
  db.leads = [newLead, ...db.leads];
  saveDB(db);

  // Trigger real Webhook if webhookUrl is configured
  if (db.formConfig && db.formConfig.webhookUrl && db.formConfig.webhookUrl.trim() !== "") {
    const targetUrl = db.formConfig.webhookUrl.trim();
    fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Reels-Lead-Webhook-Sender"
      },
      body: JSON.stringify({
        event: "lead.created",
        lead: {
          id: newLead.id,
          name: newLead.name,
          phone: newLead.phone,
          notes: newLead.notes,
          quizAnswers: newLead.quizAnswers || "",
          timestamp: newLead.timestamp,
          sourceReelId: newLead.sourceReelId
        },
        timestamp: new Date().toISOString()
      })
    }).catch(err => {
      console.error("Errore nell'invio del Webhook automatico:", err.message);
    });
  }

  res.json({ success: true, leads: db.leads });
});

app.delete("/api/leads/:id", (req, res) => {
  const db = getDB();
  db.leads = db.leads.filter((l: any) => l.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, leads: db.leads });
});

app.delete("/api/leads", (req, res) => {
  const db = getDB();
  db.leads = [];
  saveDB(db);
  res.json({ success: true, leads: [] });
});

app.get("/api/form-config", (req, res) => {
  const db = getDB();
  res.json(db.formConfig);
});

app.post("/api/form-config", (req, res) => {
  const db = getDB();
  db.formConfig = { ...db.formConfig, ...req.body };
  saveDB(db);
  res.json({ success: true, formConfig: db.formConfig });
});

// Video Upload Route
app.post("/api/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nessun file caricato" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Reset Database Route
app.post("/api/reset", (req, res) => {
  const db = {
    reels: INITIAL_REELS,
    leads: [],
    formConfig: {
      title: "Prenota una Consulenza Gratuita",
      subtitle: "Hai completato la visione! Compila il modulo di candidatura qui sotto per essere ricontattato da un nostro consulente strategico.",
      buttonText: "Invia la mia Candidatura",
      autoUnlock: true,
      webhookUrl: ""
    }
  };
  saveDB(db);
  res.json({ success: true, ...db });
});

// Test Webhook Route
app.post("/api/test-webhook", (req, res) => {
  const { webhookUrl } = req.body;
  if (!webhookUrl || webhookUrl.trim() === "") {
    return res.status(400).json({ error: "URL del Webhook non fornito o vuoto" });
  }

  const targetUrl = webhookUrl.trim();
  fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Reels-Lead-Webhook-Test"
    },
    body: JSON.stringify({
      event: "webhook.test",
      lead: {
        id: "test-id-999",
        name: "Mario Rossi (Test)",
        phone: "+39 333 1234567",
        notes: "Sito Web / Lead Magnet (Test)",
        quizAnswers: "Video 3: Opzione 1 | Video 4: Opzione 2",
        timestamp: new Date().toLocaleString("it-IT"),
        sourceReelId: 4
      },
      message: "Questo è un test per verificare la connessione del webhook con la tua automazione (Zapier, Make, o CRM).",
      timestamp: new Date().toISOString()
    })
  })
  .then(async (response) => {
    if (response.ok) {
      res.json({ success: true, message: `Webhook di test inviato con successo! Ricevuto stato HTTP ${response.status}` });
    } else {
      const bodyText = await response.text().catch(() => "");
      res.json({ 
        success: false, 
        message: `Il server remoto ha risposto con stato ${response.status}: ${bodyText.substring(0, 100)}` 
      });
    }
  })
  .catch((err) => {
    res.json({ success: false, message: `Errore durante l'invio della richiesta: ${err.message}` });
  });
});

// Vite Middleware integration for dev/prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
