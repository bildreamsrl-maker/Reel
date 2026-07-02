import React, { useState, useRef } from "react";
import { 
  Upload, 
  Sparkles, 
  User, 
  Music, 
  FileText, 
  RefreshCw,
  Video,
  AlertCircle,
  Database,
  Settings,
  Download,
  Trash2,
  Lock,
  Unlock,
  Check,
  Briefcase,
  Phone,
  HelpCircle
} from "lucide-react";
import { ReelVideo, LeadItem } from "../types";

interface VideoManagerProps {
  reels: ReelVideo[];
  onUpdateReel: (id: number, updatedFields: Partial<ReelVideo>) => void;
  onResetToDefault: () => void;
  onSelectReel: (id: number) => void;
  activeReelId: number;
  
  // Leads management
  leads: LeadItem[];
  onDeleteLead: (id: string) => void;
  onClearAllLeads: () => void;
  
  // Form configuration
  formConfig: {
    title: string;
    subtitle: string;
    buttonText: string;
    autoUnlock: boolean;
    webhookUrl?: string;
  };
  onUpdateFormConfig: (updatedFields: Partial<VideoManagerProps["formConfig"]>) => void;
}

export default function VideoManager({
  reels,
  onUpdateReel,
  onResetToDefault,
  onSelectReel,
  activeReelId,
  leads,
  onDeleteLead,
  onClearAllLeads,
  formConfig,
  onUpdateFormConfig
}: VideoManagerProps) {
  const [activeTab, setActiveTab] = useState<"videos" | "leads" | "settings">("videos");
  const [dragActive, setDragActive] = useState<Record<number, boolean>>({});
  const [uploadingReelId, setUploadingReelId] = useState<number | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [testWebhookLoading, setTestWebhookLoading] = useState(false);
  const [testWebhookResult, setTestWebhookResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestWebhook = () => {
    if (!formConfig.webhookUrl || !formConfig.webhookUrl.trim()) return;
    setTestWebhookLoading(true);
    setTestWebhookResult(null);

    fetch("/api/test-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: formConfig.webhookUrl })
    })
      .then(res => res.json())
      .then(data => {
        setTestWebhookResult({
          success: data.success,
          message: data.message || (data.success ? "Webhook di test inviato correttamente!" : "Impossibile inviare il webhook.")
        });
      })
      .catch(err => {
        setTestWebhookResult({
          success: false,
          message: "Errore di connessione: " + err.message
        });
      })
      .finally(() => {
        setTestWebhookLoading(false);
      });
  };

  const handleDrag = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [id]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file, id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file, id);
    }
  };

  const handleFile = async (file: File, id: number) => {
    if (!file.type.startsWith("video/")) {
      alert("Per favore carica un file video valido (es. MP4, WebM)");
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Il video supera il limite di 100MB consentito dal server.");
      return;
    }

    setUploadingReelId(id);
    setUploadWarning(null);

    // Create and set local Object URL instantly so that it plays immediately in the client!
    const localBlobUrl = URL.createObjectURL(file);
    onUpdateReel(id, {
      videoUrl: localBlobUrl,
      isUploadedByUser: true
    });
    onSelectReel(id);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Errore nel caricamento: il server ha risposto con codice non valido");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.url) {
          // Success! Replace the local URL with the server's permanent URL
          onUpdateReel(id, {
            videoUrl: data.url,
            isUploadedByUser: true
          });
        } else {
          throw new Error("Risposta del server incompleta (url mancante)");
        }
      } else {
        throw new Error("La risposta del server non è in formato JSON");
      }
    } catch (err) {
      console.warn("Upload background server fallito. Uso fallback blob locale per l'anteprima:", err);
      setUploadWarning(
        "Il video è stato caricato localmente e funziona correttamente nell'anteprima! Tuttavia, non è stato possibile salvarlo in modo permanente sul server (es. file troppo grande o connessione interrotta). Se vuoi renderlo permanente per tutti gli utenti, ti raccomandiamo di usare l'opzione 'Link Pubblico' o incollare un link MP4 esterno."
      );
    } finally {
      setUploadingReelId(null);
    }
  };

  const triggerFileInput = (id: number) => {
    fileInputRefs.current[id]?.click();
  };

  // Export leads to CSV file
  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert("Nessun lead da esportare!");
      return;
    }

    const headers = ["ID", "Nome e Cognome", "Telefono", "Tipo di Attività", "Risposte Sondaggio", "Data e Ora", "Video di Provenienza (Reel ID)"];
    const rows = leads.map(lead => [
      lead.id,
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.phone.replace(/"/g, '""')}"`,
      `"${lead.notes.replace(/"/g, '""')}"`,
      `"${(lead.quizAnswers || "").replace(/"/g, '""')}"`,
      lead.timestamp,
      lead.sourceReelId
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_campagna_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLeads = () => {
    if (window.confirm("Sei sicuro di voler cancellare TUTTI i lead dal database locale? L'operazione è irreversibile!")) {
      onClearAllLeads();
    }
  };

  return (
    <div 
      id="video-manager-panel"
      className="bg-white rounded-2xl p-5 text-neutral-800 flex flex-col h-full max-h-screen overflow-y-auto no-scrollbar shadow-xs"
    >
      {/* Header */}
      <div className="border-b border-gray-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 rounded-xl text-pink-600 border border-pink-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-neutral-900 leading-tight">
              Pannello di Controllo
            </h2>
            <p className="text-[11px] text-neutral-500 font-medium">Gestisci video, leads e modulo di contatto</p>
          </div>
        </div>

        {/* Custom Tab Bar */}
        <div className="flex mt-4 bg-gray-50 p-1 rounded-xl border border-gray-100/50 select-none">
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "videos" 
                ? "bg-white text-neutral-900 shadow-xs border border-gray-100" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>I Miei Video</span>
          </button>
          
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeTab === "leads" 
                ? "bg-white text-neutral-900 shadow-xs border border-gray-100" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Leads</span>
            {leads.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-[9px] text-white font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                {leads.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "settings" 
                ? "bg-white text-neutral-900 shadow-xs border border-gray-100" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Modulo</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: VIDEOS */}
      {activeTab === "videos" && (
        <div className="flex-1 space-y-5">
          {uploadWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-lg flex items-start gap-2 animate-fade-in shadow-xs">
              <span className="text-sm select-none mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold leading-relaxed">{uploadWarning}</p>
                <button 
                  onClick={() => setUploadWarning(null)} 
                  className="mt-1 text-[10px] text-amber-900 underline font-bold hover:text-amber-950 block focus:outline-none cursor-pointer"
                >
                  Nascondi messaggio
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Slots Video di Spiegazione</span>
            <button
              onClick={onResetToDefault}
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-neutral-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all focus:outline-none cursor-pointer font-bold border border-gray-200 shadow-sm"
              title="Ripristina i 4 video originali"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Ripristina Originali</span>
            </button>
          </div>

          <div className="space-y-4">
            {reels.map((reel) => {
              const isCurrentActive = reel.id === activeReelId;
              const isDragActive = dragActive[reel.id] || false;

              return (
                <div
                  key={reel.id}
                  id={`editor-slot-${reel.id}`}
                  className={`border rounded-xl p-3.5 transition-all duration-300 ${
                    isCurrentActive 
                      ? "border-pink-500 bg-pink-50/10 shadow-xs" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectReel(reel.id)}
                      className="flex items-center gap-2 font-bold text-xs hover:text-pink-600 text-left cursor-pointer focus:outline-none"
                    >
                      <span className={`h-4.5 w-4.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isCurrentActive ? "bg-pink-500 text-white" : "bg-gray-100 text-neutral-500"
                      }`}>
                        {reel.id}
                      </span>
                      <span className="text-neutral-800">Video Informativo {reel.id}</span>
                      {isCurrentActive && (
                        <span className="text-[8px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-bold select-none uppercase tracking-wider">
                          Attivo
                        </span>
                      )}
                    </button>
                    {reel.isUploadedByUser && (
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-1.5 py-0.5 rounded-full font-bold select-none uppercase tracking-wider">
                        Personalizzato
                      </span>
                    )}
                  </div>

                  {/* Drag & Drop Upload */}
                  <div
                    onDragEnter={(e) => handleDrag(e, reel.id)}
                    onDragOver={(e) => handleDrag(e, reel.id)}
                    onDragLeave={(e) => handleDrag(e, reel.id)}
                    onDrop={(e) => handleDrop(e, reel.id)}
                    onClick={() => {
                      if (uploadingReelId === null) {
                        triggerFileInput(reel.id);
                      }
                    }}
                    className={`border-2 border-dashed rounded-lg p-3 mb-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-pink-500 bg-pink-50/30"
                        : "border-gray-100 hover:border-gray-200 bg-gray-50/30 hover:bg-gray-50"
                    } ${uploadingReelId === reel.id ? "pointer-events-none opacity-80" : ""}`}
                  >
                    <input
                      ref={(el) => {
                        fileInputRefs.current[reel.id] = el;
                      }}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, reel.id)}
                      className="hidden"
                      disabled={uploadingReelId !== null}
                    />
                    
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="w-10 h-14 bg-neutral-900 rounded-lg overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-gray-100 shadow-xs">
                        {reel.videoUrl ? (
                          <video 
                            src={reel.videoUrl} 
                            className="w-full h-full object-cover opacity-60"
                            muted
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallbacks = [
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
                              ];
                              const fallbackUrl = fallbacks[reel.id % fallbacks.length];
                              if (target.src !== fallbackUrl) {
                                target.src = fallbackUrl;
                              }
                            }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-950" />
                        )}
                        {uploadingReelId === reel.id ? (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                            <RefreshCw className="w-4.5 h-4.5 text-pink-500 animate-spin" />
                          </div>
                        ) : (
                          <Video className="w-3.5 h-3.5 text-white absolute" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        {uploadingReelId === reel.id ? (
                          <>
                            <p className="text-[11px] text-pink-600 font-extrabold animate-pulse">
                              Caricamento sul server...
                            </p>
                            <p className="text-[9px] text-neutral-400 font-medium">
                              Salvataggio permanente in corso
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] text-neutral-700 font-bold truncate">
                              {reel.isUploadedByUser 
                                ? (reel.videoUrl.startsWith("/uploads/") ? "Video caricato sul server" : "Video da link pubblico") 
                                : "Video predefinito"}
                            </p>
                            <p className="text-[9px] text-neutral-400 font-medium">
                              Trascina o clicca per caricare un file video
                            </p>
                          </>
                        )}
                      </div>
                      <Upload className="w-4 h-4 text-neutral-400 hover:text-neutral-700 flex-shrink-0" />
                    </div>
                  </div>

                  {/* URL Input Field */}
                  <div className="mb-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <label className="text-[10px] font-extrabold text-neutral-600 uppercase tracking-wider block mb-1">
                      Link diretto Video (Consigliato per pubblicare)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="Incolla link MP4 pubblico (es. Dropbox, Vimeo)"
                        value={(reel.videoUrl && !reel.videoUrl.startsWith("/uploads/")) ? reel.videoUrl : ""}
                        onChange={(e) => {
                          const url = e.target.value;
                          onUpdateReel(reel.id, { 
                            videoUrl: url || [
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
                            ][(reel.id - 1) % 4], 
                            isUploadedByUser: !!url 
                          });
                        }}
                        className="flex-1 bg-white border border-gray-200 rounded-lg py-1 px-2 text-[10px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 font-medium"
                      />
                      {reel.isUploadedByUser && (
                        <button
                          type="button"
                          onClick={() => {
                            const fallbacks = [
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
                            ];
                            onUpdateReel(reel.id, { 
                              videoUrl: fallbacks[(reel.id - 1) % fallbacks.length], 
                              isUploadedByUser: false 
                            });
                          }}
                          className="px-2 bg-gray-100 hover:bg-gray-200 text-neutral-500 hover:text-neutral-700 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    {reel.videoUrl.startsWith("/uploads/") ? (
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[8.5px] text-amber-600 font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 text-amber-500" /> Caricato sul server (In Cloud Run il disco locale è temporaneo)
                        </p>
                        <p className="text-[8px] text-neutral-500 leading-snug">
                          ⚠️ Poiché l'app gira in un container cloud temporaneo, i video caricati localmente dal computer potrebbero essere cancellati ad ogni riavvio del server. Per renderli <strong>permanenti al 100%</strong>, consigliamo vivamente di incollare un <strong>Link Pubblico Diretto</strong> (es. Dropbox, Vimeo o hosting esterno) nel campo sopra.
                        </p>
                      </div>
                    ) : (
                      <p className="text-[8.5px] text-neutral-400 font-medium mt-1">
                        Incolla un link pubblico diretto del video (.mp4) oppure trascina un file sopra per caricarlo sul server. Consigliato l'uso di link diretti esterni per massima permanenza.
                      </p>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-2">
                    {/* Speaker Username */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                        <User className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        placeholder="Nome Relatore / Azienda"
                        value={reel.username || ""}
                        onChange={(e) => onUpdateReel(reel.id, { username: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                        className="w-full bg-gray-50 border border-gray-150 hover:border-gray-200 rounded-lg py-1.5 pl-7 pr-2 text-[10px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/20 transition-all font-medium"
                      />
                    </div>

                    {/* Didascalia / Titolo del video */}
                    <div className="relative">
                      <div className="absolute top-2 left-0 pl-2.5 flex items-start pointer-events-none text-neutral-400">
                        <FileText className="w-3 h-3" />
                      </div>
                      <textarea
                        placeholder="Testo didascalia (es. Spiegazione dei vantaggi o invito all'azione)"
                        value={reel.caption || ""}
                        rows={2}
                        onChange={(e) => onUpdateReel(reel.id, { caption: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-150 hover:border-gray-200 rounded-lg py-1.5 pl-7 pr-2 text-[10px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/20 transition-all font-medium resize-none"
                      />
                    </div>

                    {/* Traccia musicale */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-neutral-400">
                          <Music className="w-2.5 h-2.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Brano"
                          value={reel.musicName || ""}
                          onChange={(e) => onUpdateReel(reel.id, { musicName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-150 hover:border-gray-200 rounded-lg py-1 pl-6 pr-1 text-[9px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/20 transition-all font-medium"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Artista"
                          value={reel.musicArtist || ""}
                          onChange={(e) => onUpdateReel(reel.id, { musicArtist: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-150 hover:border-gray-200 rounded-lg py-1 px-2 text-[9px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/20 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Quiz configuration fields for all videos */}
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-pink-600">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Sondaggio / Pulsanti risposta a fine video</span>
                      </div>
                      
                      <p className="text-[8px] text-neutral-500 font-medium">
                        (La domanda viene posta verbalmente nel video, qui configuri solo i pulsanti di risposta)
                      </p>

                      <div className="grid grid-cols-5 gap-1">
                        {[0, 1, 2, 3, 4].map((idx) => {
                          const currentOptions = reel.quizOptions || ["", "", "", "", ""];
                          return (
                            <input
                              key={idx}
                              type="text"
                              placeholder={`Opz ${idx + 1}`}
                              value={currentOptions[idx] || ""}
                              onChange={(e) => {
                                const newOptions = [...currentOptions];
                                while (newOptions.length <= idx) {
                                  newOptions.push("");
                                }
                                newOptions[idx] = e.target.value;
                                onUpdateReel(reel.id, { quizOptions: newOptions });
                              }}
                              className="w-full bg-gray-50 border border-gray-150 hover:border-gray-200 rounded-lg py-1 px-1 text-[8px] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/20 transition-all font-medium text-center"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guidelines info */}
          <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-start gap-2 text-neutral-600">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-[9px] leading-relaxed font-medium">
              I video che carichi vengono salvati in locale nel browser. Per ottenere massimi risultati con le tue sponsorizzate di lead generation, carica video registrati verticalmente (9:16) in cui spieghi la tua offerta in modo coinvolgente.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEADS */}
      {activeTab === "leads" && (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Lead Ricevuti dalle Campagne</span>
            {leads.length > 0 && (
              <div className="flex gap-1.5">
                <button
                  onClick={handleExportCSV}
                  className="text-[10px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all font-bold cursor-pointer shadow-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Esporta Excel/CSV</span>
                </button>
                <button
                  onClick={handleClearLeads}
                  className="text-[10px] bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 p-1 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  title="Svuota database"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {leads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-2xl py-12">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Database className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-xs font-bold text-neutral-700">Nessun lead ricevuto</p>
              <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px] leading-relaxed font-medium">
                I candidati compariranno qui non appena compileranno il modulo di contatto sulla tua landing page!
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[50vh]">
              {leads.map((lead) => (
                <div 
                  key={lead.id}
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-3 shadow-xs relative group transition-all"
                >
                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="absolute top-2.5 right-2.5 text-neutral-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    title="Elimina lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1.5 text-[11px] text-neutral-600">
                    <p className="font-bold text-neutral-900 text-xs truncate pr-6">{lead.name}</p>
                    
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <a href={`tel:${lead.phone}`} className="hover:underline font-bold text-neutral-800 select-all">{lead.phone}</a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="text-neutral-700">Nome Attività: <strong className="text-neutral-950 font-semibold select-all">{lead.notes}</strong></span>
                    </div>

                    {lead.quizAnswers && (
                      <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-150 flex items-start gap-1.5">
                        <HelpCircle className="w-3 h-3 text-pink-500 mt-0.5 flex-shrink-0" />
                        <div className="text-[10px] text-neutral-600">
                          <span className="font-bold text-neutral-800">Sondaggio: </span>
                          <span className="italic select-all">{lead.quizAnswers}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 mt-1 text-[9px] text-neutral-400 font-medium select-none">
                      <span>{lead.timestamp}</span>
                      <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-full font-bold">
                        Sorgente: Video {lead.sourceReelId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FORM SETTINGS */}
      {activeTab === "settings" && (
        <div className="flex-1 space-y-4">
          <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block">Personalizza Modulo di Contatto</span>
          
          <div className="space-y-3.5">
            {/* Form Title */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 block mb-1">Titolo Principale del Modulo</label>
              <input
                type="text"
                value={formConfig.title || ""}
                onChange={(e) => onUpdateFormConfig({ title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg py-1.5 px-3 text-xs text-neutral-800 font-medium focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/10"
              />
            </div>

            {/* Form Subtitle */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 block mb-1">Descrizione / Sottotitolo</label>
              <textarea
                value={formConfig.subtitle || ""}
                rows={3}
                onChange={(e) => onUpdateFormConfig({ subtitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg py-1.5 px-3 text-xs text-neutral-800 font-medium focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/10 resize-none leading-relaxed"
              />
            </div>

            {/* Button Call to action text */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 block mb-1">Testo Pulsante d'Invio</label>
              <input
                type="text"
                value={formConfig.buttonText || ""}
                onChange={(e) => onUpdateFormConfig({ buttonText: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg py-1.5 px-3 text-xs text-neutral-800 font-medium focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500/10"
              />
            </div>

            {/* Lock Checkbox */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-150 flex items-start gap-3 mt-2 select-none">
              <input
                type="checkbox"
                id="autoUnlockCheckbox"
                checked={!!formConfig.autoUnlock}
                onChange={(e) => onUpdateFormConfig({ autoUnlock: e.target.checked })}
                className="mt-1 h-4 w-4 rounded text-pink-600 border-gray-300 focus:ring-pink-500 cursor-pointer"
              />
              <div className="flex-1 text-left cursor-pointer" onClick={() => onUpdateFormConfig({ autoUnlock: !formConfig.autoUnlock })}>
                <label htmlFor="autoUnlockCheckbox" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Blocco Visione Obbligatoria
                </label>
                <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug font-medium">
                  Se attivo, il modulo rimarrà bloccato (sfocato) finché l'utente non scorre tutti i video presentati. Disattivalo se vuoi permettere l'invio immediato.
                </p>
              </div>
            </div>

            <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl flex items-center gap-2 text-pink-800">
              {formConfig.autoUnlock ? (
                <>
                  <Lock className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span className="text-[9px] font-bold">L'utente deve scorrere i {reels.length} video per sbloccare il form.</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-[9px] font-bold text-emerald-800">Il modulo è sbloccato fin dal primo secondo!</span>
                </>
              )}
            </div>

            {/* Webhook Configuration Section */}
            <div className="border border-neutral-150 rounded-xl p-3 bg-neutral-50/50 mt-4 text-left">
              <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Integrazione Webhook (Make, Zapier, CRM)
              </h4>
              <p className="text-[10px] text-neutral-500 leading-snug mb-3">
                Consente di inoltrare istantaneamente i dati di ciascun nuovo Lead inserito ad un URL esterno (es. automazioni Make, Zapier, n8n o altri CRM aziendali) tramite una richiesta HTTP POST.
              </p>
              
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 block mb-1 uppercase tracking-wider">URL del Webhook</label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://hook.us1.make.com/abcde..."
                      value={formConfig.webhookUrl || ""}
                      onChange={(e) => onUpdateFormConfig({ webhookUrl: e.target.value })}
                      className="flex-1 bg-white border border-gray-250 hover:border-gray-300 rounded-lg py-1.5 px-3 text-xs text-neutral-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 placeholder-neutral-300"
                    />
                    
                    <button
                      type="button"
                      disabled={!formConfig.webhookUrl || !formConfig.webhookUrl.trim() || testWebhookLoading}
                      onClick={handleTestWebhook}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-150 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
                    >
                      {testWebhookLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Invio...
                        </>
                      ) : (
                        "Invia Test"
                      )}
                    </button>
                  </div>
                </div>

                {testWebhookResult && (
                  <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed transition-all ${
                    testWebhookResult.success 
                      ? "bg-emerald-50 border-emerald-150 text-emerald-800" 
                      : "bg-rose-50 border-rose-150 text-rose-800"
                  }`}>
                    <div className="font-bold mb-0.5 flex items-center gap-1">
                      {testWebhookResult.success ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      )}
                      {testWebhookResult.success ? "Connessione Riuscita!" : "Errore Invio Webhook"}
                    </div>
                    <span>{testWebhookResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
