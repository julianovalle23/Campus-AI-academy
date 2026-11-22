// Las 14 herramientas que se enseñan (lista literal de la landing actual).
// `what` describe qué es cada herramienta (dato público del producto).
// Se muestran descripciones generales; no se atribuye un uso específico al curso
// porque la fuente publicada no documenta ese detalle.

export const toolGroups = [
  { id: 'asistentes', label: 'Asistentes' },
  { id: 'conocimiento', label: 'Conocimiento' },
  { id: 'automatizacion', label: 'Automatización' },
  { id: 'creacion', label: 'Creación' },
  { id: 'codigo', label: 'Código' },
];

export const tools = [
  { id: 'chatgpt', name: 'ChatGPT', group: 'asistentes', what: 'Asistente conversacional de OpenAI para redactar, analizar y resolver tareas con lenguaje natural.' },
  { id: 'claude', name: 'Claude', group: 'asistentes', what: 'Asistente de IA de Anthropic, fuerte en textos largos, análisis de documentos y razonamiento.' },
  { id: 'gemini', name: 'Gemini', group: 'asistentes', what: 'Asistente de IA de Google, integrado con Gmail, Docs y el resto de Google Workspace.' },
  { id: 'ms-copilot', name: 'Microsoft Copilot', group: 'asistentes', what: 'Asistente de IA de Microsoft dentro de Word, Excel, Outlook, Teams y Windows.' },
  { id: 'perplexity', name: 'Perplexity', group: 'asistentes', what: 'Buscador con IA que responde preguntas y cita las fuentes que consultó.' },
  { id: 'notebooklm', name: 'NotebookLM', group: 'conocimiento', what: 'Cuaderno de investigación de Google que responde solo con base en los documentos que le das.' },
  { id: 'notion-ai', name: 'Notion AI', group: 'conocimiento', what: 'IA dentro de Notion para escribir, resumir y organizar documentos y bases de conocimiento.' },
  { id: 'read-ai', name: 'Read AI', group: 'conocimiento', what: 'Asistente de reuniones que transcribe, resume y extrae acuerdos y tareas.' },
  { id: 'make', name: 'Make', group: 'automatizacion', what: 'Plataforma visual para conectar aplicaciones y automatizar flujos sin escribir código.' },
  { id: 'zapier', name: 'Zapier', group: 'automatizacion', what: 'Automatiza tareas entre miles de aplicaciones con disparadores y acciones.' },
  { id: 'midjourney', name: 'Midjourney', group: 'creacion', what: 'Genera imágenes a partir de una descripción en texto.' },
  { id: 'elevenlabs', name: 'ElevenLabs', group: 'creacion', what: 'Genera voces sintéticas realistas, locuciones y doblajes.' },
  { id: 'heygen', name: 'HeyGen', group: 'creacion', what: 'Crea videos con avatares y traduce videos a otros idiomas.' },
  { id: 'github-copilot', name: 'GitHub Copilot', group: 'codigo', what: 'Asistente de programación que sugiere y explica código dentro del editor.' },
];
