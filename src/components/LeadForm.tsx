import React, { useState } from "react";
import { 
  Lock, 
  Unlock, 
  Send, 
  CheckCircle, 
  User, 
  Phone, 
  Briefcase, 
  Sparkles,
  Play
} from "lucide-react";

interface LeadFormProps {
  viewedCount: number;
  totalCount: number;
  onAddLead: (lead: { name: string; email: string; phone: string; notes: string; sourceReelId: number }) => void;
  activeReelId: number;
  isUnlocked: boolean;
  formTitle?: string;
  formSubtitle?: string;
  formButtonText?: string;
  isEmbeddedInPhone?: boolean; // True when rendered inside the mobile viewport
}

export default function LeadForm({
  viewedCount,
  totalCount,
  onAddLead,
  activeReelId,
  isUnlocked,
  formTitle = "Candidati Ora & Parla Con Noi",
  formSubtitle = "Lascia i tuoi dati qui sotto. Ti ricontatteremo entro 24 ore per una consulenza strategica gratuita.",
  formButtonText = "Richiedi Consulenza Gratuita",
  isEmbeddedInPhone = false
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState(""); // Representing "Tipo di attività"
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Per favore, inserisci il tuo nome completo.");
      return;
    }
    if (!phone.trim() || phone.length < 6) {
      setErrorMsg("Per favore, inserisci un numero di telefono valido.");
      return;
    }
    if (!notes.trim()) {
      setErrorMsg("Per favore, inserisci il nome della tua attività.");
      return;
    }

    // Add Lead (email defaults to empty placeholder "-")
    onAddLead({
      name,
      email: "-",
      phone,
      notes,
      sourceReelId: activeReelId
    });

    setSubmitted(true);
    setName("");
    setPhone("");
    setNotes("");
  };

  if (submitted) {
    return (
      <div 
        id="lead-form-success"
        className="flex flex-col items-center justify-center text-center animate-fade-in h-full p-6 bg-black text-white rounded-2xl border border-neutral-900"
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-pink-500/20 animate-bounce">
          <CheckCircle className="w-9 h-9 text-white" />
        </div>
        <h3 className="font-bold text-xl mb-2 text-white">
          Richiesta Inviata!
        </h3>
        <p className="text-sm max-w-xs leading-relaxed text-neutral-300">
          Grazie per aver guardato la nostra presentazione. Un nostro specialista analizzerà la tua richiesta e ti contatterà via telefono o WhatsApp entro 24 ore lavorative.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-xs bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 px-5 rounded-full transition cursor-pointer border border-neutral-800"
        >
          Invia un'altra richiesta
        </button>
      </div>
    );
  }

  return (
    <div 
      id="lead-form-container"
      className={`relative transition-all duration-500 ${
        isEmbeddedInPhone 
          ? "h-full bg-black text-white p-6 flex flex-col justify-center select-none" 
          : "bg-[#121212] rounded-2xl p-6 border border-neutral-900 text-white shadow-xl"
      }`}
    >
      {/* Gamified Lock Screen Overlay (Only shown on Desktop when locked) */}
      {!isUnlocked && !isEmbeddedInPhone && (
        <div className="absolute inset-0 bg-[#121212]/95 backdrop-blur-sm z-30 rounded-2xl p-6 flex flex-col items-center justify-center text-center select-none border border-neutral-900">
          <div className="w-12 h-12 bg-neutral-950 text-pink-500 rounded-full flex items-center justify-center mb-4 border border-neutral-850">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[10px] bg-pink-950/40 text-pink-400 border border-pink-900/55 font-bold uppercase tracking-widest px-3 py-1 rounded-full select-none mb-2">
            Modulo Bloccato
          </span>
          <h3 className="font-bold text-lg text-white mb-1">
            Guarda la Presentazione
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs mb-5">
            Sbloccherai automaticamente il modulo di candidatura non appena avrai visto o scrollato tutti i video informativi.
          </p>
          
          {/* Progress Tracker Checklist */}
          <div className="w-full max-w-[260px] space-y-2 bg-[#000000] border border-neutral-850 p-3.5 rounded-xl mb-4 text-left">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
              I tuoi progressi di sblocco:
            </div>
            {Array.from({ length: totalCount }).map((_, idx) => {
              const videoNum = idx + 1;
              const isViewed = videoNum <= viewedCount;
              return (
                <div key={videoNum} className="flex items-center justify-between text-xs font-medium">
                  <span className="text-neutral-300 flex items-center gap-1.5">
                    <Play className="w-3 h-3 text-neutral-500 fill-neutral-600" />
                    Video di spiegazione {videoNum}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    isViewed 
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" 
                      : "bg-neutral-900 text-neutral-500"
                  }`}>
                    {isViewed ? "VISTO ✓" : "DA VEDERE"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Guarda ancora {totalCount - viewedCount} video per sbloccare!</span>
          </div>
        </div>
      )}

      {/* Embedded/Phone visual for LOCK on mobile */}
      {!isUnlocked && isEmbeddedInPhone && (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 bg-neutral-900 text-neutral-300 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
            <Lock className="w-5 h-5 text-pink-500" />
          </div>
          <span className="text-[9px] bg-pink-500/10 text-pink-400 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2">
            🔒 COMPLETA LA VISIONE
          </span>
          <h3 className="font-bold text-base text-white mb-1.5">
            Modulo non ancora attivo
          </h3>
          <p className="text-xs text-neutral-400 max-w-[250px] mb-4">
            Scorri verso l'alto per completare la visione degli altri video prima di candidarti!
          </p>
          <div className="text-xs text-neutral-400 bg-neutral-900/60 p-3 rounded-lg w-full max-w-[220px] mb-4 text-left border border-neutral-800">
            <p className="font-bold text-[10px] text-pink-400 uppercase mb-1">Status:</p>
            <p>Video visti: <strong>{viewedCount}</strong> su <strong>{totalCount}</strong></p>
          </div>
          <p className="text-[10px] text-neutral-500">
            Scorri i video per sbloccare automaticamente.
          </p>
        </div>
      )}

      {/* ACTUAL FORM */}
      {(isUnlocked || (!isUnlocked && !isEmbeddedInPhone)) && (
        <div className={`space-y-4 animate-fade-in ${!isUnlocked ? "opacity-30 blur-[2px] pointer-events-none" : ""}`}>
          <div className="text-center select-none">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 bg-emerald-500/15 text-emerald-400">
              <Unlock className="w-3 h-3" />
              <span>Sbloccato con successo!</span>
            </span>
            <h2 className="font-bold tracking-tight text-white text-lg lg:text-xl">
              {formTitle}
            </h2>
            <p className="text-xs mt-1 leading-relaxed text-neutral-400">
              {formSubtitle}
            </p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-3.5"
            name="candidatura-form"
            data-netlify="true"
          >
            <input type="hidden" name="form-name" value="candidatura-form" />

            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                name="name"
                placeholder="Nome e Cognome *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#000000] border border-neutral-800 text-white placeholder-neutral-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                name="phone"
                placeholder="Numero di Telefono (WhatsApp) *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#000000] border border-neutral-800 text-white placeholder-neutral-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Nome attività */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                name="notes"
                placeholder="Nome attività *"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#000000] border border-neutral-800 text-white placeholder-neutral-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-red-500 font-bold text-[10px] animate-pulse bg-red-950/35 p-2 rounded-lg border border-red-900/40 text-center">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{formButtonText}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
