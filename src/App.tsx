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
  LayoutGrid
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
}

interface AuditResult {
  score: number;
  titleAnalysis: { score: number; feedback: string; suggestion: string; recommendation: string };
  descriptionAnalysis: { score: number; feedback: string; suggestion: string; recommendation: string };
  tagsAnalysis: { score: number; feedback: string; suggestion: string; recommendation: string[] };
  imagesAnalysis: { score: number; feedback: string; suggestion: string };
  overallFeedback: string;
}

const HealthScoreCard = ({ listing }: { listing: ListingData }) => {
  const calculateScore = () => {
    let score = 0;
    const hasDuplicateWords = (text: string) => {
      const words = text.toLowerCase().replace(/[,|]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      const uniqueWords = new Set(words);
      return words.length !== uniqueWords.size;
    };

    const checks = [
      { 
        label: 'Title Length', 
        value: listing.title.length >= 40 && listing.title.length <= 120,
        points: 15,
        tip: 'Etsy suggests concise titles (40-120 characters) that get straight to the point.'
      },
      {
        label: 'No Duplicate Words',
        value: !hasDuplicateWords(listing.title),
        points: 10,
        tip: 'Avoid repeating words in your title to keep it clean and professional.'
      },
      { 
        label: '13 SEO Tags', 
        value: listing.tags.length === 13,
        points: 15,
        tip: 'Using all 13 tags maximizes your reach in Etsy search.'
      },
      { 
        label: 'Detailed Description', 
        value: listing.description.length > 500,
        points: 15,
        tip: 'Longer descriptions help with both SEO and buyer confidence.'
      },
      { 
        label: 'Accessibility (Alt Text)', 
        value: !!listing.altText,
        points: 15,
        tip: 'Alt text makes your shop accessible and helps with Google Image Search.'
      },
      { 
        label: 'Category Suggestions', 
        value: listing.categorySuggestions.length >= 2,
        points: 10,
        tip: 'Accurate categories help buyers find your items through browsing.'
      },
      { 
        label: 'Material List', 
        value: listing.materials.length >= 3,
        points: 10,
        tip: 'Listing materials builds trust and helps with specific searches.'
      },
      { 
        label: 'Social Ready', 
        value: !!listing.instagramCaption && listing.instagramHashtags.length >= 5,
        points: 10,
        tip: 'Social signals drive external traffic, which Etsy rewards.'
      }
    ];

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
              <h3 className="text-xl font-bold font-serif italic">Listing Health Score</h3>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#F1641E]">SEO Audit Report</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold font-serif text-[#F1641E]">{score}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold">out of 100</div>
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
              {score >= 90 ? 'Excellent! Your listing is ready for the spotlight.' : 
               score >= 70 ? 'Good start. A few more tweaks for perfection.' : 
               'Needs attention. Follow the tips above to improve visibility.'}
            </span>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E] hover:underline">
            Full Audit Details
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
  const [currentPage, setCurrentPage] = useState<'home' | 'tips' | 'audit'>('home');
  const [image, setImage] = useState<string | null>(null);
  const [mockups, setMockups] = useState<string[]>([]);
  const [productContext, setProductContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditUrl, setAuditUrl] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [activeTab, setActiveTab] = useState<'listing' | 'social' | 'pinterest' | 'attributes' | 'seo'>('listing');
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mockupInputRef = useRef<HTMLInputElement>(null);

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
        
        ${productContext ? `ADDITIONAL PRODUCT CONTEXT PROVIDED BY USER: "${productContext}"` : ""}

        Follow these Etsy SEO best practices:
        1. Title: Max 140 characters, but aim for a concise and impactful length (around 70-120 characters). Put the most important keywords at the beginning. Use phrases that buyers actually search for. IMPORTANT: Do not repeat words in the title (no doubling up). Do not worry about IP infringement or Copyright; always use what you think is the best search term for the item uploaded, regardless of potential IP or Copyright concerns.
        2. Description: Engaging, informative, and structured. The first 160 characters should be a compelling summary for search engines. Include sections for features, dimensions (if applicable), and care instructions.
        3. Tags: Exactly 13 tags. Each tag must be under 20 characters. Use multi-word phrases (long-tail keywords). Again, do not worry about IP or Copyright; use the most effective search terms.
        4. Main Alt Text: Descriptive text for screen readers for the main product image that also includes relevant keywords.
        5. Mockup Alt Texts: Generate a descriptive Alt text for EACH of the provided mockup images. These should describe the setting/context of the mockup while highlighting the product.
        6. Instagram Caption: Write an engaging, personality-filled Instagram caption to promote this product. Use emojis and a clear call to action.
        7. Instagram Hashtags: Provide exactly 5 highly relevant hashtags for Instagram (as per current best practices).
        8. Pinterest Pin: Generate a high-performing Pinterest Pin Title (max 100 chars) and Description (max 500 chars). Focus on keywords that people search for on Pinterest (e.g., "Gift ideas for...", "DIY...", "Home decor...").
        9. Categories: Suggest 2-3 relevant Etsy categories.
        10. Materials: List likely materials used in the product.
        11. Attributes: Suggest 5-8 relevant Etsy attributes (e.g., Primary Color, Secondary Color, Occasion, Recipient, Style, Room, Holiday). These are the specific dropdown options Etsy sellers fill out to help with search filters.

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
          "attributes": [{"label": "string", "value": "string"}]
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
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] font-serif">Etsy SEO Pro</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#F1641E]">Artisanal Intelligence</p>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-[#595959]">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`transition-colors relative group ${currentPage === 'home' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              Generator
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => setCurrentPage('tips')}
              className={`transition-colors relative group ${currentPage === 'tips' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              SEO Tips
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'tips' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button 
              onClick={() => setCurrentPage('audit')}
              className={`transition-colors relative group ${currentPage === 'audit' ? 'text-[#F1641E]' : 'hover:text-[#F1641E]'}`}
            >
              Listing Audit
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F1641E] transition-all ${currentPage === 'audit' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
            <button className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-[#333333] transition-all shadow-lg shadow-black/5 active:scale-95">
              Upgrade
            </button>
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
            The Ultimate Maker's Toolkit
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight font-serif"
          >
            Crafted for <span className="italic text-[#F1641E]">Visibility</span>. <br />
            Built for <span className="underline decoration-[#5A5A40]/30 underline-offset-[12px]">Success</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed"
          >
            Transform your artisanal creations into high-performing Etsy listings with 
            AI-powered SEO, accessibility, and social-ready content.
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
                The Showcase
              </h2>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative aspect-[4/5] rounded-[40px] border-2 border-dashed transition-all duration-700 cursor-pointer flex items-center justify-center overflow-hidden
                  ${image ? 'border-transparent shadow-2xl' : 'border-[#E8E4E1] hover:border-[#F1641E] hover:bg-[#FFF9F6]'}`}
              >
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
                    <p className="font-bold text-xl text-[#1A1A1A] font-serif">Drop your masterpiece</p>
                    <p className="text-sm text-[#8E8E8E] mt-3">High-res photos sell 3x faster</p>
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
                    <ImageIcon size={14} /> Mockup Gallery
                  </h3>
                  <button 
                    onClick={() => mockupInputRef.current?.click()}
                    className="px-4 py-2 bg-[#FDFCFB] border border-[#E8E4E1] rounded-full text-[10px] font-sans font-bold text-[#222222] hover:bg-[#F1641E] hover:text-white hover:border-[#F1641E] transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={12} /> Add More
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
                        <img src={m} alt={`Mockup ${idx}`} className="w-full h-full object-cover" />
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
                  <MessageSquare size={14} /> Product Context (Optional)
                  <Tooltip content="If the product is vague or unique, tell us what it is (e.g., 'Hand-poured soy candle with lavender scent') to help the AI generate more accurate keywords." />
                </h3>
                <textarea
                  value={productContext}
                  onChange={(e) => setProductContext(e.target.value)}
                  placeholder="Describe your product briefly to help the AI..."
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
                    Weaving SEO Magic...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-[#F1641E]" />
                    Generate Listing
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
              <h3 className="text-3xl font-bold mb-8 font-serif italic">The Maker's Guide</h3>
              <ul className="space-y-8 text-sm opacity-90 leading-relaxed">
                <li className="flex gap-5">
                  <div className="w-8 h-8 rounded-xl bg-[#F1641E] flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-[#F1641E]/20">1</div>
                  <p>Lead with your <span className="font-bold text-white underline decoration-white/30 underline-offset-4">hook</span>. Buyers scan the first 3 words of your title first.</p>
                </li>
                <li className="flex gap-5">
                  <div className="w-8 h-8 rounded-xl bg-[#F1641E] flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-[#F1641E]/20">2</div>
                  <p>Use <span className="font-bold text-white underline decoration-white/30 underline-offset-4">Long-Tail Keywords</span>. Specificity beats generic terms every time.</p>
                </li>
                <li className="flex gap-5">
                  <div className="w-8 h-8 rounded-xl bg-[#F1641E] flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-[#F1641E]/20">3</div>
                  <p>Alt text is your <span className="font-bold text-white underline decoration-white/30 underline-offset-4">secret weapon</span> for Google Image Search visibility.</p>
                </li>
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
                  <h3 className="text-3xl font-bold mb-4">Ready for the spotlight?</h3>
                  <p className="text-[#595959] font-sans max-w-sm mx-auto leading-relaxed">
                    Upload your product photos and we'll generate a professional, 
                    SEO-optimized listing in seconds.
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
                  <HealthScoreCard listing={listing} />

                  {/* Tabs Navigation */}
                    <div className="flex p-2 bg-white/50 backdrop-blur-sm border border-[#E8E4E1] rounded-[32px] mb-8 sticky top-4 z-20 shadow-sm">
                      {[
                        { id: 'listing', label: 'Listing', icon: FileText },
                        { id: 'social', label: 'Social', icon: ImageIcon },
                        { id: 'pinterest', label: 'Pinterest', icon: Pin },
                        { id: 'attributes', label: 'Attributes', icon: LayoutGrid },
                        { id: 'seo', label: 'SEO & Details', icon: Accessibility }
                      ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] text-[11px] font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden
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
                        <tab.icon size={14} className="relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
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
                              Attribute Suggestion Engine
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
                              Copy All Attributes
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
                      <div className="bg-[#FDFCFB] p-8 rounded-3xl border border-[#E8E4E1]/40 group relative shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Main Showcase</span>
                          <button 
                            onClick={() => copyToClipboard(listing?.altText || '', 'alt')}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 hover:bg-white rounded-xl shadow-md border border-[#E8E4E1]/30"
                          >
                            {copiedSection === 'alt' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-sm italic text-[#444444] leading-relaxed font-serif">"{listing?.altText}"</p>
                      </div>
                      
                      {listing?.mockupAltTexts && listing.mockupAltTexts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {listing.mockupAltTexts.map((alt, idx) => (
                            <div key={idx} className="group relative bg-[#FDFCFB] p-6 rounded-3xl border border-[#E8E4E1]/40 hover:border-[#F1641E]/30 transition-all shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E8E]">Mockup {idx + 1}</span>
                                <button 
                                  onClick={() => copyToClipboard(alt, `mockup-alt-${idx}`)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-xl shadow-md border border-[#E8E4E1]/30"
                                >
                                  {copiedSection === `mockup-alt-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                </button>
                              </div>
                              <p className="text-xs italic text-[#595959] leading-relaxed font-serif">"{alt}"</p>
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
                        Material List
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
            Listing Audit Engine
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-serif">
            Audit Your <span className="italic text-[#F1641E]">Existing</span> Listings
          </h2>
          <p className="text-xl text-[#595959] max-w-2xl mx-auto leading-relaxed">
            Paste your Etsy listing URL below and our AI will analyze it against the 
            Seller Handbook best practices to give you a score and actionable improvements.
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
                  placeholder="https://www.etsy.com/listing/..."
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
                    Auditing...
                  </>
                ) : (
                  <>
                    <Activity size={20} className="text-[#F1641E]" />
                    Analyze Listing
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
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Score</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-4 font-serif italic">Audit Summary</h3>
                    <p className="text-lg opacity-90 leading-relaxed italic">
                      "{auditResult.overallFeedback}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 gap-8">
                {[
                  { title: 'Title Optimization', data: auditResult.titleAnalysis, icon: Type },
                  { title: 'Description & Engagement', data: auditResult.descriptionAnalysis, icon: FileText },
                  { title: 'Tag Strategy', data: auditResult.tagsAnalysis, icon: Tag },
                  { title: 'Visual Presentation', data: auditResult.imagesAnalysis, icon: ImageIcon }
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
                        Score: <span className={section.data.score >= 80 ? 'text-emerald-600' : section.data.score >= 50 ? 'text-amber-500' : 'text-red-500'}>
                          {section.data.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E8E] mb-4">Analysis</h5>
                        <p className="text-[#595959] leading-relaxed text-[15px]">{section.data.feedback}</p>
                      </div>
                      <div className="bg-[#FFF9F6] p-8 rounded-3xl border border-[#F1641E]/5">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F1641E] mb-4">Recommended Change</h5>
                        <p className="text-[#1A1A1A] font-medium leading-relaxed text-[15px] italic">"{section.data.suggestion}"</p>
                      </div>
                    </div>

                    {/* Full Recommendation Section */}
                    {section.data.recommendation && (
                      <div className="mt-10 pt-10 border-t border-[#E8E4E1]/40">
                        <div className="flex items-center justify-between mb-6">
                          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">Full Optimized {section.title.split(' ')[0]}</h5>
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
                            Copy Optimized {section.title.split(' ')[0]}
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
                  Audit Another Listing
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.main>
    ) : (
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
            <ArrowLeft size={16} /> Back to Generator
          </button>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-serif">
            The <span className="italic text-[#F1641E]">Etsy Seller</span> Handbook <br />
            SEO Masterclass
          </h2>
          <p className="text-xl text-[#595959] max-w-2xl leading-relaxed">
            Mastering Etsy search is about understanding how the algorithm connects 
            buyers to your unique creations. Here are the core pillars of success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tip 1: Keywords */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Concise Titles</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              Etsy now favors shorter, more impactful titles (70-120 chars). Avoid repeating words—it doesn't help SEO and can look like spam.
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">Pro Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-2">Put your most descriptive keywords at the very beginning and don't double up on words.</p>
            </div>
          </div>

          {/* Tip 2: Long-Tail */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Tag size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Long-Tail Strategy</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              Generic terms like "mug" are too competitive. Use specific phrases like 
              "handmade blue ceramic mug" to reach buyers ready to purchase.
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">Pro Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-2">Use all 13 tags. Every empty tag is a missed opportunity for visibility.</p>
            </div>
          </div>

          {/* Tip 3: Visual SEO */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Visual SEO</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              Alt text isn't just for accessibility—it helps your products appear in 
              Google Image Search, driving external traffic to your shop.
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">Pro Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-2">Describe the product and its context (e.g., "Ceramic mug on a rustic wooden table").</p>
            </div>
          </div>

          {/* Tip 4: Shop Health */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Star size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Customer Experience</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              Great reviews and a completed "About" section signal to Etsy that your 
              shop is trustworthy, which can boost your search ranking.
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">Pro Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-2">Respond to messages quickly and encourage buyers to leave photo reviews.</p>
            </div>
          </div>

          {/* Tip 5: Shipping */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Shipping Impact</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              Etsy prioritizes shops that offer free shipping or competitive rates. 
              Fast processing times also play a role in search placement.
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">Pro Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-2">Consider building shipping costs into your item price to offer "Free Shipping".</p>
            </div>
          </div>

          {/* Tip 6: Attributes */}
          <div className="bg-white rounded-[40px] p-10 border border-[#E8E4E1]/60 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9F6] flex items-center justify-center text-[#F1641E] mb-8 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Complete Attributes</h3>
            <p className="text-[#595959] text-sm leading-relaxed mb-6">
              Attributes act like extra tags. Filling out color, material, and occasion 
              helps you appear in specific filtered searches.
            </p>
            <div className="pt-6 border-t border-[#E8E4E1]/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F1641E]">Pro Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-2">Always select the most specific category possible for your item.</p>
            </div>
          </div>
        </div>

        <div className="mt-24 p-12 bg-[#5A5A40] rounded-[48px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-3xl">
            <BookOpen className="text-[#F1641E] mb-6" size={40} />
            <h3 className="text-4xl font-bold mb-6 font-serif italic">Deep Dive into the Handbook</h3>
            <p className="text-lg opacity-90 leading-relaxed mb-8">
              The Etsy Seller Handbook is the ultimate resource for growing your business. 
              We've integrated its core principles into our AI engine, but reading the 
              full guides can provide even deeper insights into market trends.
            </p>
            <a 
              href="https://www.etsy.com/seller-handbook" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#F1641E] text-white rounded-full font-bold hover:bg-[#d95a1b] transition-all shadow-xl shadow-black/20"
            >
              Read the Handbook <RefreshCw size={18} />
            </a>
          </div>
        </div>
      </motion.main>
    )}
    </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-6 py-24 border-t border-[#E8E4E1]/50 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FDFCFB] px-10">
          <div className="w-12 h-12 bg-white border border-[#E8E4E1] rounded-2xl flex items-center justify-center text-[#F1641E] shadow-sm">
            <Sparkles size={24} />
          </div>
        </div>
        <p className="text-[10px] text-[#8E8E8E] font-bold tracking-[0.4em] uppercase mb-6">
          Etsy SEO Pro • Artisanal Intelligence
        </p>
        <p className="text-sm text-[#595959] font-serif italic max-w-sm mx-auto leading-relaxed">
          Empowering independent makers to find their audience and thrive in the digital marketplace.
        </p>
      </footer>
    </div>
  );
}
