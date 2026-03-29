import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Terminal, 
  Layout as LayoutIcon, 
  MessageSquare, 
  ChevronRight,
  Github,
  Twitter,
  ExternalLink,
  Info,
  Command,
  User,
  Globe,
  Maximize2,
  History,
  FileText,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const TONES = [
  { id: 'professional', label: 'Profissional', icon: '👔' },
  { id: 'creative', label: 'Criativo', icon: '🎨' },
  { id: 'technical', label: 'Técnico', icon: '⚙️' },
  { id: 'concise', label: 'Conciso', icon: '📏' },
  { id: 'friendly', label: 'Amigável', icon: '👋' },
  { id: 'persuasive', label: 'Persuasivo', icon: '📢' },
];

const FORMATS = [
  { id: 'article', label: 'Artigo/Blog', icon: '📝' },
  { id: 'code', label: 'Código/Script', icon: '💻' },
  { id: 'list', label: 'Lista de Tópicos', icon: '📊' },
  { id: 'email', label: 'E-mail', icon: '📧' },
  { id: 'social', label: 'Redes Sociais', icon: '📱' },
  { id: 'qa', label: 'Perguntas e Respostas', icon: '❓' },
];

const PERSONAS = [
  { id: 'expert', label: 'Especialista Sênior', icon: '🧠' },
  { id: 'teacher', label: 'Professor', icon: '👨‍🏫' },
  { id: 'developer', label: 'Desenvolvedor', icon: '👨‍💻' },
  { id: 'marketer', label: 'Profissional de Marketing', icon: '📈' },
  { id: 'writer', label: 'Escritor', icon: '✍️' },
  { id: 'lawyer', label: 'Advogado', icon: '⚖️' },
];

const AUDIENCES = [
  { id: 'general', label: 'Público Geral', icon: '👥' },
  { id: 'beginners', label: 'Iniciantes', icon: '🌱' },
  { id: 'experts', label: 'Especialistas', icon: '🎓' },
  { id: 'children', label: 'Crianças', icon: '🧸' },
  { id: 'executives', label: 'Executivos', icon: '💼' },
];

const LANGUAGES = [
  { id: 'pt', label: 'Português', icon: '🇧🇷' },
  { id: 'en', label: 'Inglês', icon: '🇺🇸' },
  { id: 'es', label: 'Espanhol', icon: '🇪🇸' },
  { id: 'fr', label: 'Francês', icon: '🇫🇷' },
  { id: 'de', label: 'Alemão', icon: '🇩🇪' },
];

const DEFAULT_PALETTES = [
  { name: 'Neon Night', colors: ['#00f2ff', '#7000ff', '#ff00d9'] },
  { name: 'Ocean Breeze', colors: ['#0077b6', '#00b4d8', '#90e0ef'] },
  { name: 'Sunset Glow', colors: ['#ff4d00', '#ff9e00', '#ffcd00'] },
  { name: 'Forest Zen', colors: ['#2d6a4f', '#52b788', '#b7e4c7'] },
  { name: 'Luxury Gold', colors: ['#d4af37', '#fcf6ba', '#aa771c'] },
  { name: 'Cyberpunk', colors: ['#f3ec19', '#f012be', '#2ecc40'] },
];

