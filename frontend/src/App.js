import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AudioLines,
  BadgeAlert,
  Command,
  Cpu,
  Crosshair,
  KeyRound,
  Mic,
  Orbit,
  Radar,
  SendHorizonal,
  Shield,
  Square,
  Waves,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteDialog } from "@/jarvisPreview/NoteDialog";
import { ReactorOrb } from "@/jarvisPreview/ReactorOrb";
import { SecondBrainGraph } from "@/jarvisPreview/SecondBrainGraph";
import {
  CONFIG,
  DEFAULT_NOTES,
  ORB_LABELS,
  STORAGE_KEYS,
  sampleResponse,
} from "@/jarvisPreview/constants";
import "@/App.css";

function getStoredNotes() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.notes);
    if (!raw) {
      return { notes: DEFAULT_NOTES, corrupted: false };
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) {
      return { notes: DEFAULT_NOTES, corrupted: true };
    }

    return { notes: parsed, corrupted: false };
  } catch {
    return { notes: DEFAULT_NOTES, corrupted: true };
  }
}

function createInitialDraft() {
  return { id: "", area: "projetos", title: "", body: "" };
}

function BootScreen() {
  return (
    <motion.section
      key="boot"
      className="phase-screen boot-screen"
      data-testid="boot-screen"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className="phase-chip" data-testid="boot-phase-chip">EXECUTIVE LINK</span>
      <h1 className="phase-title" data-testid="boot-assistant-name">{CONFIG.name}</h1>
      <div className="boot-line" data-testid="boot-gradient-line" />
      <p className="boot-sync" data-testid="boot-sync-text">SINCRONIZANDO DADOS...</p>
      <p className="boot-version" data-testid="boot-version-text">v5.0 · REBUILD</p>
    </motion.section>
  );
}

function ActivationScreen({ onActivate }) {
  return (
    <motion.section
      key="activation"
      className="phase-screen activation-screen cinematic-activation"
      data-testid="activation-screen"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div className="activation-orb-shadow" />
      <span className="phase-chip" data-testid="activation-chip">IRON CORE PROTOCOL : PRODUZIDO POR CEO AI</span>
      <h1 className="phase-title" data-testid="activation-assistant-name">{CONFIG.name}</h1>
      <p className="activation-copy" data-testid="activation-copy">
        Sala de comando pessoal com presença cinematográfica, núcleo vivo e memória estratégica visual.
      </p>
      <Button
        type="button"
        className="jarvis-button-primary activation-button"
        data-testid="activate-system-button"
        onClick={onActivate}
      >
        <AudioLines size={18} />
        ATIVAR SISTEMA
      </Button>
      <p className="activation-hint" data-testid="activation-hint">CLIQUE PARA INICIAR</p>
    </motion.section>
  );
}

function TechDial({ label, value, sublabel, testId }) {
  return (
    <div className="tech-dial" data-testid={testId}>
      <div className="tech-dial-ring">
        <span className="tech-dial-value">{value}</span>
      </div>
      <div className="tech-dial-copy">
        <span className="tech-dial-label">{label}</span>
        <span className="tech-dial-sublabel">{sublabel}</span>
      </div>
    </div>
  );
}

function MetricPanel({ title, value, detail, testId }) {
  return (
    <div className="metric-panel hud-bracket-panel" data-testid={testId}>
      <span className="metric-title">{title}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </div>
  );
}

