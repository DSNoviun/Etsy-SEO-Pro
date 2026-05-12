/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  Tag, 
  Type, 
  FileText, 
  Accessibility,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  X,
  Plus,
  Info,
  BookOpen,
  Search,
  Star,
  Truck,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Activity,
  Pin,
  LayoutGrid,
  Globe,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Attribute {
  label: string;
  value: string;
}

interface ListingData {
  title: string;
  description: string;
  tags: string[];
  altText: string;
  mockupAltTexts: string[];
  instagramCaption: string;
  instagramHashtags: string[];
  pinterestTitle: string;
  pinterestDescription: string;
  categorySuggestions: string[];
  materials: string[];
  attributes: Attribute[];
  roomSuggestions: string[];
}

interface AuditResult {
  score: number;
  titleAnalysis: { score: number; feedback: string; suggestion: string; recommendation: string };
  descriptionAnalysis: { score: number; feedback: string; suggestion: string; recommendation: string };
  tagsAnalysis: { score: number; feedback: string; suggestion: string; recommendation: string[] };
  imagesAnalysis: { score: number; feedback: string; suggestion: string };
  overallFeedback: string;
}

interface CompetitorAnalysisResult {
  comparison: string;
  keywords: KeywordSuggestion[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface KeywordSuggestion {
  keyword: string;
  relevance: number;
  competition: 'Low' | 'Medium' | 'High';
  trend: 'Rising' | 'Stable' | 'Falling';
}

interface KeywordResearchResult {
  suggestions: KeywordSuggestion[];
  marketInsights: string;
}

type Language = 'en' | 'es' | 'de';

const translations = {
  en: {
    nav: { generator: 'Generator', tips: 'SEO Tips', audit: 'Listing Audit', competitor: 'Competitor Analysis', keywords: 'Keyword Research', upgrade: 'Upgrade' },
    header: { title: 'Etsy SEO Pro', subtitle: 'Artisanal Intelligence' },
    hero: {
      badge: "The Ultimate Maker's Toolkit",
      title: 'Crafted for Visibility. Built for Success.',
      subtitle: 'Transform your artisanal creations into high-performing Etsy listings with AI-powered SEO, accessibility, and social-ready content.'
    },
    showcase: {
      title: 'The Showcase',
      drop: 'Drop your masterpiece',
      hint: 'High-res photos sell 3x faster',
      mockups: 'Mockup Gallery',
      addMore: 'Add More'
    },
    input: {
      context: 'Product Context',
      placeholder: 'Describe your creation, materials, or special features...',
      generate: 'Generate Listing',
      generating: 'Generating...'
    },
    tabs: {
      listing: 'Listing',
      social: 'Social Story',
      pinterest: 'Pinterest Pin',
      attributes: 'Attributes',
      seo: 'SEO & Accessibility'
    },
    health: {
      title: 'Listing Health Score',
      subtitle: 'SEO Audit Report',
      outOf: 'out of 100',
      excellent: 'Excellent! Your listing is ready for the spotlight.',
      good: 'Good start. A few more tweaks for perfection.',
      needsAttention: 'Needs attention. Follow the tips above to improve visibility.',
      fullAudit: 'Full Audit Details',
      checks: {
        titleLength: { label: 'Title Length', tip: 'Etsy suggests concise titles (40-120 characters) that get straight to the point.' },
        noDuplicate: { label: 'No Duplicate Words', tip: 'Avoid repeating words in your title to keep it clean and professional.' },
        tags: { label: '13 SEO Tags', tip: 'Using all 13 tags maximizes your reach in Etsy search.' },
        description: { label: 'Detailed Description', tip: 'Longer descriptions help with both SEO and buyer confidence.' },
        accessibility: { label: 'Accessibility (Alt Text)', tip: 'Alt text makes your shop accessible and helps with Google Image Search.' },
        category: { label: 'Category Suggestions', tip: 'Accurate categories help buyers find your items through browsing.' },
        material: { label: 'Material List', tip: 'Listing materials builds trust and helps with specific searches.' },
        social: { label: 'Social Ready', tip: 'Social signals drive external traffic, which Etsy rewards.' }
      }
    },
    audit: {
      title: 'Listing Audit',
      subtitle: 'Analyze existing listings against the Etsy Seller Handbook.',
      placeholder: 'https://www.etsy.com/listing/...',
      button: 'Audit Listing',
      auditing: 'Auditing...',
      score: 'Overall Score',
      analysis: 'Analysis',
      recommendation: 'Recommended Change',
      copyOptimized: 'Copy Optimized',
      auditAnother: 'Audit Another Listing',
      summary: 'Audit Summary',
      scoreLabel: 'Score',
      materialList: 'Material List',
      titleOptimization: 'Title Optimization',
      descriptionEngagement: 'Description & Engagement',
      tagStrategy: 'Tag Strategy',
      visualPresentation: 'Visual Presentation',
      fullOptimized: 'Full Optimized'
    },
    competitor: {
      title: 'Competitor Analysis',
      subtitle: 'Analyze competitor listings to find keyword and strategy gaps.',
      placeholder: 'https://www.etsy.com/listing/...',
      button: 'Analyze Competitor',
      analyzing: 'Analyzing...',
      comparison: 'Strategy Comparison',
      keywords: 'Keyword Differences',
      strengths: 'Competitor Strengths',
      weaknesses: 'Competitor Weaknesses',
      opportunities: 'Your Opportunities',
      compareButton: 'Compare in Research Tool',
      analyzeAnother: 'Analyze Another Competitor'
    },
    keywords: {
      title: 'Keyword Research',
      subtitle: 'Discover high-performing long-tail keywords and market trends.',
      placeholder: 'Enter a seed keyword or product type...',
      button: 'Research Keywords',
      researching: 'Researching...',
      suggestions: 'Keyword Suggestions',
      insights: 'Market Insights',
      relevance: 'Relevance',
      competition: 'Competition',
      trend: 'Trend',
      compare: 'Competitor Comparison',
      compareSubtitle: 'Directly compare your researched keywords with those found in competitor listings.',
      noCompetitor: 'No competitor data available. Analyze a competitor listing first to see a comparison here.',
      newResearch: 'New Research',
      goToCompetitor: 'Go to Competitor Analysis',
      keywordLabel: 'Keyword',
      actionLabel: 'Action',
      competitorKeywordLabel: 'Competitor Keyword'
    },
    metrics: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      rising: 'Rising',
      falling: 'Falling',
      stable: 'Stable'
    },
    tips: {
      title: 'Etsy SEO Handbook',
      subtitle: 'Master the algorithm with these proven strategies.',
      proTip: 'Pro Tip',
      handbookTitle: 'Deep Dive into the Handbook',
      handbookDesc: "The Etsy Seller Handbook is the ultimate resource for growing your business. We've integrated its core principles into our AI engine, but reading the full guides can provide even deeper insights into market trends.",
      handbookButton: 'Read the Handbook',
      cards: {
        titles: { title: 'Concise & Clear Titles', desc: 'Etsy now favors shorter, more readable titles (70-100 chars) that are easy for buyers to scan. Avoid keyword stuffing and long strings of repetitive phrases.', tip: 'Put your most descriptive information first and use natural language that sounds like a human description.' },
        longtail: { title: 'Long-Tail Strategy', desc: 'Generic terms like "mug" are too competitive. Use specific phrases like "handmade blue ceramic mug" to reach buyers ready to purchase.', tip: 'Use all 13 tags. Every empty tag is a missed opportunity for visibility.' },
        visual: { title: 'Visual SEO', desc: 'Alt text isn\'t just for accessibility—it helps your products appear in Google Image Search, driving external traffic to your shop.', tip: 'Describe the product and its context (e.g., "Ceramic mug on a rustic wooden table").' },
        experience: { title: 'Customer Experience', desc: 'Great reviews and a completed "About" section signal to Etsy that your shop is trustworthy, which can boost your search ranking.', tip: 'Respond to messages quickly and encourage buyers to leave photo reviews.' },
        shipping: { title: 'Shipping Impact', desc: 'Etsy prioritizes shops that offer free shipping or competitive rates. Fast processing times also play a role in search placement.', tip: 'Consider building shipping costs into your item price to offer "Free Shipping".' },
        attributes: { title: 'Complete Attributes', desc: 'Attributes act like extra tags. Filling out color, material, and occasion helps you appear in specific filtered searches.', tip: 'Always select the most specific category possible for your item.' }
      }
    },
    common: {
      copy: 'Copy',
      copied: 'Copied',
      copyAll: 'Copy All',
      ready: 'Ready for the spotlight?',
      readySubtitle: "Upload your product photos and we'll generate a professional, SEO-optimized listing in seconds.",
      guide: "The Maker's Guide",
      guideItems: [
        { part1: "Lead with your ", hook: "hook", part2: ". Buyers scan the first 3 words of your title first." },
        { part1: "Use ", hook: "Long-Tail Keywords", part2: ". Specificity beats generic terms every time." },
        { part1: "Alt text is your ", hook: "secret weapon", part2: " for Google Image Search visibility." }
      ],
      upgradeTitle: 'Premium Access Required',
      upgradeSubtitle: 'Upgrade to Pro to unlock advanced tools and take your Etsy shop to the next level.',
      loginTitle: 'Welcome Back, Maker',
      loginSubtitle: 'Log in to access your premium SEO toolkit.',
      username: 'Username',
      password: 'Password',
      login: 'Log In',
      upgrade: 'Upgrade Now',
      invalid: 'Invalid credentials. Please try again.',
      logout: 'Log Out'
    },
    pricing: {
      title: 'Choose Your Plan',
      subtitle: 'Unlock the full potential of your Etsy shop with our premium tools.',
      monthly: 'Monthly',
      yearly: 'Yearly (Save 20%)',
      free: {
        name: 'Maker',
        price: '0',
        features: ['AI Listing Generator', 'Basic SEO Tips', 'Social Media Captions', 'Pinterest Pin Generator']
      },
      pro: {
        name: 'Pro',
        price: '19',
        features: ['Everything in Maker', 'Full Listing Audit', 'Competitor Analysis', 'Keyword Research Tool', 'Market Trend Insights']
      },
      business: {
        name: 'Business',
        price: '49',
        features: ['Everything in Pro', 'Unlimited Audits', 'Multi-Shop Support', 'Priority Support', 'Custom Brand Voice']
      },
      cta: 'Get Started'
    },
    footer: {
      tagline: 'Etsy SEO Pro • Artisanal Intelligence',
      description: 'Empowering independent makers to find their audience and thrive in the digital marketplace.'
    }
  },
  es: {
    nav: { generator: 'Generador', tips: 'Consejos SEO', audit: 'Auditoría', competitor: 'Análisis de Competencia', keywords: 'Investigación de Palabras Clave', upgrade: 'Mejorar' },
    header: { title: 'Etsy SEO Pro', subtitle: 'Inteligencia Artesanal' },
    hero: {
      badge: "El Kit de Herramientas Definitivo",
      title: 'Creado para la Visibilidad. Construido para el Éxito.',
      subtitle: 'Transforma tus creaciones artesanales en listados de Etsy de alto rendimiento con SEO impulsado por IA, accesibilidad y contenido listo para redes sociales.'
    },
    showcase: {
      title: 'El Escaparate',
      drop: 'Suelta tu obra maestra',
      hint: 'Las fotos de alta resolución venden 3 veces más rápido',
      mockups: 'Galería de Maquetas',
      addMore: 'Añadir Más'
    },
    input: {
      context: 'Contexto del Producto',
      placeholder: 'Describe tu creación, materiales o características especiales...',
      generate: 'Generar Listado',
      generating: 'Generando...'
    },
    tabs: {
      listing: 'Listado',
      social: 'Historia Social',
      pinterest: 'Pin de Pinterest',
      attributes: 'Atributos',
      seo: 'SEO y Accesibilidad'
    },
    health: {
      title: 'Puntuación de Salud del Listado',
      subtitle: 'Informe de Auditoría SEO',
      outOf: 'de 100',
      excellent: '¡Excelente! Tu listado está listo para el estrellato.',
      good: 'Buen comienzo. Unos pocos ajustes más para la perfección.',
      needsAttention: 'Necesita atención. Sigue los consejos anteriores para mejorar la visibilidad.',
      fullAudit: 'Detalles de la Auditoría Completa',
      checks: {
        titleLength: { label: 'Longitud del Título', tip: 'Etsy sugiere títulos concisos (40-120 caracteres) que vayan directo al grano.' },
        noDuplicate: { label: 'Sin Palabras Duplicadas', tip: 'Evita repetir palabras en tu título para mantenerlo limpio y profesional.' },
        tags: { label: '13 Etiquetas SEO', tip: 'Usar las 13 etiquetas maximiza tu alcance en las búsquedas de Etsy.' },
        description: { label: 'Descripción Detallada', tip: 'Las descripciones más largas ayudan tanto con el SEO como con la confianza del comprador.' },
        accessibility: { label: 'Accesibilidad (Texto Alt)', tip: 'El texto alternativo hace que tu tienda sea accesible y ayuda con la Búsqueda de Imágenes de Google.' },
        category: { label: 'Sugerencias de Categoría', tip: 'Las categorías precisas ayudan a los compradores a encontrar tus artículos al navegar.' },
        material: { label: 'Lista de Materiales', tip: 'Listar los materiales genera confianza y ayuda con búsquedas específicas.' },
        social: { label: 'Listo para Redes Sociales', tip: 'Las señales sociales impulsan el tráfico externo, lo cual Etsy recompensa.' }
      }
    },
    audit: {
      title: 'Auditoría de Listado',
      subtitle: 'Analiza listados existentes según el Manual del Vendedor de Etsy.',
      placeholder: 'https://www.etsy.com/listing/...',
      button: 'Auditar Listado',
      auditing: 'Auditando...',
      score: 'Puntuación General',
      analysis: 'Análisis',
      recommendation: 'Cambio Recomendado',
      copyOptimized: 'Copiar Optimizado',
      auditAnother: 'Auditar Otro Listado',
      summary: 'Resumen de Auditoría',
      scoreLabel: 'Puntuación',
      materialList: 'Lista de Materiales',
      titleOptimization: 'Optimización de Título',
      descriptionEngagement: 'Descripción y Compromiso',
      tagStrategy: 'Estrategia de Etiquetas',
      visualPresentation: 'Presentación Visual',
      fullOptimized: 'Optimización Completa'
    },
    competitor: {
      title: 'Análisis de Competencia',
      subtitle: 'Analiza los listados de la competencia para encontrar brechas en palabras clave y estrategia.',
      placeholder: 'https://www.etsy.com/listing/...',
      button: 'Anilizar Competidor',
      analyzing: 'Analizando...',
      comparison: 'Comparación de Estrategia',
      keywords: 'Diferencias de Palabras Clave',
      strengths: 'Fortalezas del Competidor',
      weaknesses: 'Debilidades del Competidor',
      opportunities: 'Tus Oportunidades',
      compareButton: 'Comparar en Herramienta de Investigación',
      analyzeAnother: 'Analizar Otro Competidor'
    },
    keywords: {
      title: 'Investigación de Palabras Clave',
      subtitle: 'Descubre palabras clave de cola larga de alto rendimiento y tendencias del mercado.',
      placeholder: 'Ingresa una palabra clave semilla o tipo de producto...',
      button: 'Investigar Palabras Clave',
      researching: 'Investigando...',
      suggestions: 'Sugerencias de Palabras Clave',
      insights: 'Información del Mercado',
      relevance: 'Relevancia',
      competition: 'Competencia',
      trend: 'Tendencia',
      compare: 'Comparación con la Competencia',
      compareSubtitle: 'Compara directamente tus palabras clave investigadas con las encontradas en los listados de la competencia.',
      noCompetitor: 'No hay datos de competencia disponibles. Analiza primero un listado de la competencia para ver una comparación aquí.',
      newResearch: 'Nueva Investigación',
      goToCompetitor: 'Ir a Análisis de Competencia',
      keywordLabel: 'Palabra Clave',
      actionLabel: 'Acción',
      competitorKeywordLabel: 'Palabra Clave del Competidor'
    },
    metrics: {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      rising: 'En Aumento',
      falling: 'En Descenso',
      stable: 'Estable'
    },
    tips: {
      title: 'Manual de SEO de Etsy',
      subtitle: 'Domina el algoritmo con estas estrategias probadas.',
      proTip: 'Consejo Pro',
      handbookTitle: 'Inmersión profunda en el Manual',
      handbookDesc: 'El Manual del Vendedor de Etsy es el recurso definitivo para hacer crecer tu negocio. Hemos integrado sus principios básicos en nuestro motor de IA, pero leer las guías completas puede proporcionar información aún más profunda.',
      handbookButton: 'Leer el Manual',
      cards: {
        titles: { title: 'Títulos Concisos y Claros', desc: 'Etsy ahora favorece títulos más cortos y legibles (70-100 caracteres) que sean fáciles de escanear para los compradores. Evita el relleno de palabras clave.', tip: 'Pon la información más descriptiva primero y usa un lenguaje natural que parezca una descripción humana.' },
        longtail: { title: 'Estrategia de Cola Larga', desc: 'Términos genéricos como "taza" son demasiado competitivos. Usa frases específicas como "taza de cerámica azul hecha a mano" para llegar a compradores listos para comprar.', tip: 'Usa las 13 etiquetas. Cada etiqueta vacía es una oportunidad perdida de visibilidad.' },
        visual: { title: 'SEO Visual', desc: 'El texto alternativo no es solo para la accesibilidad; ayuda a que tus productos aparezcan en la Búsqueda de Imágenes de Google, atrayendo tráfico externo a tu tienda.', tip: 'Describe el producto y su contexto (por ejemplo, "Taza de cerámica en una mesa de madera rústica").' },
        experience: { title: 'Experiencia del Cliente', desc: 'Las excelentes reseñas y una sección "Acerca de" completa indican a Etsy que tu tienda es confiable, lo que puede mejorar tu clasificación en las búsquedas.', tip: 'Responde a los mensajes rápidamente y anima a los compradores a dejar reseñas con fotos.' },
        shipping: { title: 'Impacto del Envío', desc: 'Etsy prioriza las tiendas que ofrecen envío gratuito o tarifas competitivas. Los tiempos de procesamiento rápidos también influyen en la ubicación en las búsquedas.', tip: 'Considera incluir los costos de envío en el precio de tu artículo para ofrecer "Envío Gratis".' },
        attributes: { title: 'Atributos Completos', desc: 'Los atributos actúan como etiquetas adicionales. Completar el color, el material y la ocasión te ayuda a aparecer en búsquedas filtradas específicas.', tip: 'Selecciona siempre la categoría más específica posible para tu artículo.' }
      }
    },
    common: {
      copy: 'Copiar',
      copied: 'Copiado',
      copyAll: 'Copiar Todo',
      ready: '¿Listo para el estrellato?',
      readySubtitle: 'Sube las fotos de tus productos y generaremos un listado profesional optimizado para SEO en segundos.',
      guide: 'Guía del Creador',
      guideItems: [
        { part1: "Empieza con tu ", hook: "gancho", part2: ". Los compradores escanean primero las primeras 3 palabras de tu título." },
        { part1: "Usa ", hook: "Palabras Clave de Cola Larga", part2: ". La especificidad vence a los términos genéricos siempre." },
        { part1: "El texto alternativo es tu ", hook: "arma secreta", part2: " para la visibilidad en la Búsqueda de Imágenes de Google." }
      ],
      upgradeTitle: 'Acceso Premium Requerido',
      upgradeSubtitle: 'Actualiza a Pro para desbloquear herramientas avanzadas y llevar tu tienda de Etsy al siguiente nivel.',
      loginTitle: 'Bienvenido de nuevo, Creador',
      loginSubtitle: 'Inicia sesión para acceder a tu kit de herramientas SEO premium.',
      username: 'Usuario',
      password: 'Contraseña',
      login: 'Iniciar Sesión',
      upgrade: 'Actualizar Ahora',
      invalid: 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
      logout: 'Cerrar Sesión'
    },
    pricing: {
      title: 'Elige tu Plan',
      subtitle: 'Desbloquea todo el potencial de tu tienda Etsy con nuestras herramientas premium.',
      monthly: 'Mensual',
      yearly: 'Anual (Ahorra 20%)',
      free: {
        name: 'Creador',
        price: '0',
        features: ['Generador de Listados IA', 'Consejos SEO Básicos', 'Subtítulos para Redes Sociales', 'Generador de Pines de Pinterest']
      },
      pro: {
        name: 'Pro',
        price: '19',
        features: ['Todo en Creador', 'Auditoría Completa de Listados', 'Análisis de Competencia', 'Herramienta de Investigación de Palabras Clave', 'Información de Tendencias del Mercado']
      },
      business: {
        name: 'Negocios',
        price: '49',
        features: ['Todo en Pro', 'Auditorías Ilimitadas', 'Soporte para Múltiples Tiendas', 'Soporte Prioritario', 'Voz de Marca Personalizada']
      },
      cta: 'Empezar'
    },
    footer: {
      tagline: 'Etsy SEO Pro • Inteligencia Artesanal',
      description: 'Empoderando a los creadores independientes para encontrar su audiencia y prosperar en el mercado digital.'
    }
  },
  de: {
    nav: { generator: 'Generator', tips: 'SEO-Tipps', audit: 'Listing-Audit', competitor: 'Wettbewerbsanalyse', keywords: 'Keyword-Recherche', upgrade: 'Upgrade' },
    header: { title: 'Etsy SEO Pro', subtitle: 'Handwerkliche Intelligenz' },
    hero: {
      badge: "Das ultimative Toolkit für Macher",
      title: 'Für Sichtbarkeit geschaffen. Für Erfolg gebaut.',
      subtitle: 'Verwandeln Sie Ihre handwerklichen Kreationen in leistungsstarke Etsy-Listings mit KI-gestütztem SEO, Barrierefreiheit und Social-Media-Inhalten.'
    },
    showcase: {
      title: 'Das Schaufenster',
      drop: 'Lassen Sie Ihr Meisterwerk fallen',
      hint: 'Hochauflösende Fotos verkaufen sich 3x schneller',
      mockups: 'Mockup-Galerie',
      addMore: 'Mehr hinzufügen'
    },
    input: {
      context: 'Produktkontext',
      placeholder: 'Beschreiben Sie Ihre Kreation, Materialien oder Besonderheiten...',
      generate: 'Listing generieren',
      generating: 'Generiere...'
    },
    tabs: {
      listing: 'Listing',
      social: 'Social Story',
      pinterest: 'Pinterest-Pin',
      attributes: 'Attribute',
      seo: 'SEO & Barrierefreiheit'
    },
    health: {
      title: 'Listing-Gesundheitswert',
      subtitle: 'SEO-Audit-Bericht',
      outOf: 'von 100',
      excellent: 'Ausgezeichnet! Ihr Listing ist bereit für das Rampenlicht.',
      good: 'Guter Start. Noch ein paar Anpassungen für die Perfektion.',
      needsAttention: 'Aufmerksamkeit erforderlich. Folgen Sie den obigen Tipps, um die Sichtbarkeit zu verbessern.',
      fullAudit: 'Vollständige Audit-Details',
      checks: {
        titleLength: { label: 'Titellänge', tip: 'Etsy empfiehlt prägnante Titel (40-120 Zeichen), die direkt auf den Punkt kommen.' },
        noDuplicate: { label: 'Keine doppelten Wörter', tip: 'Vermeiden Sie Wortwiederholungen in Ihrem Titel, um ihn sauber und professionell zu halten.' },
        tags: { label: '13 SEO-Tags', tip: 'Die Verwendung aller 13 Tags maximiert Ihre Reichweite in der Etsy-Suche.' },
        description: { label: 'Detaillierte Beschreibung', tip: 'Längere Beschreibungen helfen sowohl beim SEO als auch beim Vertrauen der Käufer.' },
        accessibility: { label: 'Barrierefreiheit (Alt-Text)', tip: 'Alt-Text macht Ihren Shop barrierefrei und hilft bei der Google Bildersuche.' },
        category: { label: 'Kategorie-Vorschläge', tip: 'Genaue Kategorien helfen Käufern, Ihre Artikel beim Stöbern zu finden.' },
        material: { label: 'Materialliste', tip: 'Das Auflisten von Materialien schafft Vertrauen und hilft bei spezifischen Suchen.' },
        social: { label: 'Social-Ready', tip: 'Soziale Signale fördern externen Traffic, was Etsy belohnt.' }
      }
    },
    audit: {
      title: 'Listing-Audit',
      subtitle: 'Analysieren Sie bestehende Listings anhand des Etsy-Verkäuferhandbuchs.',
      placeholder: 'https://www.etsy.com/listing/...',
      button: 'Listing prüfen',
      auditing: 'Prüfe...',
      score: 'Gesamtpunktzahl',
      analysis: 'Analyse',
      recommendation: 'Empfohlene Änderung',
      copyOptimized: 'Optimiert kopieren',
      auditAnother: 'Anderes Listing prüfen',
      summary: 'Audit-Zusammenfassung',
      scoreLabel: 'Punktzahl',
      materialList: 'Materialliste',
      titleOptimization: 'Titel-Optimierung',
      descriptionEngagement: 'Beschreibung & Engagement',
      tagStrategy: 'Tag-Strategie',
      visualPresentation: 'Visuelle Präsentation',
      fullOptimized: 'Vollständig optimiert'
    },
    competitor: {
      title: 'Wettbewerbsanalyse',
      subtitle: 'Analysieren Sie Wettbewerber-Listings, um Lücken in Keywords und Strategie zu finden.',
      placeholder: 'https://www.etsy.com/listing/...',
      button: 'Wettbewerber analysieren',
      analyzing: 'Analysiere...',
      comparison: 'Strategievergleich',
      keywords: 'Keyword-Unterschiede',
      strengths: 'Stärken des Wettbewerbers',
      weaknesses: 'Schwächen des Wettbewerbers',
      opportunities: 'Ihre Chancen',
      compareButton: 'Im Recherche-Tool vergleichen',
      analyzeAnother: 'Anderen Wettbewerber analysieren'
    },
    keywords: {
      title: 'Keyword-Recherche',
      subtitle: 'Entdecken Sie leistungsstarke Long-Tail-Keywords und Markttrends.',
      placeholder: 'Geben Sie ein Seed-Keyword oder einen Produkttyp ein...',
      button: 'Keywords recherchieren',
      researching: 'Recherchiere...',
      suggestions: 'Keyword-Vorschläge',
      insights: 'Markteinblicke',
      relevance: 'Relevanz',
      competition: 'Wettbewerb',
      trend: 'Trend',
      compare: 'Wettbewerbsvergleich',
      compareSubtitle: 'Vergleichen Sie Ihre recherchierten Keywords direkt mit denen aus Wettbewerber-Listings.',
      noCompetitor: 'Keine Wettbewerbsdaten verfügbar. Analysieren Sie zuerst ein Wettbewerber-Listing, um hier einen Vergleich zu sehen.',
      newResearch: 'Neue Recherche',
      goToCompetitor: 'Zur Wettbewerbsanalyse',
      keywordLabel: 'Keyword',
      actionLabel: 'Aktion',
      competitorKeywordLabel: 'Wettbewerber-Keyword'
    },
    metrics: {
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
      rising: 'Steigend',
      falling: 'Fallend',
      stable: 'Stabil'
    },
    tips: {
      title: 'Etsy SEO Handbuch',
      subtitle: 'Beherrschen Sie den Algorithmus mit diesen bewährten Strategien.',
      proTip: 'Profi-Tipp',
      handbookTitle: 'Tiefer Einblick in das Handbuch',
      handbookDesc: 'Das Etsy-Verkäuferhandbuch ist die ultimative Ressource für das Wachstum Ihres Unternehmens. Wir haben seine Kernprinzipien in unsere KI-Engine integriert, aber das Lesen der vollständigen Leitfäden kann noch tiefere Einblicke in Markttrends bieten.',
      handbookButton: 'Handbuch lesen',
      cards: {
        titles: { title: 'Prägnante & klare Titel', desc: 'Etsy bevorzugt jetzt kürzere, besser lesbare Titel (70-100 Zeichen), die für Käufer leicht zu erfassen sind. Vermeiden Sie Keyword-Stuffing.', tip: 'Setzen Sie die aussagekräftigsten Informationen an den Anfang und verwenden Sie natürliche Sprache.' },
        longtail: { title: 'Long-Tail-Strategie', desc: 'Allgemeine Begriffe wie „Tasse“ sind zu wettbewerbsintensiv. Verwenden Sie spezifische Phrasen wie „handgefertigte blaue Keramiktasse“, um kaufbereite Käufer zu erreichen.', tip: 'Verwenden Sie alle 13 Tags. Jeder leere Tag ist eine verpasste Chance für Sichtbarkeit.' },
        visual: { title: 'Visuelles SEO', desc: 'Alt-Text ist nicht nur für die Barrierefreiheit da – er hilft Ihren Produkten, in der Google Bildersuche zu erscheinen und externen Traffic in Ihren Shop zu leiten.', tip: 'Beschreiben Sie das Produkt und seinen Kontext (z. B. „Keramiktasse auf einem rustikalen Holztisch“).' },
        experience: { title: 'Kundenerfahrung', desc: 'Gute Bewertungen und ein ausgefüllter „Über uns“-Bereich signalisieren Etsy, dass Ihr Shop vertrauenswürdig ist, was Ihr Suchranking verbessern kann.', tip: 'Antworten Sie schnell auf Nachrichten und ermutigen Sie Käufer, Fotobewertungen zu hinterlassen.' },
        shipping: { title: 'Einfluss des Versands', desc: 'Etsy bevorzugt Shops, die kostenlosen Versand oder wettbewerbsfähige Tarife anbieten. Schnelle Bearbeitungszeiten spielen ebenfalls eine Rolle bei der Platzierung in der Suche.', tip: 'Erwägen Sie, die Versandkosten in Ihren Artikelpreis einzurechnen, um „Kostenlosen Versand“ anzubieten.' },
        attributes: { title: 'Vollständige Attribute', desc: 'Attribute wirken wie zusätzliche Tags. Das Ausfüllen von Farbe, Material und Anlass hilft Ihnen, in spezifischen gefilterten Suchen zu erscheinen.', tip: 'Wählen Sie immer die spezifischste Kategorie für Ihren Artikel aus.' }
      }
    },
    common: {
      copy: 'Kopieren',
      copied: 'Kopiert',
      copyAll: 'Alles kopieren',
      ready: 'Bereit für das Rampenlicht?',
      readySubtitle: 'Laden Sie Ihre Produktfotos hoch und wir erstellen in Sekundenschnelle ein professionelles, SEO-optimiertes Listing.',
      guide: 'Leitfaden für Macher',
      guideItems: [
        { part1: "Beginnen Sie mit Ihrem ", hook: "Hook", part2: ". Käufer scannen zuerst die ersten 3 Wörter Ihres Titels." },
        { part1: "Verwenden Sie ", hook: "Long-Tail-Keywords", part2: ". Spezifität schlägt allgemeine Begriffe jedes Mal." },
        { part1: "Alt-Text ist Ihre ", hook: "Geheimwaffe", part2: " für die Sichtbarkeit in der Google Bildersuche." }
      ],
      upgradeTitle: 'Premium-Zugang erforderlich',
      upgradeSubtitle: 'Upgrade auf Pro, um erweiterte Tools freizuschalten und deinen Etsy-Shop auf die nächste Stufe zu heben.',
      loginTitle: 'Willkommen zurück, Macher',
      loginSubtitle: 'Melde dich an, um auf dein Premium-SEO-Toolkit zuzugreifen.',
      username: 'Benutzername',
      password: 'Passwort',
      login: 'Anmelden',
      upgrade: 'Jetzt upgraden',
      invalid: 'Ungültige Anmeldedaten. Bitte versuche es erneut.',
      logout: 'Abmelden'
    },
    pricing: {
      title: 'Wählen Sie Ihren Plan',
      subtitle: 'Nutzen Sie das volle Potenzial Ihres Etsy-Shops mit unseren Premium-Tools.',
      monthly: 'Monatlich',
      yearly: 'Jährlich (20% sparen)',
      free: {
        name: 'Macher',
        price: '0',
        features: ['KI-Listing-Generator', 'Grundlegende SEO-Tipps', 'Social-Media-Untertitel', 'Pinterest-Pin-Generator']
      },
      pro: {
        name: 'Pro',
        price: '19',
        features: ['Alles in Macher', 'Vollständiges Listing-Audit', 'Wettbewerbsanalyse', 'Keyword-Recherche-Tool', 'Einblicke in Markttrends']
      },
      business: {
        name: 'Business',
        price: '49',
        features: ['Alles in Pro', 'Unbegrenzte Audits', 'Multi-Shop-Unterstützung', 'Priorisierter Support', 'Individuelle Markenstimme']
      },
      cta: 'Loslegen'
    },
    footer: {
      tagline: 'Etsy SEO Pro • Handwerkliche Intelligenz',
      description: 'Unterstützung unabhängiger Macher dabei, ihr Publikum zu finden und auf dem digitalen Marktplatz erfolgreich zu sein.'
    }
  }
};

const getTranslation = (lang: Language, key: string) => {
  const keys = key.split('.');
  let result: any = translations[lang];
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      return key;
    }
  }
  return result;
};

