export const CONFIG = {
  name: "JARVAS",
  address: "senhor",
  themeColor: "azul reator",
  persona: "formal britânico",
  wakeWord: "ei jarvas",
  voiceGender: "masculina",
};

export const AREA = {
  metas: { label: "Metas", color: "#fbbf24" },
  trabalho: { label: "Carreira", color: "#ff6b47" },
  projetos: { label: "Projetos", color: "#8b7cff" },
  financas: { label: "Finanças", color: "#f7931a" },
  aprendizado: { label: "Aprendizado", color: "#2dd4ff" },
  saude: { label: "Saúde", color: "#10b981" },
  relacoes: { label: "Relações", color: "#ec4899" },
  meta: { label: "Sistema", color: "#8a90a6" },
};

export const DEFAULT_NOTES = [
  {
    id: "meta-ceo",
    area: "metas",
    title: "CEO IA",
    body: "Transformar este JARVAS em um conselheiro executivo pessoal, estratégico e presente no dia a dia.",
  },
  {
    id: "work-command",
    area: "trabalho",
    title: "Comando",
    body: "Central de operações para decisões, prioridades e visão macro do negócio.",
  },
  {
    id: "proj-preview",
    area: "projetos",
    title: "Preview",
    body: "Prévia semi-interativa criada para aprovar visual, densidade e presença do sistema.",
  },
  {
    id: "proj-memory",
    area: "projetos",
    title: "Memória",
    body: "Grafo neural vivo que representa contexto contínuo, relações e aprendizado sobre a rotina.",
  },
  {
    id: "fin-growth",
    area: "financas",
    title: "Crescimento",
    body: "Apoiar decisões que aumentem eficiência, clareza operacional e alavancagem financeira.",
  },
  {
    id: "learn-systems",
    area: "aprendizado",
    title: "Sistemas",
    body: "Aprender com conversas, padrões e prioridades para responder cada vez melhor.",
  },
  {
    id: "health-rhythm",
    area: "saude",
    title: "Ritmo",
    body: "Performance sustentável depende de energia, foco e descanso equilibrados.",
  },
  {
    id: "rel-network",
    area: "relacoes",
    title: "Rede",
    body: "Conectar projetos, pessoas-chave, parceiros e pontos de alinhamento importantes.",
  },
  {
    id: "meta-core",
    area: "meta",
    title: "Core",
    body: "Sistema premium inspirado em sala de comando cinematográfica, com interface técnica e memorável.",
  },
];

export const STORAGE_KEYS = {
  notes: "jarvis_preview_notes",
  key: "jarvis_preview_anthropic_key",
};

export const ORB_LABELS = {
  idle: "Pronto em espera",
  listening: "Escuta ativa",
  thinking: "Analisando contexto",
  speaking: "Emitindo resposta",
};

export function generateRelations(notes) {
  if (notes.length <= 1) {
    return [];
  }

  const pairs = new Set();
  const hub = notes.find((note) => note.area === "metas")?.id || notes[0]?.id;

  notes.forEach((note, index) => {
    const next = notes[(index + 1) % notes.length];
    if (next && note.id !== next.id) {
      pairs.add([note.id, next.id].sort().join("::"));
    }

    if (hub && note.id !== hub) {
      pairs.add([note.id, hub].sort().join("::"));
    }

    notes.forEach((other, otherIndex) => {
      if (otherIndex <= index) {
        return;
      }
      if (note.area === other.area || (index + otherIndex) % 4 === 0) {
        pairs.add([note.id, other.id].sort().join("::"));
      }
    });
  });

  return Array.from(pairs).map((pair) => pair.split("::"));
}

export function createSynapseSeeds(edgeCount) {
  if (!edgeCount) {
    return [];
  }

  return Array.from({ length: Math.min(12, edgeCount * 2) }, (_, index) => ({
    id: `synapse-${index}`,
    edgeIndex: index % edgeCount,
    t: (index + 1) / 14,
    speed: 0.0025 + (index % 5) * 0.00055,
  }));
}

export function sampleResponse(input, notes) {
  const lowerInput = input.toLowerCase();
  const projCount = notes.filter((note) => note.area === "projetos").length;
  const metaNote = notes.find((note) => note.area === "metas");

  if (lowerInput.includes("meta")) {
    return `Entendido, senhor. O eixo estratégico dominante continua sendo ${metaNote?.title || "evolução executiva"}, então eu manteria suas próximas decisões alinhadas a essa direção.`;
  }

  if (lowerInput.includes("projeto")) {
    return `No momento eu enxergo ${projCount} frentes de projeto no seu núcleo. Eu priorizaria uma como palco principal e as demais como apoio tático.`;
  }

  if (lowerInput.includes("visual") || lowerInput.includes("tela") || lowerInput.includes("cinema")) {
    return "Agora a cena está muito mais cinematográfica: palco central dominante, atmosfera volumétrica e painéis laterais discretos. A sensação é de comando premium, não de interface genérica.";
  }

  return `Recebido, senhor. Nesta prévia eu já reajo ao contexto visual e à memória do grafo. Quando aprovar, eu avanço para a versão final com voz nativa, Claude e memória viva real.`;
}