function DataColumn({ title, items, testId }) {
  return (
    <div className="data-column hud-bracket-panel" data-testid={testId}>
      <span className="data-column-title">{title}</span>
      <div className="data-column-list">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="data-row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const initialStorage = useMemo(() => getStoredNotes(), []);
  const speechUtteranceRef = useRef(null);
  const speechAnimationTimerRef = useRef(null);
  const voicesRef = useRef([]);
  const [phase, setPhase] = useState("boot");
  const [orbState, setOrbState] = useState("idle");
  const [speechPulse, setSpeechPulse] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [notes, setNotes] = useState(initialStorage.notes);
  const [apiKey, setApiKey] = useState(() => window.localStorage.getItem(STORAGE_KEYS.key) || "");
  const [input, setInput] = useState("");
  const [activeNoteId, setActiveNoteId] = useState("meta-ceo");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorNote, setEditorNote] = useState(null);
  const [messages, setMessages] = useState([
    { role: "user", text: "Quero ver uma versão cinematográfica do meu JARVAS CEO." },
    {
      role: "assistant",
      text: "Cena pronta, senhor. Agora o sistema assume uma HUD técnica densa, com núcleo dominante e painéis em estilo Stark.",
    },
  ]);

  const telemetry = useMemo(
    () => [
      { label: "HORA", value: "13:13" },
      { label: "SETOR", value: "CEO DECK" },
      { label: "LATÊNCIA", value: "24ms" },
      { label: "UPTIME", value: "99.98%" },
    ],
    [],
  );

  const rightData = useMemo(
    () => [
      { label: "CLIMA", value: "13° C" },
      { label: "MODO", value: "EXECUTIVO" },
      { label: "QUEUE", value: `${notes.length} NÓS` },
      { label: "STATE", value: ORB_LABELS[orbState] },
    ],
    [notes.length, orbState],
  );

  const pickPortugueseVoice = () => {
    const voices = voicesRef.current;
    const ptVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt-br") || voice.lang?.toLowerCase().startsWith("pt"));
    return ptVoices[0] || voices[0] || null;
  };

  const simulateSpeechMotion = (text, nextState = "listening") => {
    window.clearInterval(speechAnimationTimerRef.current);
    setOrbState("speaking");
    setSpeechPulse(1);

    const estimatedWords = Math.max(text.trim().split(/\s+/).length, 4);
    let tick = 0;
    speechAnimationTimerRef.current = window.setInterval(() => {
      tick += 1;
      setSpeechPulse((tick % 5) + 1);
    }, 120);

    window.setTimeout(() => {
      window.clearInterval(speechAnimationTimerRef.current);
      setSpeechPulse(0);
      setOrbState(nextState);
    }, Math.min(Math.max(estimatedWords * 180, 900), 3200));
  };

  const speakText = (text, nextState = "listening") => {
    if (!text?.trim()) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      simulateSpeechMotion(text, nextState);
      return;
    }

    window.speechSynthesis?.cancel();
    window.clearInterval(speechAnimationTimerRef.current);
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = pickPortugueseVoice();

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "pt-BR";
    }

    utterance.rate = 1;
    utterance.pitch = CONFIG.voiceGender === "masculina" ? 0.9 : 1.05;
    utterance.onstart = () => {
      setOrbState("speaking");
      setSpeechPulse(1);
    };
    utterance.onboundary = (event) => {
      if (event.name === "word" || typeof event.charIndex === "number") {
        setSpeechPulse((event.charIndex % 5) + 1);
      }
    };
    utterance.onend = () => {
      setSpeechPulse(0);
      setOrbState(nextState);
      speechUtteranceRef.current = null;
    };
    utterance.onerror = () => {
      setSpeechPulse(0);
      setOrbState(nextState);
      speechUtteranceRef.current = null;
      simulateSpeechMotion(text, nextState);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const requestFullscreenMode = async () => {
    if (!document.documentElement.requestFullscreen || document.fullscreenElement) {
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
    } catch {
      toast("O navegador bloqueou o fullscreen automático.");
    }
  };

  const toggleFullscreenMode = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await requestFullscreenMode();
      }
    } catch {
      toast.error("Não consegui alternar o modo tela cheia.");
    }
  };

  const latestUser = [...messages].reverse().find((message) => message.role === "user")?.text || "Aguardando comando...";
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant")?.text || "Prévia pronta.";

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return undefined;
    }

    const syncVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    syncVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", syncVoices);

    return () => {
      window.speechSynthesis?.cancel();
      window.clearInterval(speechAnimationTimerRef.current);
      window.speechSynthesis.removeEventListener?.("voiceschanged", syncVoices);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);


  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("activation");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialStorage.corrupted) {
      toast("Memória local restaurada para o modo de prévia.");
    }
  }, [initialStorage.corrupted]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.key, apiKey);
  }, [apiKey]);


  const openNoteDialog = (noteId) => {
    if (noteId) {
      const found = notes.find((note) => note.id === noteId);
      setEditorNote(found || null);
      setActiveNoteId(noteId);
    } else {
      setEditorNote(createInitialDraft());
    }
    setEditorOpen(true);
  };

  const closeDialog = () => {
    setEditorOpen(false);
    setEditorNote(null);
  };

  const saveNote = (draft) => {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast.error("Preencha título e conteúdo para salvar a memória.");
      return;
    }

    if (draft.id) {
      setNotes((current) =>
        current.map((note) => (note.id === draft.id ? { ...note, ...draft, title: draft.title.trim(), body: draft.body.trim() } : note)),
      );
      setActiveNoteId(draft.id);
      toast.success("Memória atualizada na prévia.");
    } else {
      const newId = `note-${Date.now()}`;
      setNotes((current) => [...current, { ...draft, id: newId, title: draft.title.trim(), body: draft.body.trim() }]);
      setActiveNoteId(newId);
      toast.success("Nova memória adicionada ao grafo.");
    }

    closeDialog();
  };

  const deleteNote = (noteId) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
    setActiveNoteId("meta-ceo");
    closeDialog();
    toast.success("Memória removida da prévia.");
  };

  const restorePreview = () => {
    setNotes(DEFAULT_NOTES);
    setActiveNoteId("meta-ceo");
    toast.success("Prévia restaurada ao estado original.");
  };

  const handleActivation = async () => {
    await requestFullscreenMode();
    setPhase("hud");
    setOrbState("thinking");
    const greeting = `Sistemas online. Estou ouvindo, ${CONFIG.address}.`;
    setMessages((current) => [...current, { role: "assistant", text: greeting }]);
    window.setTimeout(() => speakText(greeting, "listening"), 180);
  };

  const toggleListening = () => {
    if (orbState === "speaking") {
      window.speechSynthesis?.cancel();
      window.clearInterval(speechAnimationTimerRef.current);
      setSpeechPulse(0);
      setOrbState("idle");
      return;
    }

    setOrbState((current) => (current === "listening" ? "idle" : "listening"));
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    window.clearInterval(speechAnimationTimerRef.current);
    setSpeechPulse(0);
    setOrbState("idle");
    toast("Fala simulada interrompida.");
  };

  const sendCommand = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error("Digite um comando para testar a HUD.");
      return;
    }

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setOrbState("thinking");

    window.setTimeout(() => {
      const response = sampleResponse(trimmed, notes);
      setMessages((current) => [...current, { role: "assistant", text: response }]);
      speakText(response, "listening");
    }, 900);
  };

  return (
    <div className={`jarvis-cinematic-shell ${isFullscreen ? "immersive-fullscreen" : ""}`} data-testid="jarvis-preview-shell">
      <div className="cinematic-backdrop-image" />
      <div className="ambient-layer ambient-blue" />
      <div className="ambient-layer ambient-amber" />
      <div className="ambient-layer ambient-volume" />
      <div className="ambient-layer ambient-vignette" />
      <div className="shell-grid-overlay" />
      <div className="scanline-overlay" />
      <Toaster position="bottom-left" theme="dark" richColors />

      <AnimatePresence mode="wait">
        {phase === "boot" ? <BootScreen /> : null}
        {phase === "activation" ? <ActivationScreen onActivate={handleActivation} /> : null}

        {phase === "hud" ? (
          <motion.main
            key="hud"
            className="cinematic-stage"
            data-testid="main-hud-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <header className="stage-topbar hud-bracket-panel" data-testid="hud-topbar">
              <div className="stage-brand-block">
                <span className="stage-brand-mark"><Command size={15} strokeWidth={1.8} /></span>
                <div>
                  <p className="stage-brand-kicker" data-testid="topbar-kicker">EXECUTIVE COMPANION INTERFACE</p>
                  <h1 className="stage-brand-title" data-testid="topbar-title">{CONFIG.name}</h1>
                </div>
              </div>

              <div className="stage-telemetry" data-testid="stage-telemetry-strip">
                {telemetry.map((item) => (
                  <span key={item.label} className="telemetry-pill" data-testid={`telemetry-${item.label.toLowerCase()}`}>
                    {item.label} <strong>{item.value}</strong>
                  </span>
                ))}
              </div>

              <div className="stage-key-console hud-bracket-panel" data-testid="api-key-panel">
                <label className="stage-key-label" htmlFor="anthropic-key-input">
                  <KeyRound size={14} /> API KEY CLAUDE
                </label>
                <Input
                  id="anthropic-key-input"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Cole a chave aqui quando aprovar a versão final"
                  className="jarvis-input stage-key-input"
                  data-testid="anthropic-key-input"
                />
                <div className="stage-console-actions">
                  <span className="stage-preview-badge" data-testid="preview-badge">Prévia sem Claude ativo</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="jarvis-button-secondary fullscreen-toggle-button"
                    data-testid="fullscreen-toggle-button"
                    onClick={toggleFullscreenMode}
                  >
                    {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                  </Button>
                </div>
              </div>
            </header>

            <aside className="stage-rail stage-rail-left hud-bracket-panel" data-testid="chat-panel">
              <div className="rail-header">
                <p className="rail-kicker" data-testid="chat-panel-kicker">VOICE / COMMAND CHANNEL</p>
                <h2 className="rail-title" data-testid="chat-panel-title">Canal de interação</h2>
              </div>

              <div className="rail-pulse-pill" data-testid="status-pill">
                <Waves size={13} /> {ORB_LABELS[orbState]}
              </div>

              <div className="rail-mini-grid">
                <MetricPanel title="COMANDO" value="CEO" detail="Camada principal online" testId="left-metric-command" />
                <MetricPanel title="CPU" value="51%" detail="Fluxo estável" testId="left-metric-cpu" />
              </div>

              <div className="rail-log-panel hud-bracket-panel" data-testid="conversation-log">
                {messages.slice(-4).map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rail-message ${message.role}`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    <span className="rail-message-role">{message.role === "user" ? "VOCÊ" : CONFIG.name.toUpperCase()}</span>
                    <p className="rail-message-text">{message.text}</p>
                  </div>
                ))}
              </div>

              <DataColumn
                title="STATE STREAM"
                items={rightData}
                testId="left-data-stream"
              />

              <div className="rail-insight-box hud-bracket-panel" data-testid="status-card-runtime">
                <span className="rail-insight-label">STATUS</span>
                <strong className="rail-insight-value" data-testid="assistant-status-text">{ORB_LABELS[orbState]}</strong>
              </div>
            </aside>

            <section className="stage-core" data-testid="orb-panel">
              <div className="center-guides" />
              <div className="reactor-stage-aura" />
              <div className="reactor-stage-floor" />
              <div className="stage-core-copy">
                <p className="core-kicker" data-testid="orb-kicker">PRIMARY REACTOR</p>
                <h2 className="core-title" data-testid="orb-title">Núcleo de presença do {CONFIG.name}</h2>
              </div>

              <div className="reactor-cluster">
                <div className="reactor-top-dials">
                  <TechDial label="DATA" value="21" sublabel="AGO" testId="tech-dial-date" />
                  <TechDial label="CPU" value="51" sublabel="%" testId="tech-dial-cpu" />
                  <TechDial label="LAT" value="24" sublabel="ms" testId="tech-dial-latency" />
                </div>

                <div className="reactor-side-strip left" data-testid="left-reactor-strip">
                  <span className="strip-title">NEXUS</span>
                  <span className="strip-line" />
                  <span className="strip-code">A1 · MEMORY · STACK</span>
                  <span className="strip-code">B7 · CONTEXT · LIVE</span>
                </div>

                <div className="reactor-side-strip right" data-testid="right-reactor-strip">
                  <span className="strip-title">EXEC</span>
                  <span className="strip-line" />
                  <span className="strip-code">CLIMA · 13°</span>
                  <span className="strip-code">MODE · ACTIVE</span>
                </div>

                <div className="reactor-bottom-spectrum" data-testid="reactor-spectrum">
                  {Array.from({ length: 22 }).map((_, index) => (
                    <span
                      key={`bar-${index}`}
                      className="spectrum-bar"
                      style={{ height: `${18 + ((index * 13) % 48)}px` }}
                    />
                  ))}
                </div>

                <ReactorOrb state={orbState} speechPulse={speechPulse} onToggleListening={toggleListening} />
              </div>

              <div className="stage-stats-row">
                <MetricPanel title="ÚLTIMO COMANDO" value={latestUser} detail="Input mais recente" testId="status-card-last-user" />
                <MetricPanel title="RESPOSTA DO SISTEMA" value={latestAssistant} detail="Saída principal" testId="status-card-last-response" />
                <MetricPanel title="MODO OPERACIONAL" value={ORB_LABELS[orbState]} detail="Camada atual" testId="status-card-operational" />
              </div>
            </section>

            <aside className="stage-rail stage-rail-right hud-bracket-panel">
              <div className="right-rail-top">
                <DataColumn
                  title="EXECUTIVE MATRIX"
                  items={[
                    { label: "MEMÓRIA", value: `${notes.length} NÓS` },
                    { label: "FOCO", value: "CEO IA" },
                    { label: "DEFCON", value: "STABLE" },
                  ]}
                  testId="right-matrix-panel"
                />
                <div className="right-radar hud-bracket-panel" data-testid="right-radar-panel">
                  <div className="right-radar-head">
                    <Crosshair size={15} />
                    <span>RADAR</span>
                  </div>
                  <div className="right-radar-grid">
                    <span className="radar-ring radar-ring-a" />
                    <span className="radar-ring radar-ring-b" />
                    <span className="radar-ring radar-ring-c" />
                    <span className="radar-sweep" />
                    <span className="radar-dot radar-dot-a" />
                    <span className="radar-dot radar-dot-b" />
                    <span className="radar-dot radar-dot-c" />
                  </div>
                </div>
              </div>

              <SecondBrainGraph
                notes={notes}
                activeId={activeNoteId}
                onOpenNote={openNoteDialog}
                onReset={restorePreview}
              />
            </aside>

            <footer className="command-deck hud-bracket-panel" data-testid="command-deck">
              <div className="command-deck-header">
                <div>
                  <p className="command-kicker">EXECUTIVE INPUT</p>
                  <h3 className="command-title">Comando direto para o núcleo</h3>
                </div>
                <div className="command-meta-pill" data-testid="command-meta-pill">
                  <Radar size={14} /> Modo de demonstração ativo
                </div>
              </div>

              <div className="command-controls">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      sendCommand();
                    }
                  }}
                  placeholder="ou digite e tecle Enter"
                  className="jarvis-input command-input"
                  data-testid="chat-input"
                  aria-label="Digite um comando para o JARVAS"
                />

                <div className="command-actions">
                  <Button type="button" className="jarvis-button-primary" data-testid="send-command-button" onClick={sendCommand}>
                    <SendHorizonal size={16} /> Enviar
                  </Button>
                  <Button type="button" variant="outline" className="jarvis-button-secondary" data-testid="mic-button" onClick={toggleListening}>
                    <Mic size={15} /> Microfone
                  </Button>
                  <Button type="button" variant="outline" className="jarvis-button-secondary" data-testid="stop-speaking-button" onClick={stopSpeaking}>
                    <Square size={14} /> Parar fala
                  </Button>
                </div>
              </div>

              <div className="command-deck-footer">
                <div className="command-warning" data-testid="command-warning">
                  <BadgeAlert size={15} /> Esta é uma prévia visual antes da integração real com voz e Claude.
                </div>
                <div className="command-seals" data-testid="command-seals">
                  <span className="seal-pill"><Shield size={12} /> MEMORY SAFE</span>
                  <span className="seal-pill"><Cpu size={12} /> EXEC CORE</span>
                  <span className="seal-pill"><Activity size={12} /> LIVE FLOW</span>
                  <span className="seal-pill"><Orbit size={12} /> ARC GRID</span>
                </div>
              </div>
            </footer>
          </motion.main>
        ) : null}
      </AnimatePresence>

      <NoteDialog
        open={editorOpen}
        note={editorNote}
        onClose={closeDialog}
        onSave={saveNote}
        onDelete={deleteNote}
        onChange={setEditorNote}
      />
    </div>
  );
}

export default App;