export default function App() {
  const [aiTool, setAiTool] = useState('Gemini');
  const [pageStyle, setPageStyle] = useState('');
  const [language, setLanguage] = useState('pt');
  const [projectDescription, setProjectDescription] = useState('');
  const [audienceDetails, setAudienceDetails] = useState('');
  const [checkoutLink, setCheckoutLink] = useState('');
  const [painPointObjective, setPainPointObjective] = useState('');
  const [aestheticsDesign, setAestheticsDesign] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [paletteSearch, setPaletteSearch] = useState('');
  const [dynamicPalettes, setDynamicPalettes] = useState(DEFAULT_PALETTES);
  const [isGeneratingPalettes, setIsGeneratingPalettes] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  const [history, setHistory] = useState<{
    id: string;
    title: string;
    prompt: string;
    date: string;
    config: any;
  }[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ptl_prompt_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ptl_prompt_history', JSON.stringify(history));
  }, [history]);

  const handleEnhance = async () => {
    if (!projectDescription.trim()) {
      setError("Por favor, descreva o projeto no Passo 4.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setEnhancedPrompt('');

    const systemInstruction = `Você é um Engenheiro de Prompts especialista em Copywriting e Design de Conversão. Seu objetivo é criar um prompt mestre detalhado para uma IA gerar uma página de alta conversão.
    
    Use as seguintes especificações fornecidas pelo usuário:
    
    1. Ferramenta de IA: ${aiTool}
    2. Estilo de Página: ${pageStyle || 'Não especificado'}
    3. Idioma: ${language}
    4. Sobre o Projeto: ${projectDescription}
    5. Público e Detalhes: ${audienceDetails || 'Não especificado'}
    6. Link de Checkout: ${checkoutLink || 'Não especificado'}
    7. Dor Principal e Objetivo: ${painPointObjective || 'Não especificado'}
    8. Estética e Design: ${aestheticsDesign || 'Não especificado'}
    9. Paleta de Cores: ${colorPalette || 'Não especificado'}
    
    O prompt gerado deve ser estruturado, usar técnicas de copywriting (como AIDA ou PAS), definir claramente a persona da IA, o tom de voz e fornecer instruções passo a passo para a criação do conteúdo da página.
    
    Importante: Se uma paleta de cores foi especificada, certifique-se de que o design sugerido utilize essas referências hexadecimais ou nomes de cores.
    
    Retorne APENAS o texto final do prompt otimizado.`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: systemInstruction }] }],
      });
      
      const text = response.text;
      
      if (text) {
        setEnhancedPrompt(text);
        
        // Save to history
        const newEntry = {
          id: Date.now().toString(),
          title: projectDescription.substring(0, 40) || "Projeto Sem Nome",
          prompt: text,
          date: new Date().toLocaleString('pt-BR'),
          config: {
            aiTool,
            pageStyle,
            language,
            projectDescription,
            audienceDetails,
            checkoutLink,
            painPointObjective,
            aestheticsDesign,
            colorPalette
          }
        };
        setHistory(prev => [newEntry, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar o prompt. Verifique sua chave de API ou tente novamente mais tarde.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!enhancedPrompt) return;
    navigator.clipboard.writeText(enhancedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (entry: any) => {
    setAiTool(entry.config.aiTool);
    setPageStyle(entry.config.pageStyle);
    setLanguage(entry.config.language);
    setProjectDescription(entry.config.projectDescription);
    setAudienceDetails(entry.config.audienceDetails);
    setCheckoutLink(entry.config.checkoutLink);
    setPainPointObjective(entry.config.painPointObjective);
    setAestheticsDesign(entry.config.aestheticsDesign);
    setColorPalette(entry.config.colorPalette);
    setEnhancedPrompt(entry.prompt);
    setActiveTab('generator');
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleGeneratePalettes = async () => {
    if (!paletteSearch.trim()) return;
    
    setIsGeneratingPalettes(true);
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: `Gere exatamente 10 paletas de cores profissionais e harmônicas baseadas no tema ou cor: "${paletteSearch}". 
        Cada paleta deve ter um nome criativo e de 3 a 5 cores hexadecimais.` }] }],
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                colors: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["name", "colors"]
            }
          }
        }
      });
      
      const data = JSON.parse(response.text);
      if (Array.isArray(data)) {
        setDynamicPalettes(data);
      }
    } catch (err) {
      console.error("Erro ao gerar paletas:", err);
    } finally {
      setIsGeneratingPalettes(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 grid-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 noxus-gradient rounded-xl flex items-center justify-center noxus-glow group-hover:scale-110 transition-transform">
              <Command className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tighter">
              PTL<span className="text-primary">PROMPT</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Command className="w-3 h-3" />
              <span>Workspace Pessoal</span>
            </div>
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <Github className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Workspace Title & Tabs */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tighter">
                CRIADOR DE <span className="text-primary">PROMPTS</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium">Crie, otimize e refine suas instruções para IA.</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start">
              <button 
                onClick={() => setActiveTab('generator')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'generator' ? "bg-primary text-white noxus-glow" : "text-muted-foreground hover:text-white"
                )}
              >
                <Command className="w-3 h-3" />
                Gerador
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'history' ? "bg-primary text-white noxus-glow" : "text-muted-foreground hover:text-white"
                )}
              >
                <History className="w-3 h-3" />
                Meus Prompts
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'generator' ? (
              <motion.div 
                key="generator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Column: Inputs */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="lg:col-span-5 space-y-6"
                >
              <div className="glass-panel rounded-3xl p-8 space-y-8 max-h-[800px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Command className="w-3 h-3" />
                    Configuração do Prompt
                  </h2>
                  <button 
                    onClick={() => { 
                      setAiTool('Gemini');
                      setPageStyle('');
                      setLanguage('pt');
                      setProjectDescription('');
                      setAudienceDetails('');
                      setCheckoutLink('');
                      setPainPointObjective('');
                      setAestheticsDesign('');
                      setColorPalette('');
                      setEnhancedPrompt('');
                      setError(null);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    Limpar Tudo
                  </button>
                </div>

                {/* Step 1: AI Tool */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">01</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ferramenta de IA</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Gemini', 'GPT-4', 'Claude', 'Midjourney', 'Llama 3', 'Perplexity', 'Grok', 'Mistral'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setAiTool(opt)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          aiTool === opt ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text"
                    value={aiTool}
                    onChange={(e) => setAiTool(e.target.value)}
                    placeholder="Escolha acima ou digite outra IA..."
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Step 2: Page Style */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">02</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estilo de Página</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Landing Page', 'VSL', 'Página de Vendas', 'Lead Magnet', 'Checkout'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setPageStyle(opt)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          pageStyle === opt ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text"
                    value={pageStyle}
                    onChange={(e) => setPageStyle(e.target.value)}
                    placeholder="Ex: Landing Page, VSL, Página de Vendas..."
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Step 3: Language */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">03</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Idioma</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {LANGUAGES.map(l => (
                      <button 
                        key={l.id}
                        onClick={() => setLanguage(l.label)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          language === l.label ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {l.icon} {l.label}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Escolha acima ou digite qualquer idioma..."
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Step 4: About Project */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">04</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sobre o Projeto</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Infoproduto', 'E-book', 'Mentoria', 'SaaS', 'E-commerce'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setProjectDescription(prev => prev ? `${prev}, ${opt}` : opt)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50 transition-all"
                      >
                        + {opt}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Descreva seu produto, serviço ou oferta em detalhes..."
                    className="w-full h-24 bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Step 5: Audience */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">05</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Público e Detalhes</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Empreendedores', 'Iniciantes', 'B2B', 'High Ticket', 'Freelancers'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setAudienceDetails(prev => prev ? `${prev}, ${opt}` : opt)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50 transition-all"
                      >
                        + {opt}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={audienceDetails}
                    onChange={(e) => setAudienceDetails(e.target.value)}
                    placeholder="Quem é seu avatar? Quais os dados demográficos e interesses?"
                    className="w-full h-24 bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Step 6: Checkout Link */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">06</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Link de Checkout</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Kiwify', 'Hotmart', 'Eduzz', 'Braip'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setCheckoutLink(`https://app.${opt.toLowerCase()}.com.br/`)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50 transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text"
                    value={checkoutLink}
                    onChange={(e) => setCheckoutLink(e.target.value)}
                    placeholder="https://seu-checkout.com/..."
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Step 7: Pain Point & Objective */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">07</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Dor Principal e Objetivo</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Falta de Vendas', 'Falta de Tempo', 'Escalabilidade', 'Autoridade'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setPainPointObjective(prev => prev ? `${prev}, ${opt}` : opt)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50 transition-all"
                      >
                        + {opt}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={painPointObjective}
                    onChange={(e) => setPainPointObjective(e.target.value)}
                    placeholder="Qual problema você resolve? Qual o objetivo final da página?"
                    className="w-full h-24 bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Step 8: Aesthetics & Design */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">08</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estética e Design</label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Minimalista', 'Futurista', 'Profissional', 'Clean', 'Luxuoso', 'Moderno', 'Corporativo'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setAestheticsDesign(prev => prev ? `${prev}, ${opt}` : opt)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50 transition-all"
                      >
                        + {opt}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={aestheticsDesign}
                    onChange={(e) => setAestheticsDesign(e.target.value)}
                    placeholder="Vibe, referências visuais, estilo de escrita, elementos gráficos..."
                    className="w-full h-24 bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Step 9: Color Palettes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded">09</span>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paleta de Cores</label>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text"
                      value={paletteSearch}
                      onChange={(e) => setPaletteSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGeneratePalettes()}
                      placeholder="Pesquise cor ou tema (ex: Azul, Minimalista...)"
                      className="flex-1 bg-background/50 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button 
                      onClick={handleGeneratePalettes}
                      disabled={isGeneratingPalettes || !paletteSearch.trim()}
                      className="px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl border border-primary/30 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {isGeneratingPalettes ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Command className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {dynamicPalettes.map((palette, idx) => (
                      <button 
                        key={`${palette.name}-${idx}`}
                        onClick={() => setColorPalette(`${palette.name} (${palette.colors.join(', ')})`)}
                        className={cn(
                          "p-2 rounded-xl border transition-all flex flex-col gap-2 text-left",
                          colorPalette.includes(palette.name) ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 hover:border-primary/30"
                        )}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70 truncate">{palette.name}</span>
                        <div className="flex gap-1">
                          {palette.colors.map(c => (
                            <div key={c} className="w-full h-3 rounded-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground opacity-50">Paleta Selecionada</label>
                    <input 
                      type="text"
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      placeholder="Nenhuma paleta selecionada..."
                      className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleEnhance}
                  disabled={isGenerating}
                  className={cn(
                    "w-full py-4 rounded-2xl noxus-gradient text-white font-black text-lg noxus-glow flex items-center justify-center gap-3 transition-all active:scale-[0.98] sticky bottom-0",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>GERANDO PROMPT...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Command className="w-5 h-5" />
                      </div>
                      <span>GERAR PROMPT</span>
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-red-400 text-xs text-center font-medium">{error}</p>
                )}
              </div>

              {/* Tips Section */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Command className="w-3 h-3" />
                  Dicas Rápidas
                </h3>
                <ul className="space-y-3">
                  {[
                    "Seja específico sobre o que você NÃO quer.",
                    "Forneça exemplos do estilo que você deseja.",
                    "Use o contexto para definir o cenário da tarefa.",
                    "Experimente diferentes personas para resultados variados."
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] text-muted-foreground leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Column: Result */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-7"
            >
              <div className="glass-panel rounded-3xl p-8 h-full flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl noxus-gradient flex items-center justify-center noxus-glow">
                      <Command className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight leading-none">PTL PROMPT</h2>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Workspace Pessoal</span>
                    </div>
                  </div>
                  
                  {enhancedPrompt && (
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Prompt</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 bg-black/40 rounded-2xl p-6 border border-white/5 overflow-auto custom-scrollbar">
                  {enhancedPrompt ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{enhancedPrompt}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <Command className="w-12 h-12" />
                      <p className="text-sm font-medium">Seu prompt otimizado aparecerá aqui.<br />Preencha os detalhes e clique em Otimizar.</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Sistema Pronto</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span>Otimizado para Gemini, GPT-4, & Claude</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel rounded-3xl p-8 min-h-[600px]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl noxus-gradient flex items-center justify-center noxus-glow">
                  <Command className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">MEUS PROMPTS</h2>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Histórico de Criações</p>
                </div>
              </div>
              
              {history.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm("Deseja limpar todo o histórico?")) {
                      setHistory([]);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar Tudo
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 opacity-30">
                <Command className="w-16 h-16" />
                <div>
                  <p className="text-lg font-bold">Nenhum prompt salvo ainda.</p>
                  <p className="text-sm">Gere seu primeiro prompt para vê-lo aqui.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('generator')}
                  className="px-6 py-3 rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold text-xs uppercase tracking-widest hover:bg-primary/30 transition-all"
                >
                  Começar a Criar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((entry) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={entry.id}
                    onClick={() => loadFromHistory(entry)}
                    className="group relative glass-panel border border-white/5 hover:border-primary/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Command className="w-5 h-5" />
                      </div>
                      <button 
                        onClick={(e) => deleteHistoryEntry(entry.id, e)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {entry.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-4">
                      {entry.date}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold uppercase tracking-tighter opacity-70">
                        {entry.config.aiTool}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold uppercase tracking-tighter opacity-70">
                        {entry.config.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Carregar Prompt</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 noxus-gradient rounded flex items-center justify-center">
              <Command className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tighter">
              PTL<span className="text-primary">PROMPT</span>
            </span>
          </div>
          
          <div className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            © 2026 PTL PROMPT. Workspace Pessoal.
          </div>

          <div className="flex items-center gap-4 opacity-50">
            <Twitter className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
            <Github className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