const HealthScoreCard = ({ listing, language }: { listing: ListingData, language: Language }) => {
  const t = (key: string) => getTranslation(language, key);
  
  const calculateScore = () => {
    const hasDuplicateWords = (text: string) => {
      const words = text.toLowerCase().replace(/[,|]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      const uniqueWords = new Set(words);
      return words.length !== uniqueWords.size;
    };

    const checks = [
      { 
        label: t('health.checks.titleLength.label'), 
        value: listing.title.length >= 40 && listing.title.length <= 120,
        points: 15,
        tip: t('health.checks.titleLength.tip')
      },
      {
        label: t('health.checks.noDuplicate.label'),
        value: !hasDuplicateWords(listing.title),
        points: 10,
        tip: t('health.checks.noDuplicate.tip')
      },
      { 
        label: t('health.checks.tags.label'), 
        value: listing.tags.length === 13,
        points: 15,
        tip: t('health.checks.tags.tip')
      },
      { 
        label: t('health.checks.description.label'), 
        value: listing.description.length > 500,
        points: 15,
        tip: t('health.checks.description.tip')
      },
      { 
        label: t('health.checks.accessibility.label'), 
        value: !!listing.altText,
        points: 15,
        tip: t('health.checks.accessibility.tip')
      },
      { 
        label: t('health.checks.category.label'), 
        value: listing.categorySuggestions.length >= 2,
        points: 10,
        tip: t('health.checks.category.tip')
      },
      { 
        label: t('health.checks.material.label'), 
        value: listing.materials.length >= 3,
        points: 10,
        tip: t('health.checks.material.tip')
      },
      { 
        label: t('health.checks.social.label'), 
        value: !!listing.instagramCaption && listing.instagramHashtags.length >= 5,
        points: 10,
        tip: t('health.checks.social.tip')
      }
    ];

    let score = 0;
    checks.forEach(check => {
      if (check.value) score += check.points;
    });

    return { score, checks };
  };

  const { score, checks } = calculateScore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1A1A] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F1641E]/10 rounded-bl-full -mr-20 -mt-20 blur-3xl group-hover:bg-[#F1641E]/20 transition-all duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F1641E] flex items-center justify-center shadow-lg shadow-[#F1641E]/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif italic">{t('health.title')}</h3>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#F1641E]">{t('health.subtitle')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold font-serif text-[#F1641E]">{score}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{t('health.outOf')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/item">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${check.value ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {check.value ? <Check size={12} /> : <X size={12} />}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold tracking-tight">{check.label}</p>
                <p className="text-[9px] opacity-50 leading-tight mt-1 hidden group-hover/item:block transition-all">{check.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-[#F1641E]" />
            <span className="text-[11px] font-medium opacity-70">
              {score >= 90 ? t('health.excellent') : 
               score >= 70 ? t('health.good') : 
               t('health.needsAttention')}
            </span>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E] hover:underline">
            {t('health.fullAudit')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Tooltip = ({ content }: { content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2 group">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-1 text-[#8E8E8E] hover:text-[#F1641E] transition-colors cursor-help"
      >
        <Info size={14} />
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-4 bg-[#1A1A1A] text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl z-[60] pointer-events-none"
          >
            <div className="relative">
              {content}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-[#1A1A1A]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'tips' | 'audit' | 'competitor' | 'keywords' | 'upgrade'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mockups, setMockups] = useState<string[]>([]);
  const [productContext, setProductContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditUrl, setAuditUrl] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysisResult | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  const [isResearchingKeywords, setIsResearchingKeywords] = useState(false);
  const [keywordResult, setKeywordResult] = useState<KeywordResearchResult | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [activeTab, setActiveTab] = useState<'listing' | 'social' | 'pinterest' | 'attributes' | 'seo'>('listing');
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mockupInputRef = useRef<HTMLInputElement>(null);

  const t = (path: string) => getTranslation(language, path);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Admin' && loginForm.password === '1234') {
      setIsLoggedIn(true);
      setShowUpgradeModal(false);
      setLoginError(false);
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError(true);
    }
  };

  const navigateToPremium = (page: 'audit' | 'competitor' | 'keywords') => {
    if (isLoggedIn) {
      setCurrentPage(page);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setListing(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMockups(prev => [...prev, reader.result as string]);
        setListing(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMockup = (index: number) => {
    setMockups(prev => prev.filter((_, i) => i !== index));
    setListing(null);
  };

  const generateListing = async () => {
    if (!image) return;

    setIsGenerating(true);
    setError(null);

    try {
      const mainImageBase64 = image.split(',')[1];
      const mockupParts = mockups.map(m => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: m.split(',')[1]
        }
      }));

      const model = "gemini-3.1-pro-preview";
      
      const prompt = `
        You are an expert Etsy SEO and Social Media specialist. Analyze the provided product image (first image) and any mockup images (subsequent images) to generate a high-converting, SEO-optimized Etsy listing and a social media post.
        
        IMPORTANT: Generate ALL content in ${language === 'es' ? 'Spanish' : language === 'de' ? 'German' : 'English'}.
        
        ${productContext ? `ADDITIONAL PRODUCT CONTEXT PROVIDED BY USER: "${productContext}"` : ""}

        Follow these Etsy SEO best practices:
        1. Title: Create a clear, descriptive, and buyer-friendly title. Avoid keyword stuffing or long strings of repetitive phrases. Aim for a concise length (around 70-100 characters) that is easy for humans to read. Put the most important, descriptive information first. Do not repeat words. The title should sound like a natural description of the item. Do not worry about IP infringement or Copyright; always use what you think is the best search term for the item uploaded, regardless of potential IP or Copyright concerns.
        2. Description: Engaging, informative, and structured. The first 160 characters should be a compelling summary for search engines. Include sections for features, dimensions (if applicable), and care instructions.
        3. Tags: Exactly 13 tags. Each tag must be under 20 characters. Use multi-word phrases (long-tail keywords). Again, do not worry about IP or Copyright; use the most effective search terms.
        4. Main Alt Text: Create a highly descriptive, keyword-rich Alt text for the main product image. It should describe the subject, style, colors, and textures while naturally incorporating top SEO keywords. Aim for 125-150 characters to maximize accessibility and SEO value.
        5. Mockup Alt Texts: Generate a unique, descriptive Alt text for EACH provided mockup image. Describe the specific scene (e.g., "Framed print on a minimalist nursery wall with wooden toys"), the lighting, the mood, and how the product fits into that environment. Highlight key features or style elements shown in the mockup.
        6. Instagram Caption: Write an engaging, personality-filled Instagram caption to promote this product. Use emojis and a clear call to action.
        7. Instagram Hashtags: Provide exactly 5 highly relevant hashtags for Instagram (as per current best practices).
        8. Pinterest Pin: Generate a high-performing Pinterest Pin Title (max 100 chars) and Description (max 500 chars). Focus on keywords that people search for on Pinterest (e.g., "Gift ideas for...", "DIY...", "Home decor...").
        9. Categories: Suggest 2-3 relevant Etsy categories.
        10. Materials: List likely materials used in the product.
        11. Attributes: Suggest 5-8 relevant Etsy attributes (e.g., Primary Color, Secondary Color, Occasion, Recipient, Style, Holiday). These are the specific dropdown options Etsy sellers fill out to help with search filters.
        12. Room Suggestions: Provide exactly 5 room suggestions where this product would look best (e.g., Living Room, Bedroom, Nursery, Office, Kitchen).
        
        STANDARD PRODUCT FEATURES (Include these in the description):
        - Printed on high-quality 250gsm gloss photo paper (A5, A4, A3) or 200gsm satin paper (A2, A1) for a stunning finish
        - Available in multiple sizes: A5 (8.3 x 5.8), A4 (11.7 x 8.3), A3 (16.5 x 11.7), A2 (16.5 x 23.4), and A1 (23.4 x 33.1)
        - Please note that frames are not included with prints.
        - Smaller sizes (A5, A4, A3) are rolled and shipped in protective cardboard tubes with end caps
        - Larger sizes (A2, A1) are printed on satin paper and also shipped rolled in tubes to prevent damage
        - Colour may vary slightly due to monitor differences

        Return the response in JSON format with the following structure:
        {
          "title": "string",
          "description": "string",
          "tags": ["string", "string", ...],
          "altText": "string",
          "mockupAltTexts": ["string", "string", ...],
          "instagramCaption": "string",
          "instagramHashtags": ["string", "string", "string", "string", "string"],
          "pinterestTitle": "string",
          "pinterestDescription": "string",
          "categorySuggestions": ["string", "string"],
          "materials": ["string", "string"],
          "attributes": [{"label": "string", "value": "string"}],
          "roomSuggestions": ["string", "string", "string", "string", "string"]
        }
      `;

      const result = await genAI.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: mainImageBase64
                }
              },
              ...mockupParts
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      if (responseText) {
        const data = JSON.parse(responseText) as ListingData;
        setListing(data);
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate listing. Please try again with clearer images.");
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeListingFromUrl = async () => {
    if (!auditUrl) return;
    
    setIsAuditing(true);
    setError(null);
    setAuditResult(null);

    try {
      const prompt = `
        You are an expert Etsy SEO Auditor. Visit the provided Etsy listing URL: ${auditUrl}.
        Analyze this listing based on the official Etsy Seller Handbook best practices.
        
        IMPORTANT: Provide ALL feedback, analysis, and recommendations in ${language === 'es' ? 'Spanish' : language === 'de' ? 'German' : 'English'}.
        
        Evaluate the following areas:
        1. Title: Check for keyword placement, length, and readability.
        2. Description: Check for engagement, SEO summary in the first 160 chars, and structure.
        3. Tags: Infer the tags used (or analyze the visible ones) and evaluate their effectiveness.
        4. Images: Analyze the quality and variety of images shown on the page.
        
        Provide a score (0-100) for each area and an overall score.
        For each area, provide specific feedback on what is good and what needs improvement, and provide a concrete suggestion for a change.
        Crucially, also provide a full "recommendation" for the Title, Description, and Tags that the user can copy and paste directly to replace their current ones.
        
        Return the response in JSON format with the following structure:
        {
          "score": number,
          "titleAnalysis": { "score": number, "feedback": "string", "suggestion": "string", "recommendation": "string" },
          "descriptionAnalysis": { "score": number, "feedback": "string", "suggestion": "string", "recommendation": "string" },
          "tagsAnalysis": { "score": number, "feedback": "string", "suggestion": "string", "recommendation": ["string"] },
          "imagesAnalysis": { "score": number, "feedback": "string", "suggestion": "string" },
          "overallFeedback": "string"
        }
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text) as AuditResult;
        setAuditResult(data);
      }
    } catch (err) {
      console.error("Audit error:", err);
      setError("Failed to analyze listing. Please ensure the URL is a valid Etsy listing and try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const analyzeCompetitor = async () => {
    if (!competitorUrl) return;

    setIsAnalyzingCompetitor(true);
    setError(null);
    setCompetitorAnalysis(null);

    try {
      const prompt = `
        You are an expert Etsy Strategist. Analyze the competitor listing at this URL: ${competitorUrl}.
        
        Compare it against the user's current product context if provided: "${productContext}".
        If no product context is provided, analyze the competitor listing generally for its strengths, weaknesses, and keyword strategy.
        
        IMPORTANT: Provide ALL analysis in ${language === 'es' ? 'Spanish' : language === 'de' ? 'German' : 'English'}.
        
        Identify:
        1. Strategy Comparison: How does their approach differ from standard best practices?
        2. Keyword Analysis: What specific high-value keywords are they targeting? For each, provide relevance (0-100), competition (Low, Medium, High), and trend (Rising, Stable, Falling).
        3. Competitor Strengths: What are they doing exceptionally well?
        4. Competitor Weaknesses: Where are they failing or missing opportunities?
        5. Your Opportunities: Based on their weaknesses, how can the user outperform them?
        
        Return the response in JSON format with the following structure:
        {
          "comparison": "string",
          "keywords": [
            { "keyword": "string", "relevance": number, "competition": "Low|Medium|High", "trend": "Rising|Stable|Falling" }
          ],
          "strengths": ["string", "string", ...],
          "weaknesses": ["string", "string", ...],
          "opportunities": ["string", "string", ...]
        }
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      if (responseText) {
        const data = JSON.parse(responseText) as CompetitorAnalysisResult;
        setCompetitorAnalysis(data);
      }
    } catch (err) {
      console.error("Competitor analysis error:", err);
      setError("Failed to analyze competitor. Please check the URL and try again.");
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };

  const researchKeywords = async () => {
    if (!keywordInput) return;

    setIsResearchingKeywords(true);
    setError(null);
    setKeywordResult(null);

    try {
      const prompt = `
        You are an expert Etsy SEO and Market Trends specialist. 
        Research high-performing long-tail keywords and market trends for the following seed keyword/product: "${keywordInput}".
        
        Use Google Search to find current Etsy search trends, popular related searches, and seasonal demand.
        
        IMPORTANT: Provide ALL analysis in ${language === 'es' ? 'Spanish' : language === 'de' ? 'German' : 'English'}.
        
        Provide:
        1. A list of 10-15 high-performing long-tail keyword suggestions.
        2. For each keyword, estimate its relevance (0-100), competition level (Low, Medium, High), and current trend (Rising, Stable, Falling).
        3. Market Insights: A summary of current buyer behavior, seasonal trends, and niche opportunities for this product type.
        
        Return the response in JSON format with the following structure:
        {
          "suggestions": [
            { "keyword": "string", "relevance": number, "competition": "Low|Medium|High", "trend": "Rising|Stable|Falling" }
          ],
          "marketInsights": "string"
        }
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      if (responseText) {
        const data = JSON.parse(responseText) as KeywordResearchResult;
        setKeywordResult(data);
      }
    } catch (err) {
      console.error("Keyword research error:", err);
      setError("Failed to research keywords. Please try again.");
    } finally {
      setIsResearchingKeywords(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyTags = () => {
    if (listing) {
      copyToClipboard(listing.tags.join(', '), 'tags');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#F1641E]/10 relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#F1641E]/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#5A5A40]/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-[#E8E4E1]/50 bg-white/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 bg-[#F1641E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#F1641E]/20 rotate-3 hover:rotate-0 transition-all duration-500">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] font-serif">{t('header.title')}</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#F1641E]">{t('header.subtitle')}</p>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-[#595959]">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`transition-colors relative group ${currentPage === 'home' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              {t('nav.generator')}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => setCurrentPage('tips')}
              className={`transition-colors relative group ${currentPage === 'tips' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              {t('nav.tips')}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'tips' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => navigateToPremium('audit')}
              className={`transition-colors relative group ${currentPage === 'audit' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              <div className="flex items-center gap-1.5">
                {t('nav.audit')}
                {!isLoggedIn && <ShieldCheck size={12} className="text-[#F1641E]" />}
              </div>
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'audit' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => navigateToPremium('competitor')}
              className={`transition-colors relative group ${currentPage === 'competitor' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              <div className="flex items-center gap-1.5">
                {t('nav.competitor')}
                {!isLoggedIn && <ShieldCheck size={12} className="text-[#F1641E]" />}
              </div>
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'competitor' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => navigateToPremium('keywords')}
              className={`transition-colors relative group ${currentPage === 'keywords' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              <div className="flex items-center gap-1.5">
                {t('nav.keywords')}
                {!isLoggedIn && <ShieldCheck size={12} className="text-[#F1641E]" />}
              </div>
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'keywords' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => isLoggedIn ? setIsLoggedIn(false) : setCurrentPage('upgrade')}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-[#333333] transition-all shadow-lg shadow-black/5 active:scale-95"
            >
              {isLoggedIn ? t('common.logout') : t('nav.upgrade')}
            </button>
            
            <div className="relative group/lang">
              <button className="p-2.5 bg-[#FDFCFB] border border-[#E8E4E1] rounded-xl text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm flex items-center gap-2">
                <Globe size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{language}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-[#E8E4E1] opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-[100] overflow-hidden">
                {(['en', 'es', 'de'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-full px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-[#FFF9F6] hover:text-[#F1641E] transition-colors ${language === lang ? 'text-[#F1641E] bg-[#FFF9F6]' : 'text-[#1A1A1A]'}`}
                  >
                    {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Deutsch'}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <motion.main 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-6 py-16 relative"
          >
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-[#F1641E]/5 rounded-full text-[#F1641E] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-[#F1641E]/10"
          >
            {t('hero.badge')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight font-serif"
          >
            {language === 'en' ? (
              <>Crafted for <span className="italic text-[#F1641E]">Visibility</span>. <br /> Built for <span className="underline decoration-[#5A5A40]/30 underline-offset-[12px]">Success</span>.</>
            ) : language === 'es' ? (
              <>Creado para la <span className="italic text-[#F1641E]">Visibilidad</span>. <br /> Construido para el <span className="underline decoration-[#5A5A40]/30 underline-offset-[12px]">Éxito</span>.</>
            ) : (
              <>Für <span className="italic text-[#F1641E]">Sichtbarkeit</span> geschaffen. <br /> Für <span className="underline decoration-[#5A5A40]/30 underline-offset-[12px]">Erfolg</span> gebaut.</>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Upload & Preview (Bento Style) */}
          <section className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#E8E4E1]/60 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#F1641E]/5 rounded-bl-[120px]" />
              
              <h2 className="text-2xl font-bold mb-10 flex items-center gap-4 font-serif">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                  <ImageIcon size={20} />
                </div>
                {t('showcase.title')}
              </h2>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative aspect-[4/5] rounded-[40px] border-2 border-dashed transition-all duration-700 cursor-pointer flex items-center justify-center overflow-hidden
                  ${image ? 'border-transparent shadow-2xl' : 'border-[#E8E4E1] hover:border-[#F1641E] hover:bg-[#FFF9F6]'}`}
              >
                {image ? (
                  <>
                    <img src={image} alt={listing?.altText || "Product Preview"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-md">
                      <div className="bg-white/20 p-5 rounded-full backdrop-blur-lg border border-white/30">
                        <RefreshCw size={28} className="animate-spin-slow" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-24 h-24 bg-[#FDFCFB] rounded-full flex items-center justify-center mx-auto mb-8 text-[#595959] shadow-inner border border-[#E8E4E1]/50">
                      <Upload size={36} />
                    </div>
                    <p className="font-bold text-xl text-[#1A1A1A] font-serif">{t('showcase.drop')}</p>
                    <p className="text-sm text-[#8E8E8E] mt-3">{t('showcase.hint')}</p>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />

              {/* Mockups Section */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8E8E8E] flex items-center gap-2">
                    <ImageIcon size={14} /> {t('showcase.mockups')}
                  </h3>
                  <button 
                    onClick={() => mockupInputRef.current?.click()}
                    className="px-4 py-2 bg-[#FDFCFB] border border-[#E8E4E1] rounded-full text-[10px] font-sans font-bold text-[#222222] hover:bg-[#F1641E] hover:text-white hover:border-[#F1641E] transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={12} /> {t('showcase.addMore')}
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <AnimatePresence>
                    {mockups.map((m, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-[#E8E4E1] group shadow-sm"
                      >
                        <img src={m} alt={listing?.mockupAltTexts?.[idx] || `Mockup ${idx + 1}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeMockup(idx)}
                          className="absolute top-1 right-1 p-1.5 bg-white/90 text-[#222222] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={10} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {mockups.length < 8 && (
                    <button 
                      onClick={() => mockupInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-[#E8E4E1] flex items-center justify-center text-[#E8E4E1] hover:border-[#F1641E] hover:text-[#F1641E] transition-all hover:bg-[#FFF9F6]"
                    >
                      <Plus size={24} />
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={mockupInputRef} 
                  onChange={handleMockupUpload} 
                  className="hidden" 
                  accept="image/*"
                  multiple
                />
              </div>

              {/* Product Context Input */}
              <div className="mt-10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] mb-4 flex items-center gap-2">
                  <MessageSquare size={14} /> {t('input.context')}
                  <Tooltip content="If the product is vague or unique, tell us what it is (e.g., 'Hand-poured soy candle with lavender scent') to help the AI generate more accurate keywords." />
                </h3>
                <textarea
                  value={productContext}
                  onChange={(e) => setProductContext(e.target.value)}
                  placeholder={t('input.placeholder')}
                  className="w-full h-24 p-5 bg-[#FDFCFB] border border-[#E8E4E1] rounded-3xl text-sm font-sans focus:border-[#F1641E] focus:ring-1 focus:ring-[#F1641E] transition-all resize-none placeholder:text-[#8E8E8E]/50"
                />
              </div>

              <button
                onClick={generateListing}
                disabled={!image || isGenerating}
                className={`w-full mt-12 py-5 rounded-2xl font-sans font-bold text-lg transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden
                  ${!image || isGenerating 
                    ? 'bg-[#E8E4E1] text-[#8E8E8E] cursor-not-allowed' 
                    : 'bg-[#222222] text-white hover:bg-[#1A1A1A] shadow-2xl hover:shadow-[#222222]/20 active:scale-[0.98]'}`}
              >
                {isGenerating && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    {t('input.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-[#F1641E]" />
                    {t('input.generate')}
                  </>
                )}
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-sans border border-red-100"
                >
                  <AlertCircle size={20} />
                  {error}
                </motion.div>
              )}
            </motion.div>

            <div className="bg-[#5A5A40] text-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-1000" />
              <h3 className="text-3xl font-bold mb-8 font-serif italic">{t('common.guide')}</h3>
              <ul className="space-y-8 text-sm opacity-90 leading-relaxed">
                {(t('common.guideItems') as any[]).map((item, idx) => (
                  <li key={idx} className="flex gap-5">
                    <div className="w-8 h-8 rounded-xl bg-[#F1641E] flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-[#F1641E]/20">{idx + 1}</div>
                    <p>
                      {item.part1}
                      <span className="font-bold text-white underline decoration-white/30 underline-offset-4">{item.hook}</span>
                      {item.part2}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Right Column: Results (Elegant Cards) */}
          <section className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {!listing && !isGenerating ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center p-20 bg-white/40 border-2 border-dashed border-[#E8E4E1] rounded-[40px] backdrop-blur-sm"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-8 text-[#E8E4E1]"
                  >
                    <FileText size={40} />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-4">{t('common.ready')}</h3>
                  <p className="text-[#595959] font-sans max-w-sm mx-auto leading-relaxed">
                    {t('common.readySubtitle')}
                  </p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[32px] p-8 border border-[#E8E4E1] shadow-sm animate-pulse">
                      <div className="h-4 w-32 bg-[#FDFCFB] rounded-full mb-6" />
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-[#FDFCFB] rounded-full" />
                        <div className="h-4 w-[90%] bg-[#FDFCFB] rounded-full" />
                        <div className="h-4 w-[70%] bg-[#FDFCFB] rounded-full" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <HealthScoreCard listing={listing} language={language} />

                  {/* Tabs Navigation */}
                    <div className="flex p-1.5 bg-white/50 backdrop-blur-sm border border-[#E8E4E1] rounded-[32px] mb-8 sticky top-4 z-20 shadow-sm overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-1 min-w-full">
                        {[
                          { id: 'listing', label: t('tabs.listing'), icon: FileText },
                          { id: 'social', label: t('tabs.social'), icon: ImageIcon },
                          { id: 'pinterest', label: t('tabs.pinterest'), icon: Pin },
                          { id: 'attributes', label: t('tabs.attributes'), icon: LayoutGrid },
                          { id: 'seo', label: t('tabs.seo'), icon: Accessibility }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 min-w-fit flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden whitespace-nowrap
                              ${activeTab === tab.id 
                                ? 'text-white shadow-lg' 
                                : 'text-[#8E8E8E] hover:text-[#1A1A1A] hover:bg-white/50'}`}
                          >
                            {activeTab === tab.id && (
                              <motion.div 
                                layoutId="activeTab"
                                className="absolute inset-0 bg-[#222222]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <tab.icon size={14} className="relative z-10 shrink-0" />
                            <span className="relative z-10">{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'listing' && (
                      <motion.div
                        key="listing-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60 group relative"
                        >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                          <Type size={14} />
                        </div>
                        SEO Title
                        <Tooltip content="Etsy uses the first few words of your title to determine search relevance. Put your most important keywords first." />
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(listing?.title || '', 'title')}
                        className="p-3.5 hover:bg-[#FDFCFB] rounded-2xl transition-all text-[#595959] border border-transparent hover:border-[#E8E4E1] active:scale-90"
                      >
                        {copiedSection === 'title' ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                      </button>
                    </div>
                    <p className="text-3xl font-bold leading-tight text-[#1A1A1A] font-serif">{listing?.title}</p>
                    <div className="mt-10 flex items-center gap-4">
                      <div className="h-2 flex-1 bg-[#FDFCFB] rounded-full overflow-hidden border border-[#E8E4E1]/30">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((listing?.title?.length || 0) / 140) * 100}%` }}
                          className={`h-full rounded-full transition-colors duration-500 ${(listing?.title?.length || 0) > 140 ? 'bg-red-400' : 'bg-[#F1641E]'}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#8E8E8E] font-mono">
                        {listing?.title?.length || 0} / 140
                      </span>
                    </div>
                  </motion.div>

                  {/* Tags Section */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                          <Tag size={14} />
                        </div>
                        13 SEO Tags
                        <Tooltip content="Tags help Etsy's search engine find your items. Using all 13 tags with long-tail keywords maximizes your reach." />
                      </h3>
                      <button 
                        onClick={copyTags}
                        className="px-6 py-3 bg-[#FDFCFB] border border-[#E8E4E1] rounded-2xl text-[10px] font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all flex items-center gap-2 shadow-sm active:scale-95"
                      >
                        {copiedSection === 'tags' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        Copy All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {listing?.tags.map((tag, idx) => (
                        <motion.span 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="px-5 py-2.5 bg-[#FDFCFB] rounded-2xl text-[11px] font-medium border border-[#E8E4E1]/60 hover:border-[#F1641E] hover:text-[#F1641E] transition-all cursor-default shadow-sm"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Description Section */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                          <FileText size={14} />
                        </div>
                        Description
                        <Tooltip content="The first 160 characters are used by Google as a meta description. Keep it engaging and keyword-rich." />
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(listing?.description || '', 'desc')}
                        className="p-3.5 hover:bg-[#FDFCFB] rounded-2xl transition-all text-[#595959] border border-transparent hover:border-[#E8E4E1] active:scale-90"
                      >
                        {copiedSection === 'desc' ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                      </button>
                    </div>
                    <p className="text-[15px] leading-[1.8] whitespace-pre-wrap text-[#444444] px-2 font-sans">
                      {listing?.description}
                    </p>
                    </motion.div>
                  </motion.div>
                )}

                    {activeTab === 'social' && (
                      <motion.div
                        key="social-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-[#FFF9F6] rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(241,100,30,0.1)] border border-[#F1641E]/10 relative overflow-hidden"
                        >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F1641E]/5 rounded-bl-[80px]" />
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F1641E] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                          <ImageIcon size={18} />
                        </div>
                        Social Story
                        <Tooltip content="Social signals drive external traffic to your shop, which can improve your overall Etsy search ranking." />
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(`${listing?.instagramCaption || ''}\n\n${(listing?.instagramHashtags || []).join(' ')}`, 'insta')}
                        className="px-8 py-3.5 bg-white border border-[#F1641E]/20 rounded-2xl text-[10px] font-bold text-[#F1641E] hover:bg-[#F1641E] hover:text-white transition-all flex items-center gap-2 shadow-md active:scale-95"
                      >
                        {copiedSection === 'insta' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        Copy Post
                      </button>
                    </div>
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white shadow-sm">
                      <p className="text-[15px] leading-relaxed text-[#1A1A1A] whitespace-pre-wrap italic font-serif">
                        {listing?.instagramCaption}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {listing?.instagramHashtags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] font-bold text-[#F1641E] bg-white px-4 py-2 rounded-xl shadow-sm border border-[#F1641E]/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeTab === 'pinterest' && (
                      <motion.div
                        key="pinterest-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                        >
                          <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-4">
                              <div className="w-8 h-8 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                                <Pin size={14} />
                              </div>
                              Pinterest Pin Generator
                              <Tooltip content="Pinterest is a visual search engine. High-quality titles and descriptions help your pins appear in relevant searches." />
                            </h3>
                            <button 
                              onClick={() => copyToClipboard(`${listing?.pinterestTitle || ''}\n\n${listing?.pinterestDescription || ''}`, 'pin')}
                              className="px-6 py-3 bg-[#FDFCFB] border border-[#E8E4E1] rounded-2xl text-[10px] font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all flex items-center gap-2 shadow-sm active:scale-95"
                            >
                              {copiedSection === 'pin' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              Copy All
                            </button>
                          </div>
                          
                          <div className="space-y-8">
                            <div className="group/item">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Pin Title</span>
                                <button 
                                  onClick={() => copyToClipboard(listing?.pinterestTitle || '', 'pin-title')}
                                  className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-all text-[#8E8E8E] hover:text-[#F1641E] opacity-0 group-hover/item:opacity-100"
                                >
                                  {copiedSection === 'pin-title' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                </button>
                              </div>
                              <p className="text-2xl font-bold text-[#1A1A1A] font-serif leading-tight">
                                {listing?.pinterestTitle}
                              </p>
                            </div>
                            
                            <div className="h-px bg-[#E8E4E1]/40" />
                            
                            <div className="group/item">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Pin Description</span>
                                <button 
                                  onClick={() => copyToClipboard(listing?.pinterestDescription || '', 'pin-desc')}
                                  className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-all text-[#8E8E8E] hover:text-[#F1641E] opacity-0 group-hover/item:opacity-100"
                                >
                                  {copiedSection === 'pin-desc' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                </button>
                              </div>
                              <p className="text-[15px] leading-relaxed text-[#444444] whitespace-pre-wrap font-sans">
                                {listing?.pinterestDescription}
                              </p>
                            </div>

                            {listing?.mockupAltTexts && listing.mockupAltTexts.length > 0 && (
                              <>
                                <div className="h-px bg-[#E8E4E1]/40" />
                                <div className="group/item">
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Mockup Alt Text Suggestion</span>
                                    <button 
                                      onClick={() => copyToClipboard(listing.mockupAltTexts[0], 'pin-alt')}
                                      className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-all text-[#8E8E8E] hover:text-[#F1641E] opacity-0 group-hover/item:opacity-100"
                                    >
                                      {copiedSection === 'pin-alt' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                  <p className="text-sm italic text-[#595959] font-sans">
                                    {listing.mockupAltTexts[0]}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeTab === 'attributes' && (
                      <motion.div
                        key="attributes-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                        >
                          <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-4">
                              <div className="w-8 h-8 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                                <LayoutGrid size={14} />
                              </div>
                              {t('tabs.attributes')}
                              <Tooltip content="Attributes are specific dropdown options on Etsy that help buyers filter search results. Filling these out accurately is crucial for visibility." />
                            </h3>
                            <button 
                              onClick={() => {
                                const text = listing?.attributes.map(a => `${a.label}: ${a.value}`).join('\n');
                                copyToClipboard(text || '', 'attributes');
                              }}
                              className="px-6 py-3 bg-[#FDFCFB] border border-[#E8E4E1] rounded-2xl text-[10px] font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all flex items-center gap-2 shadow-sm active:scale-95"
                            >
                              {copiedSection === 'attributes' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              {t('common.copyAll')}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listing?.attributes.map((attr, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-[#FDFCFB] p-6 rounded-3xl border border-[#E8E4E1]/40 hover:border-[#F1641E]/30 transition-all shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">{attr.label}</span>
                                  <button 
                                    onClick={() => copyToClipboard(attr.value, `attr-${idx}`)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-xl shadow-md border border-[#E8E4E1]/30"
                                  >
                                    {copiedSection === `attr-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                  </button>
                                </div>
                                <p className="text-lg font-bold text-[#1A1A1A] font-serif">{attr.value}</p>
                              </motion.div>
                            ))}
                          </div>

                          {listing?.roomSuggestions && listing.roomSuggestions.length > 0 && (
                            <div className="mt-12">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-[#F1641E]" />
                                  Room Suggestions (Up to 5)
                                </h4>
                                <button 
                                  onClick={() => copyToClipboard(listing.roomSuggestions.join(', '), 'rooms-all')}
                                  className="text-[9px] font-bold uppercase tracking-widest text-[#F1641E] hover:underline flex items-center gap-2"
                                >
                                  {copiedSection === 'rooms-all' ? <Check size={10} /> : <Copy size={10} />}
                                  Copy All
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {listing.roomSuggestions.map((room, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => copyToClipboard(room, `room-${idx}`)}
                                    className="group relative bg-[#FDFCFB] px-6 py-3 rounded-2xl border border-[#E8E4E1]/40 text-sm font-medium text-[#1A1A1A] shadow-sm hover:border-[#F1641E]/30 transition-all flex items-center gap-3 active:scale-95"
                                  >
                                    {room}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      {copiedSection === `room-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-[#8E8E8E]" />}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-10 p-6 bg-[#FFF9F6] rounded-2xl border border-[#F1641E]/10">
                            <div className="flex items-start gap-3">
                              <Info size={16} className="text-[#F1641E] mt-0.5 shrink-0" />
                              <p className="text-[11px] text-[#F1641E]/80 leading-relaxed font-medium">
                                <strong className="block mb-1 text-[#F1641E]">Etsy SEO Tip:</strong>
                                Attributes act as filters in Etsy search. If a buyer filters for "Minimalist" style and you haven't selected it in your attributes, your item won't appear, even if the word is in your title or tags!
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeTab === 'seo' && (
                      <motion.div
                        key="seo-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                        >
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                          <Accessibility size={14} />
                        </div>
                        Accessibility & SEO
                        <Tooltip content="Alt text makes your shop accessible to visually impaired buyers and helps your images appear in Google Image Search." />
                      </h3>
                    </div>
                    <div className="space-y-8">
                      <div className="bg-[#FDFCFB] p-8 rounded-3xl border border-[#E8E4E1]/40 group relative shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-8">
                          {image && (
                            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden border border-[#E8E4E1]/40 shrink-0">
                              <img src={image} alt={listing?.altText || "Main Product"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Main Showcase Alt Text</span>
                              <button 
                                onClick={() => copyToClipboard(listing?.altText || '', 'alt')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 hover:bg-white rounded-xl shadow-md border border-[#E8E4E1]/30"
                              >
                                {copiedSection === 'alt' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              </button>
                            </div>
                            <p className="text-sm italic text-[#444444] leading-relaxed font-serif">"{listing?.altText}"</p>
                          </div>
                        </div>
                      </div>
                      
                      {listing?.mockupAltTexts && listing.mockupAltTexts.length > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                          {listing.mockupAltTexts.map((alt, idx) => (
                            <div key={idx} className="group relative bg-[#FDFCFB] p-6 rounded-3xl border border-[#E8E4E1]/40 hover:border-[#F1641E]/30 transition-all shadow-sm">
                              <div className="flex flex-col md:flex-row gap-6">
                                {mockups[idx] && (
                                  <div className="w-full md:w-24 h-24 rounded-xl overflow-hidden border border-[#E8E4E1]/40 shrink-0">
                                    <img src={mockups[idx]} alt={alt || `Mockup ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Mockup {idx + 1} Alt Text</span>
                                    <button 
                                      onClick={() => copyToClipboard(alt, `mockup-alt-${idx}`)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-xl shadow-md border border-[#E8E4E1]/30"
                                    >
                                      {copiedSection === `mockup-alt-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                  <p className="text-xs italic text-[#595959] leading-relaxed font-serif">"{alt}"</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                        </motion.div>

                        {/* Extra Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                          >
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#F1641E]" />
                          Suggested Etsy Categories
                          <Tooltip content="Accurate categorization ensures your items appear in the right browse results and relevant search filters." />
                        </h4>
                        <button 
                          onClick={() => copyToClipboard((listing?.categorySuggestions || []).join('\n'), 'cats-all')}
                          className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-all text-[#8E8E8E] hover:text-[#F1641E] border border-transparent hover:border-[#E8E4E1] active:scale-90"
                          title="Copy All Categories"
                        >
                          {copiedSection === 'cats-all' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {listing?.categorySuggestions.map((cat, i) => (
                          <div 
                            key={i} 
                            className="group flex items-center justify-between p-4 bg-[#FDFCFB] rounded-2xl border border-[#E8E4E1]/40 hover:border-[#F1641E]/30 transition-all shadow-sm"
                          >
                            <span className="text-sm text-[#444444] font-medium">{cat}</span>
                            <button 
                              onClick={() => copyToClipboard(cat, `cat-${i}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-xl shadow-md border border-[#E8E4E1]/30"
                            >
                              {copiedSection === `cat-${i}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-[40px] p-10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.04)] border border-[#E8E4E1]/60"
                    >
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E] mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#5A5A40]" />
                        {t('audit.materialList')}
                        <Tooltip content="Listing materials helps buyers find specific items and builds trust by detailing the quality of your craft." />
                      </h4>
                      <ul className="space-y-4">
                        {listing?.materials.map((mat, i) => (
                          <li key={i} className="text-sm text-[#444444] flex items-center gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8E4E1]" />
                            {mat}
                          </li>
                        ))}
                      </ul>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </motion.main>
    ) : currentPage === 'audit' ? (
      <motion.main 
        key="audit"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto px-6 py-16 relative"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-[#F1641E]/5 rounded-full text-[#F1641E] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-[#F1641E]/10"
          >
            {t('audit.title')}
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-serif">
            {t('audit.title')}
          </h2>
          <p className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed">
            {t('audit.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#E8E4E1]/60">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8E8E8E]" size={20} />
                <input 
                  type="text"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  placeholder={t('audit.placeholder')}
                  className="w-full pl-16 pr-6 py-5 bg-[#FDFCFB] border border-[#E8E4E1] rounded-[32px] text-lg focus:outline-none focus:border-[#F1641E] transition-all placeholder:text-[#BBB]"
                />
              </div>
              <button 
                onClick={analyzeListingFromUrl}
                disabled={isAuditing || !auditUrl}
                className={`px-10 py-5 rounded-[32px] font-bold text-lg transition-all flex items-center justify-center gap-3
                  ${isAuditing || !auditUrl 
                    ? 'bg-[#E8E4E1] text-[#8E8E8E] cursor-not-allowed' 
                    : 'bg-[#222222] text-white hover:bg-[#1A1A1A] shadow-xl active:scale-95'}`}
              >
                {isAuditing ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    {t('audit.auditing')}
                  </>
                ) : (
                  <>
                    <Activity size={20} className="text-[#F1641E]" />
                    {t('audit.button')}
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-4 text-red-500 text-sm flex items-center gap-2 px-4">
                <AlertCircle size={16} /> {error}
              </p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isAuditing ? (
            <motion.div 
              key="audit-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[40px] p-10 border border-[#E8E4E1] shadow-sm animate-pulse">
                  <div className="h-6 w-48 bg-[#FDFCFB] rounded-full mb-6" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-[#FDFCFB] rounded-full" />
                    <div className="h-4 w-[80%] bg-[#FDFCFB] rounded-full" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : auditResult ? (
            <motion.div 
              key="audit-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {/* Overall Score Card */}
              <div className="bg-[#5A5A40] rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-white/10"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#F1641E"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        initial={{ strokeDashoffset: 440 }}
                        animate={{ strokeDashoffset: 440 - (440 * auditResult.score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold font-serif">{auditResult.score}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('audit.scoreLabel')}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-4 font-serif italic">{t('audit.summary')}</h3>
                    <p className="text-lg opacity-90 leading-relaxed italic">
                      "{auditResult.overallFeedback}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 gap-8">
                {[
                  { title: t('audit.titleOptimization'), data: auditResult.titleAnalysis, icon: Type },
                  { title: t('audit.descriptionEngagement'), data: auditResult.descriptionAnalysis, icon: FileText },
                  { title: t('audit.tagStrategy'), data: auditResult.tagsAnalysis, icon: Tag },
                  { title: t('audit.visualPresentation'), data: auditResult.imagesAnalysis, icon: ImageIcon }
                ].map((section, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] shadow-sm">
                          <section.icon size={24} />
                        </div>
                        <h4 className="text-2xl font-bold font-serif">{section.title}</h4>
                      </div>
                      <div className="px-5 py-2 bg-[#FDFCFB] border border-[#E8E4E1] rounded-full text-sm font-bold">
                        {t('audit.scoreLabel')}: <span className={section.data.score >= 80 ? 'text-emerald-600' : section.data.score >= 50 ? 'text-amber-500' : 'text-red-500'}>
                          {section.data.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E8E] mb-4">{t('audit.analysis')}</h5>
                        <p className="text-[#595959] leading-relaxed text-[15px]">{section.data.feedback}</p>
                      </div>
                      <div className="bg-[#FFF9F6] p-8 rounded-3xl border border-[#F1641E]/5">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F1641E] mb-4">{t('audit.recommendation')}</h5>
                        <p className="text-[#1A1A1A] font-medium leading-relaxed text-[15px] italic">"{section.data.suggestion}"</p>
                      </div>
                    </div>

                    {/* Full Recommendation Section */}
                    {section.data.recommendation && (
                      <div className="mt-10 pt-10 border-t border-[#E8E4E1]/40">
                        <div className="flex items-center justify-between mb-6">
                          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">{t('audit.fullOptimized')} {section.title.split(' ')[0]}</h5>
                          <button 
                            onClick={() => {
                              const text = Array.isArray(section.data.recommendation) 
                                ? section.data.recommendation.join(', ') 
                                : section.data.recommendation;
                              copyToClipboard(text, `audit-rec-${idx}`);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E4E1] rounded-xl text-[10px] font-bold hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            {copiedSection === `audit-rec-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            {t('audit.copyOptimized')}
                          </button>
                        </div>
                        <div className="bg-[#FDFCFB] p-6 rounded-2xl border border-[#E8E4E1]/40">
                          {Array.isArray(section.data.recommendation) ? (
                            <div className="flex flex-wrap gap-2">
                              {section.data.recommendation.map((tag: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-white border border-[#E8E4E1]/60 rounded-lg text-xs font-medium text-[#444444]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[15px] leading-relaxed text-[#444444] whitespace-pre-wrap font-sans">
                              {section.data.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-8">
                <button 
                  onClick={() => {
                    setAuditUrl('');
                    setAuditResult(null);
                  }}
                  className="px-8 py-4 bg-[#FDFCFB] border border-[#E8E4E1] rounded-full text-sm font-bold hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm"
                >
                  {t('audit.auditAnother')}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.main>
    ) : currentPage === 'competitor' ? (
      <motion.main 
        key="competitor"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto px-6 py-16 relative"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-[#F1641E]/5 rounded-full text-[#F1641E] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-[#F1641E]/10"
          >
            {t('competitor.title')}
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-serif">
            {t('competitor.title')}
          </h2>
          <p className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed">
            {t('competitor.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#E8E4E1]/60">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8E8E8E]" size={20} />
                <input 
                  type="text"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  placeholder={t('competitor.placeholder')}
                  className="w-full pl-16 pr-6 py-5 bg-[#FDFCFB] border border-[#E8E4E1] rounded-3xl text-sm focus:border-[#F1641E] focus:ring-1 focus:ring-[#F1641E] transition-all"
                />
              </div>
              <button 
                onClick={analyzeCompetitor}
                disabled={!competitorUrl || isAnalyzingCompetitor}
                className={`px-10 py-5 rounded-3xl font-bold transition-all flex items-center justify-center gap-3
                  ${!competitorUrl || isAnalyzingCompetitor 
                    ? 'bg-[#E8E4E1] text-[#8E8E8E] cursor-not-allowed' 
                    : 'bg-[#F1641E] text-white hover:bg-[#D95319] shadow-xl shadow-[#F1641E]/20 active:scale-95'}`}
              >
                {isAnalyzingCompetitor ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    {t('competitor.analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    {t('competitor.button')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isAnalyzingCompetitor ? (
            <motion.div 
              key="analyzing-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-[#F1641E]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#F1641E] rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#F1641E]">
                  <Search size={32} />
                </div>
              </div>
              <p className="text-xl font-serif italic text-[#595959] animate-pulse">{t('competitor.analyzing')}</p>
            </motion.div>
          ) : competitorAnalysis ? (
            <motion.div 
              key="competitor-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto space-y-12"
            >
              {/* Strategy Comparison */}
              <div className="bg-[#5A5A40] rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6 font-serif italic">{t('competitor.comparison')}</h3>
                  <p className="text-lg opacity-90 leading-relaxed max-w-3xl">
                    {competitorAnalysis.comparison}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Keywords */}
                <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm">
                  <h4 className="text-xl font-bold mb-8 font-serif flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E]">
                      <Tag size={20} />
                    </div>
                    {t('competitor.keywords')}
                  </h4>
                  <div className="space-y-4">
                    {competitorAnalysis.keywords.map((kw, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#FDFCFB] border border-[#E8E4E1] rounded-2xl group hover:border-[#F1641E]/30 transition-all">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1A1A1A]">{kw.keyword}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider
                              ${kw.competition === 'Low' ? 'text-emerald-600' :
                                kw.competition === 'Medium' ? 'text-amber-600' :
                                'text-red-600'}`}
                            >
                              {kw.competition === 'Low' ? t('metrics.low') : kw.competition === 'Medium' ? t('metrics.medium') : t('metrics.high')}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-[#8E8E8E]">
                              {kw.trend === 'Rising' ? <TrendingUp size={10} className="text-emerald-500" /> : 
                               kw.trend === 'Falling' ? <TrendingUp size={10} className="text-red-500 rotate-180" /> : 
                               <Activity size={10} className="text-amber-500" />}
                              {kw.trend === 'Rising' ? t('metrics.rising') : kw.trend === 'Falling' ? t('metrics.falling') : t('metrics.stable')}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(kw.keyword, `comp-kw-${i}`)}
                          className="p-2 hover:bg-white rounded-xl shadow-sm border border-[#E8E4E1]/50 transition-all active:scale-90"
                        >
                          {copiedSection === `comp-kw-${i}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-[#8E8E8E]" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage('keywords')}
                    className="w-full mt-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:bg-[#333333] transition-all flex items-center justify-center gap-2"
                  >
                    <Search size={18} />
                    {t('competitor.compareButton')}
                  </button>
                </div>

                {/* Opportunities */}
                <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm">
                  <h4 className="text-xl font-bold mb-8 font-serif flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F1641E]/10 flex items-center justify-center text-[#F1641E]">
                      <TrendingUp size={20} />
                    </div>
                    {t('competitor.opportunities')}
                  </h4>
                  <ul className="space-y-4">
                    {competitorAnalysis.opportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-[#595959] leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F1641E] mt-2 shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="bg-emerald-50/30 rounded-[40px] p-10 border border-emerald-100">
                  <h4 className="text-xl font-bold mb-8 font-serif flex items-center gap-3 text-emerald-900">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Check size={20} />
                    </div>
                    {t('competitor.strengths')}
                  </h4>
                  <ul className="space-y-4">
                    {competitorAnalysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-emerald-800/80 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50/30 rounded-[40px] p-10 border border-red-100">
                  <h4 className="text-xl font-bold mb-8 font-serif flex items-center gap-3 text-red-900">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                      <X size={20} />
                    </div>
                    {t('competitor.weaknesses')}
                  </h4>
                  <ul className="space-y-4">
                    {competitorAnalysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-red-800/80 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center pt-8">
                <button 
                  onClick={() => {
                    setCompetitorUrl('');
                    setCompetitorAnalysis(null);
                  }}
                  className="px-8 py-4 bg-[#FDFCFB] border border-[#E8E4E1] rounded-full text-sm font-bold hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm"
                >
                  {t('competitor.analyzeAnother')}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.main>
    ) : currentPage === 'keywords' ? (
      <motion.main 
        key="keywords"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto px-6 py-16 relative"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-[#F1641E]/5 rounded-full text-[#F1641E] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-[#F1641E]/10"
          >
            {t('keywords.title')}
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-serif">
            {t('keywords.title')}
          </h2>
          <p className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed">
            {t('keywords.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-[48px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-[#E8E4E1]/60">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8E8E8E]" size={20} />
                <input 
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder={t('keywords.placeholder')}
                  className="w-full pl-16 pr-6 py-5 bg-[#FDFCFB] border border-[#E8E4E1] rounded-3xl text-sm focus:border-[#F1641E] focus:ring-1 focus:ring-[#F1641E] transition-all"
                />
              </div>
              <button 
                onClick={researchKeywords}
                disabled={!keywordInput || isResearchingKeywords}
                className={`px-10 py-5 rounded-3xl font-bold transition-all flex items-center justify-center gap-3
                  ${!keywordInput || isResearchingKeywords 
                    ? 'bg-[#E8E4E1] text-[#8E8E8E] cursor-not-allowed' 
                    : 'bg-[#F1641E] text-white hover:bg-[#D95319] shadow-xl shadow-[#F1641E]/20 active:scale-95'}`}
              >
                {isResearchingKeywords ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    {t('keywords.researching')}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    {t('keywords.button')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isResearchingKeywords ? (
            <motion.div 
              key="researching-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-[#F1641E]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#F1641E] rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#F1641E]">
                  <Search size={32} />
                </div>
              </div>
              <p className="text-xl font-serif italic text-[#595959] animate-pulse">{t('keywords.researching')}</p>
            </motion.div>
          ) : keywordResult ? (
            <motion.div 
              key="keyword-results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-12"
            >
              {/* Market Insights */}
              <div className="bg-[#5A5A40] rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6 font-serif italic">{t('keywords.insights')}</h3>
                  <p className="text-lg opacity-90 leading-relaxed max-w-4xl">
                    {keywordResult.marketInsights}
                  </p>
                </div>
              </div>

              {/* Suggestions Table */}
              <div className="bg-white rounded-[48px] p-10 border border-[#E8E4E1]/60 shadow-sm overflow-hidden">
                <h3 className="text-2xl font-bold mb-8 font-serif">{t('keywords.suggestions')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#E8E4E1]/50">
                        <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.keywordLabel')}</th>
                        <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.relevance')}</th>
                        <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.competition')}</th>
                        <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.trend')}</th>
                        <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.actionLabel')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E4E1]/30">
                      {keywordResult.suggestions.map((item, i) => (
                        <tr key={i} className="group hover:bg-[#FDFCFB] transition-colors">
                          <td className="py-6 px-4 font-medium text-[#1A1A1A]">{item.keyword}</td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-[#E8E4E1] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#F1641E]" 
                                  style={{ width: `${item.relevance}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-[#F1641E]">{item.relevance}%</span>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${item.competition === 'Low' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                item.competition === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-red-50 text-red-600 border border-red-100'}`}
                            >
                              {item.competition === 'Low' ? t('metrics.low') : item.competition === 'Medium' ? t('metrics.medium') : t('metrics.high')}
                            </span>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-2">
                              {item.trend === 'Rising' ? (
                                <TrendingUp size={14} className="text-emerald-500" />
                              ) : item.trend === 'Falling' ? (
                                <TrendingUp size={14} className="text-red-500 rotate-180" />
                              ) : (
                                <Activity size={14} className="text-amber-500" />
                              )}
                              <span className="text-xs font-medium text-[#595959]">{item.trend === 'Rising' ? t('metrics.rising') : item.trend === 'Falling' ? t('metrics.falling') : t('metrics.stable')}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <button 
                              onClick={() => copyToClipboard(item.keyword, `kw-${i}`)}
                              className="p-2 hover:bg-white rounded-xl shadow-sm border border-[#E8E4E1]/50 transition-all active:scale-90"
                            >
                              {copiedSection === `kw-${i}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-[#8E8E8E]" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Competitor Comparison Section */}
              <div className="pt-12 border-t border-[#E8E4E1]/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h3 className="text-3xl font-bold font-serif mb-2">{t('keywords.compare')}</h3>
                    <p className="text-[#595959]">{t('keywords.compareSubtitle')}</p>
                  </div>
                  {competitorAnalysis && (
                    <div className="px-6 py-3 bg-[#F1641E]/5 border border-[#F1641E]/10 rounded-2xl flex items-center gap-3">
                      <Globe size={18} className="text-[#F1641E]" />
                      <span className="text-sm font-medium text-[#F1641E] truncate max-w-[200px]">{competitorUrl}</span>
                    </div>
                  )}
                </div>

                {competitorAnalysis ? (
                  <div className="bg-white rounded-[48px] p-10 border border-[#E8E4E1]/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#E8E4E1]/50">
                            <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.competitorKeywordLabel')}</th>
                            <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.relevance')}</th>
                            <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.competition')}</th>
                            <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.trend')}</th>
                            <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] px-4">{t('keywords.actionLabel')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E4E1]/30">
                          {competitorAnalysis.keywords.map((item, i) => (
                            <tr key={i} className="group hover:bg-[#FDFCFB] transition-colors">
                              <td className="py-6 px-4 font-medium text-[#1A1A1A]">{item.keyword}</td>
                              <td className="py-6 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-24 h-2 bg-[#E8E4E1] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#5A5A40]" 
                                      style={{ width: `${item.relevance}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-[#5A5A40]">{item.relevance}%</span>
                                </div>
                              </td>
                              <td className="py-6 px-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                  ${item.competition === 'Low' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    item.competition === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-red-50 text-red-600 border border-red-100'}`}
                                >
                                  {item.competition === 'Low' ? t('metrics.low') : item.competition === 'Medium' ? t('metrics.medium') : t('metrics.high')}
                                </span>
                              </td>
                              <td className="py-6 px-4">
                                <div className="flex items-center gap-2">
                                  {item.trend === 'Rising' ? (
                                    <TrendingUp size={14} className="text-emerald-500" />
                                  ) : item.trend === 'Falling' ? (
                                    <TrendingUp size={14} className="text-red-500 rotate-180" />
                                  ) : (
                                    <Activity size={14} className="text-amber-500" />
                                  )}
                                  <span className="text-xs font-medium text-[#595959]">{item.trend === 'Rising' ? t('metrics.rising') : item.trend === 'Falling' ? t('metrics.falling') : t('metrics.stable')}</span>
                                </div>
                              </td>
                              <td className="py-6 px-4">
                                <button 
                                  onClick={() => copyToClipboard(item.keyword, `comp-kw-res-${i}`)}
                                  className="p-2 hover:bg-white rounded-xl shadow-sm border border-[#E8E4E1]/50 transition-all active:scale-90"
                                >
                                  {copiedSection === `comp-kw-res-${i}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-[#8E8E8E]" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FDFCFB] border border-dashed border-[#E8E4E1] rounded-[48px] p-20 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-[#E8E4E1]/50 flex items-center justify-center mx-auto mb-8 text-[#8E8E8E]">
                      <Search size={32} />
                    </div>
                    <h4 className="text-xl font-bold mb-4">{t('keywords.noCompetitor')}</h4>
                    <button 
                      onClick={() => setCurrentPage('competitor')}
                      className="px-8 py-4 bg-[#F1641E] text-white rounded-full font-bold hover:bg-[#D95319] transition-all shadow-lg shadow-[#F1641E]/20"
                    >
                      {t('keywords.goToCompetitor')}
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center pt-8">
                <button 
                  onClick={() => {
                    setKeywordInput('');
                    setKeywordResult(null);
                  }}
                  className="px-8 py-4 bg-[#FDFCFB] border border-[#E8E4E1] rounded-full text-sm font-bold hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm"
                >
                  {t('keywords.newResearch')}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.main>
    ) : currentPage === 'tips' ? (
      <motion.main 
        key="tips"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto px-6 py-16 relative"
      >
        <div className="mb-16">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-sm font-bold text-[#F1641E] mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft size={16} /> {t('nav.generator')}
          </button>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-serif">
            {t('tips.title')}
          </h2>
          <p className="text-xl text-[#595959] max-w-2xl leading-relaxed">
            {t('tips.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tip 1: Keywords */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">{t('tips.cards.titles.title')}</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              {t('tips.cards.titles.desc')}
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">{t('tips.proTip')}</p>
              <p className="text-xs text-[#1A1A1A] mt-2">{t('tips.cards.titles.tip')}</p>
            </div>
          </div>

          {/* Tip 2: Long-Tail */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Tag size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">{t('tips.cards.longtail.title')}</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              {t('tips.cards.longtail.desc')}
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">{t('tips.proTip')}</p>
              <p className="text-xs text-[#1A1A1A] mt-2">{t('tips.cards.longtail.tip')}</p>
            </div>
          </div>

          {/* Tip 3: Visual SEO */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">{t('tips.cards.visual.title')}</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              {t('tips.cards.visual.desc')}
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">{t('tips.proTip')}</p>
              <p className="text-xs text-[#1A1A1A] mt-2">{t('tips.cards.visual.tip')}</p>
            </div>
          </div>

          {/* Tip 4: Shop Health */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Star size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">{t('tips.cards.experience.title')}</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              {t('tips.cards.experience.desc')}
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">{t('tips.proTip')}</p>
              <p className="text-xs text-[#1A1A1A] mt-2">{t('tips.cards.experience.tip')}</p>
            </div>
          </div>

          {/* Tip 5: Shipping */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">{t('tips.cards.shipping.title')}</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              {t('tips.cards.shipping.desc')}
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">{t('tips.proTip')}</p>
              <p className="text-xs text-[#1A1A1A] mt-2">{t('tips.cards.shipping.tip')}</p>
            </div>
          </div>

          {/* Tip 6: Attributes */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">{t('tips.cards.attributes.title')}</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              {t('tips.cards.attributes.desc')}
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">{t('tips.proTip')}</p>
              <p className="text-xs text-[#1A1A1A] mt-2">{t('tips.cards.attributes.tip')}</p>
            </div>
          </div>
        </div>

        <div className="mt-24 p-12 bg-[#5A5A40] rounded-[48px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-3xl">
            <BookOpen className="text-[#F1641E] mb-6" size={40} />
            <h3 className="text-4xl font-bold mb-6 font-serif italic">{t('tips.handbookTitle')}</h3>
            <p className="text-lg opacity-90 leading-relaxed mb-8">
              {t('tips.handbookDesc')}
            </p>
            <a 
              href="https://www.etsy.com/seller-handbook" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#F1641E] text-white rounded-full font-bold hover:bg-[#d95a1b] transition-all shadow-xl shadow-black/20"
            >
              {t('tips.handbookButton')} <RefreshCw size={18} />
            </a>
          </div>
        </div>
      </motion.main>
    ) : (
      <motion.main
        key="upgrade"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto px-6 py-24"
      >
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-[#F1641E]/5 rounded-full text-[#F1641E] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-[#F1641E]/10"
          >
            {t('nav.upgrade')}
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-serif">{t('pricing.title')}</h2>
          <p className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[48px] p-12 border border-[#E8E4E1]/60 shadow-sm flex flex-col relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8E4E1]/5 rounded-bl-full group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-2 font-serif">{t('pricing.free.name')}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold">${t('pricing.free.price')}</span>
              <span className="text-[#8E8E8E] text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {(t('pricing.free.features') as string[]).map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[#595959]">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setCurrentPage('home')}
              className="w-full py-4 rounded-2xl border border-[#E8E4E1] font-bold text-sm hover:bg-[#FDFCFB] transition-all"
            >
              {t('pricing.cta')}
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-[#1A1A1A] rounded-[48px] p-12 shadow-2xl flex flex-col relative overflow-hidden group border border-[#F1641E]/20"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F1641E]/10 rounded-bl-full group-hover:scale-110 transition-transform" />
            <div className="absolute top-8 right-8 px-3 py-1 bg-[#F1641E] text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2 font-serif text-white">{t('pricing.pro.name')}</h3>
            <div className="flex items-baseline gap-1 mb-8 text-white">
              <span className="text-4xl font-bold">${t('pricing.pro.price')}</span>
              <span className="text-white/50 text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {(t('pricing.pro.features') as string[]).map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <Check size={16} className="text-[#F1641E] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 bg-[#F1641E] text-white rounded-2xl font-bold text-sm hover:bg-[#d95a1b] transition-all shadow-lg shadow-[#F1641E]/20">
              {t('pricing.cta')}
            </button>
          </motion.div>

          {/* Business Plan */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[48px] p-12 border border-[#E8E4E1]/60 shadow-sm flex flex-col relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A5A40]/5 rounded-bl-full group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-2 font-serif">{t('pricing.business.name')}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold">${t('pricing.business.price')}</span>
              <span className="text-[#8E8E8E] text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {(t('pricing.business.features') as string[]).map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[#595959]">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-2xl border border-[#E8E4E1] font-bold text-sm hover:bg-[#FDFCFB] transition-all">
              {t('pricing.cta')}
            </button>
          </motion.div>
        </div>

        <div className="mt-24 text-center">
          <p className="text-sm text-[#8E8E8E] mb-6">Trusted by over 10,000+ Etsy sellers worldwide.</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <div className="text-2xl font-bold font-serif italic">Artisan</div>
            <div className="text-2xl font-bold font-serif italic">Crafted</div>
            <div className="text-2xl font-bold font-serif italic">Maker</div>
            <div className="text-2xl font-bold font-serif italic">Studio</div>
          </div>
        </div>
      </motion.main>
    )}
    </AnimatePresence>

    {/* Upgrade / Login Modal */}
    <AnimatePresence>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpgradeModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F1641E]/5 rounded-bl-full" />
            
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-6 right-6 p-2 text-[#8E8E8E] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#FFF9F6] rounded-3xl flex items-center justify-center text-[#F1641E] mx-auto mb-6 shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-3">{t('common.loginTitle')}</h3>
              <p className="text-sm text-[#595959] leading-relaxed">{t('common.loginSubtitle')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] mb-2 ml-1">
                  {t('common.username')}
                </label>
                <input 
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-6 py-4 bg-[#FDFCFB] border border-[#E8E4E1] rounded-2xl text-sm focus:border-[#F1641E] focus:ring-1 focus:ring-[#F1641E] transition-all"
                  placeholder="Admin"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] mb-2 ml-1">
                  {t('common.password')}
                </label>
                <input 
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-6 py-4 bg-[#FDFCFB] border border-[#E8E4E1] rounded-2xl text-sm focus:border-[#F1641E] focus:ring-1 focus:ring-[#F1641E] transition-all"
                  placeholder="••••"
                />
              </div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle size={14} />
                  {t('common.invalid')}
                </motion.div>
              )}

              <button 
                type="submit"
                className="w-full py-5 bg-[#222222] text-white rounded-2xl font-bold text-lg hover:bg-[#1A1A1A] shadow-xl transition-all active:scale-95"
              >
                {t('common.login')}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#E8E4E1]/50 text-center">
              <p className="text-[11px] text-[#8E8E8E] mb-4">{t('common.upgradeSubtitle')}</p>
              <button 
                onClick={() => { setShowUpgradeModal(false); setCurrentPage('upgrade'); }}
                className="text-[11px] font-bold uppercase tracking-widest text-[#F1641E] hover:underline"
              >
                {t('common.upgrade')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-6 py-24 border-t border-[#E8E4E1]/50 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FDFCFB] px-10">
          <div className="w-12 h-12 bg-white border border-[#E8E4E1] rounded-2xl flex items-center justify-center text-[#F1641E] shadow-sm">
            <Sparkles size={24} />
          </div>
        </div>
        <p className="text-[10px] text-[#8E8E8E] font-bold tracking-[0.4em] uppercase mb-6">
          {t('footer.tagline')}
        </p>
        <p className="text-sm text-[#595959] font-serif italic max-w-sm mx-auto leading-relaxed">
          {t('footer.description')}
        </p>
      </footer>
    </div>
  );
}
