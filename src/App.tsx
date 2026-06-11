import React, { useState, useEffect } from 'react';
import { 
  Heart, Keyboard, BookOpen, AlertCircle, RefreshCw, 
  Sparkles, MonitorPlay, ExternalLink, Flame, Info, ChevronRight, ChevronLeft, Check, CheckCircle2,
  Pin, Lock, LogOut, Sliders, Activity, Users, Eye, Tv, Search, Settings, ArrowLeft, ShieldCheck, BarChart3, Globe, ListFilter, Share2,
  Wallet, HeartHandshake, Plus, Trash2, Save, Coffee, Upload, Image as ImageIcon
} from 'lucide-react';
import { Channel, AdConfig, SupportConfig, EsewaKhaltiAccount, BankAccount, CryptoWallet } from './types';
import { curatedChannels } from './data/curatedChannels';
import { parseM3U } from './utils/m3uParser';
import VideoPlayer from './components/VideoPlayer';
import ChannelList from './components/ChannelList';
import SupportModal from './components/SupportModal';

const defaultAdConfig: AdConfig = {
  enabled: true,
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-neon-animation-of-a-play-button-41838-large.mp4",
  duration: 8,
  skipAfter: 4,
  bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85",
  bannerLink: "https://github.com/udayaraj35/iptv",
  bannerTitle: "NepalIPTV Premium Promotion",
  bannerText: "Explore premium server hosting, dedicated playlist cloud storage, and super stable CDN pipes.",
  ads: [
    {
      id: "ad_1",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-neon-animation-of-a-play-button-41838-large.mp4",
      duration: 8,
      skipAfter: 4,
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85",
      bannerLink: "https://github.com/udayaraj35/iptv",
      bannerTitle: "NepalIPTV Premium Promo",
      bannerText: "नेपालकै सबैभन्दा तीव्र गति र बफर-रहित नेपाली च्यानल प्याकेजहरू!"
    },
    {
      id: "ad_2",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
      duration: 10,
      skipAfter: 5,
      bannerUrl: "https://images.unsplash.com/photo-1544306094-e2dcf94b2dae?w=800&auto=format&fit=crop&q=85",
      bannerLink: "https://github.com/udayaraj35/iptv",
      bannerTitle: "Everest High-Speed Hosting",
      bannerText: "स्पोन्सर: क्लाउड प्लेलिस्ट स्टोरेज र २४/७ स्थिर स्ट्रिमिङ सेवा!"
    },
    {
      id: "ad_3",
      videoUrl: "",
      duration: 5,
      skipAfter: 2,
      bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=85",
      bannerLink: "https://github.com/udayaraj35/iptv",
      bannerTitle: "Global IPTV Ultra CDN",
      bannerText: "अब विश्वको जुनसुकै स्थानबाट बिना लोड ब्यालेन्स खेलकुद च्यानलहरू हेर्नुहोस्।"
    }
  ]
};

const defaultSupportConfig: SupportConfig = {
  enabled: true,
  title: "Support NepalIPTV (सहयोग र डोनेशन)",
  description: "हाम्रो सेवालाई सधैं निःशुल्क र सुचारु राख्नको लागि तपाईंको सानो सहयोग बहुमूल्य हुनेछ। (Your support helps keep our service free and uninterrupted.)",
  paypalUrl: "https://paypal.me/udayarajkhanal",
  coffeeUrl: "https://buymeacoffee.com/udayaraj",
  esewaNumber: "9861612345",
  esewaName: "Udaya Raj Khanal",
  esewaQr: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=80",
  khaltiNumber: "9861612345",
  khaltiName: "Udaya Raj Khanal",
  khaltiQr: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
  ipsBankName: "NIC Asia Bank",
  ipsBranch: "Kumaripati Branch",
  ipsAccountNo: "1234567890123",
  ipsAccountName: "Udaya Raj Khanal",
  ipsQr: "",
  usdtAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  usdcAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  btcAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  ethAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  solAddress: "HN7cABvi3M8H0F1y9S1Z9b88M9tXz8yW8m8U1Pz7w",
  cryptoQr: "",
  esewaKhaltiList: [
    { id: "esewa-1", type: "esewa", number: "9861612345", name: "Udaya Raj Khanal", qr: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=80" },
    { id: "khalti-1", type: "khalti", number: "9861612345", name: "Udaya Raj Khanal", qr: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80" }
  ],
  ipsBankList: [
    { id: "ips-1", bankName: "NIC Asia Bank", branch: "Kumaripati Branch", accountNo: "1234567890123", accountName: "Udaya Raj Khanal" }
  ],
  cryptoList: [
    { id: "crypto-1", coin: "USDT", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    { id: "crypto-2", coin: "BTC", address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" }
  ]
};

function highlightText(text: string, search: string) {
  if (!text) return <span></span>;
  if (!search || !search.trim()) return <span>{text}</span>;

  // Safely escape special RegExp characters to prevent breaking on user punctuation input
  const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-amber-955 font-extrabold px-0.5 rounded border border-amber-300 shadow-xs">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

interface PaymentQrSelectorProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  idGroup: string;
}

function PaymentQrSelector({ value, onChange, label, placeholder }: PaymentQrSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorLine, setErrorLine] = useState('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorLine('क्रिकेट वा अन्य फाइल मान्य छैन (Only image files allowed)!');
      return;
    }
    setErrorLine('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Url = canvas.toDataURL('image/jpeg', 0.85);
          onChange(base64Url);
        } else {
          onChange(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-wide block">
          {label || 'QR Code Link / Image'}
        </label>
        {value && (
          <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black font-mono uppercase tracking-wider">
            QR Active
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`col-span-1 md:col-span-9 rounded-xl border border-dashed p-3 flex flex-col justify-center transition ${
            isDragging 
              ? 'border-red-500 bg-red-50/20' 
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/20'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full text-center md:text-left">
              <label className="group flex flex-col md:flex-row items-center gap-2 cursor-pointer text-slate-500 hover:text-red-655 transition">
                <div className="w-8 h-8 rounded-lg bg-white shadow-3xs border border-slate-200 flex items-center justify-center text-slate-450 group-hover:bg-red-50 group-hover:text-red-655 transition flex-shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-700 block group-hover:underline">Upload QR File / ड्र्याग-ड्रप</span>
                  <span className="text-[8.5px] text-slate-400 font-mono block">JPEG, PNG, WEBP (Autocompressed)</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <div className="hidden md:flex items-center text-slate-300 font-bold font-mono text-[8.5px] px-1.5 py-0.5 bg-white rounded border border-slate-100 shadow-3xs">
              OR
            </div>
            
            <div className="w-full md:w-1/2">
              <input
                type="text"
                value={value.startsWith('data:') ? 'Stored Image (Base64 URL)' : value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Stored Image (Base64 URL)') return;
                  onChange(val);
                }}
                className="w-full text-[10px] font-mono bg-white border border-slate-200 rounded-lg p-2 text-slate-650 focus:ring-1 focus:ring-red-500 placeholder-slate-400"
                placeholder={placeholder || "https://example.com/qr.jpg"}
              />
            </div>
          </div>
          {errorLine && (
            <div className="text-[9.5px] text-red-500 font-black mt-1 uppercase font-mono">{errorLine}</div>
          )}
        </div>

        <div className="col-span-1 md:col-span-3 border border-slate-200 rounded-xl bg-white p-2 flex flex-col items-center justify-center gap-1.5 min-h-[75px] group relative shadow-3xs">
          {value ? (
            <>
              <div className="relative w-12 h-12 rounded border border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50">
                <img 
                  src={value} 
                  alt="QR Preview" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&q=80";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[8.5px] font-black uppercase text-red-655 bg-red-50 hover:bg-red-100 px-2.5 py-0.5 rounded border border-red-200 transition duration-150 cursor-pointer"
              >
                Clear QR
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-slate-105 flex items-center justify-center text-slate-450 mx-auto">
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[8.5px] text-slate-450 font-bold block mt-1 leading-none">No QR</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DonationRotator({ supportConfig }: { supportConfig: SupportConfig }) {
  const [activeMethod, setActiveMethod] = useState<number>(0);

  // Parse accounts with lists fallback
  const esewaKhalti = supportConfig.esewaKhaltiList || [];
  const ipsBanks = supportConfig.ipsBankList || [];
  const cryptos = supportConfig.cryptoList || [];

  // Flatten them into individual slides
  interface Slide {
    id: string;
    name: string;
    color: string;
    activeColor: string;
    qr?: string;
    details: { label: string; value: string }[];
  }

  const slides: Slide[] = [];

  // 1. Add eSewa & Khalti List
  if (esewaKhalti.length > 0) {
    esewaKhalti.forEach((item, index) => {
      slides.push({
        id: `ek-${item.id}-${index}`,
        name: item.type === "esewa" ? `eSewa (A/C ${index + 1}: ${item.name})` : `Khalti (A/C ${index + 1}: ${item.name})`,
        color: item.type === "esewa" 
          ? "border-emerald-300 text-emerald-800 bg-emerald-50" 
          : "border-indigo-300 text-indigo-805 bg-indigo-50",
        activeColor: item.type === "esewa"
          ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 border-2"
          : "border-indigo-500 bg-indigo-50/70 text-indigo-900 border-2",
        qr: item.qr,
        details: [
          { label: `${item.type === "esewa" ? "eSewa ID / Phone" : "Khalti ID / Phone"}`, value: item.number },
          { label: "Account Name", value: item.name },
        ].filter(d => d.value && d.value.trim() !== ""),
      });
    });
  } else {
    // Legacy single accounts
    if (supportConfig.esewaNumber) {
      slides.push({
        id: "esewa-legacy",
        name: "eSewa (Legacy)",
        color: "border-emerald-300 text-emerald-800 bg-emerald-50",
        activeColor: "border-emerald-500 bg-emerald-50/70 text-emerald-900 border-2",
        qr: supportConfig.esewaQr,
        details: [
          { label: "Phone Number / eSewa ID", value: supportConfig.esewaNumber },
          { label: "Account Holder Name", value: supportConfig.esewaName }
        ]
      });
    }
    if (supportConfig.khaltiNumber) {
      slides.push({
        id: "khalti-legacy",
        name: "Khalti (Legacy)",
        color: "border-indigo-300 text-indigo-805 bg-indigo-50",
        activeColor: "border-indigo-500 bg-indigo-50/70 text-indigo-900 border-2",
        qr: supportConfig.khaltiQr,
        details: [
          { label: "Phone Number / Khalti ID", value: supportConfig.khaltiNumber },
          { label: "Account Holder Name", value: supportConfig.khaltiName }
        ]
      });
    }
  }

  // 2. Add Bank (IPS)
  if (ipsBanks.length > 0) {
    ipsBanks.forEach((item, index) => {
      slides.push({
        id: `ips-${item.id}-${index}`,
        name: `${item.bankName}`,
        color: "border-blue-300 text-blue-805 bg-blue-50/70",
        activeColor: "border-blue-500 bg-blue-50/70 text-blue-900 border-2",
        qr: item.qr,
        details: [
          { label: "Bank Name", value: item.bankName },
          item.branch ? { label: "Branch", value: item.branch } : null,
          { label: "Account Number", value: item.accountNo },
          { label: "Account Holder", value: item.accountName },
        ].filter((d): d is { label: string; value: string } => !!d && !!d.value && d.value.trim() !== ""),
      });
    });
  } else {
    if (supportConfig.ipsBankName) {
      slides.push({
        id: "ips-legacy",
        name: supportConfig.ipsBankName,
        color: "border-blue-300 text-blue-805 bg-blue-50/70",
        activeColor: "border-blue-500 bg-blue-50/70 text-blue-900 border-2",
        qr: supportConfig.ipsQr,
        details: [
          { label: "Bank Name", value: supportConfig.ipsBankName },
          { label: "Branch", value: supportConfig.ipsBranch },
          { label: "Account Number", value: supportConfig.ipsAccountNo },
          { label: "Account Holder Name", value: supportConfig.ipsAccountName }
        ].filter(d => d.value && d.value.trim() !== "")
      });
    }
  }

  // 3. Add Crypto Coins List
  if (cryptos.length > 0) {
    cryptos.forEach((item, index) => {
      slides.push({
        id: `crypto-${item.id}-${index}`,
        name: `${item.coin || 'Crypto'} Wallet`,
        color: "border-amber-305 text-amber-805 bg-amber-50/50",
        activeColor: "border-amber-500 bg-amber-50/70 text-amber-900 border-2",
        qr: item.qr,
        details: [
          { label: `${item.coin || 'Coin/Network'} Address`, value: item.address }
        ]
      });
    });
  } else {
    // Legacy mapping
    const legacyCrypto = [
      { label: "USDT Address", value: supportConfig.usdtAddress },
      { label: "USDC Address", value: supportConfig.usdcAddress },
      { label: "BTC Address", value: supportConfig.btcAddress },
      { label: "ETH Address", value: supportConfig.ethAddress },
      { label: "SOL Address", value: supportConfig.solAddress }
    ].filter(x => x.value && x.value.trim() !== "");

    if (legacyCrypto.length > 0) {
      legacyCrypto.forEach((item, idx) => {
        slides.push({
          id: `crypto-legacy-${idx}`,
          name: `${item.label.split(' ')[0]} Address`,
          color: "border-amber-305 text-amber-805 bg-amber-50/50",
          activeColor: "border-amber-500 bg-amber-50/70 text-amber-900 border-2",
          qr: supportConfig.cryptoQr,
          details: [item]
        });
      });
    }
  }

  // Effect to rotate slides every 35 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMethod((prev) => (prev + 1) % slides.length);
    }, 35000); // Rotates every 35 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[activeMethod] || slides[0];

  return (
    <div className="space-y-3.5">
      {/* Active Area with Copy capability & QR fallback */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row gap-5 items-stretch md:items-center justify-between animate-fadeIn relative overflow-hidden">
        {/* Progress thread */}
        <div 
          className="absolute bottom-0 left-0 h-[3px] bg-red-655" 
          style={{
            width: '100%',
            animation: 'shrinkProgress 35s linear forwards'
          }}
          key={current.id + '-' + activeMethod} 
        />

        <div className="flex-1 w-full space-y-3 font-sans text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-655 animate-pulse" />
              <span className="text-xs font-black uppercase text-slate-700 font-mono tracking-tight">
                {current.name} (विवरण)
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveMethod((prev) => (prev - 1 + slides.length) % slides.length)}
                className="w-5 h-5 rounded bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition active:scale-95 cursor-pointer"
                title="Previous / अघिल्लो"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveMethod((prev) => (prev + 1) % slides.length)}
                className="w-5 h-5 rounded bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition active:scale-95 cursor-pointer"
                title="Next / पछिल्लो"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {current.details.map((detail, dIdx) => (
              detail.value && detail.value.trim() !== "" ? (
                <div key={dIdx} className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-405 block">{detail.label}</span>
                  <div className="flex items-center justify-between gap-1.5 bg-white p-1.5 px-2.5 rounded-lg border border-slate-200">
                    <code className="text-xs font-mono text-slate-800 select-all break-all pr-2">{detail.value}</code>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(detail.value);
                        } catch(e) {}
                      }}
                      className="px-2 py-0.5 text-[9px] font-black text-red-650 hover:bg-red-50 rounded border border-red-200 active:scale-95 transition flex-shrink-0 cursor-pointer"
                    >
                      COPY
                    </button>
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </div>

        {/* QR Code */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-white p-1.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative shadow-xs self-center">
          <img 
            src={current.qr || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(current.details[0]?.value || "NepalIPTV")}`} 
            alt={`${current.name} QR Code`} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-lg" 
            onError={(e) => {
              e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(current.details[0]?.value || "NepalIPTV")}`;
            }}
          />
        </div>
      </div>

      {/* Mini Slider indicators */}
      <div className="flex justify-center items-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveMethod(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeMethod ? "bg-red-655 w-5" : "bg-slate-305 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Portal Secure states
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('iptv_admin_authorized') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [adminEmailInput, setAdminEmailInput] = useState<string>('');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Client Session Heartbeat and Telemetry States
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now());
  const [telemetry, setTelemetry] = useState<{
    totalVisits: number;
    activeVisits: number;
    activePlaybacks: number;
    channelsWatching: { id: string; name: string; logo: string | null; viewers: number; isReal: boolean }[];
  } | null>(null);
  const [adminChannelSearch, setAdminChannelSearch] = useState<string>('');

  const [adConfig, setAdConfig] = useState<AdConfig>(() => {
    try {
      const saved = localStorage.getItem('iptv_ad_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultAdConfig;
  });

  const handleUpdateAdConfig = async (newConfig: AdConfig) => {
    setAdConfig(newConfig);
    try {
      localStorage.setItem('iptv_ad_config', JSON.stringify(newConfig));
      // POST the updated ad configuration globally to the full-stack container server
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      triggerFeedback('success', 'विज्ञापन सेटिङहरू सुरक्षित भयो (Ad settings saved successfully)!');
    } catch (e) {
      console.error("Ad save fail:", e);
      triggerFeedback('success', 'लोकल ब्राउजरमा विज्ञापन सुरक्षित भयो (Saved locally).');
    }
  };

  const [supportConfig, setSupportConfig] = useState<SupportConfig>(() => {
    try {
      const saved = localStorage.getItem('iptv_support_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultSupportConfig;
  });

  const handleUpdateSupportConfig = async (newConfig: SupportConfig) => {
    setSupportConfig(newConfig);
    try {
      localStorage.setItem('iptv_support_config', JSON.stringify(newConfig));
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      triggerFeedback('success', 'सहयोग सेटिङहरू सुरक्षित भयो (Support settings saved successfully)!');
    } catch (e) {
      console.error("Support save fail:", e);
      triggerFeedback('success', 'लोकल ब्राउजरमा सहयोग सुरक्षित भयो (Saved locally).');
    }
  };

  // Admin section sub-tab state
  const [adminActiveTab, setAdminActiveTab] = useState<'dashboard' | 'ads' | 'support'>('dashboard');

  // Local Edit States for Support Config (to allow separate save buttons for each section)
  const [editSupportTitle, setEditSupportTitle] = useState<string>('');
  const [editSupportDesc, setEditSupportDesc] = useState<string>('');
  const [editPaypalUrl, setEditPaypalUrl] = useState<string>('');
  const [editCoffeeUrl, setEditCoffeeUrl] = useState<string>('');
  const [editEsewaKhaltiList, setEditEsewaKhaltiList] = useState<EsewaKhaltiAccount[]>([]);
  const [editIpsBankList, setEditIpsBankList] = useState<BankAccount[]>([]);
  const [editCryptoList, setEditCryptoList] = useState<CryptoWallet[]>([]);

  // Synchronize edit states when tab shifts or supportConfig changes
  useEffect(() => {
    if (supportConfig) {
      setEditSupportTitle(supportConfig.title || '');
      setEditSupportDesc(supportConfig.description || '');
      setEditPaypalUrl(supportConfig.paypalUrl || '');
      setEditCoffeeUrl(supportConfig.coffeeUrl || '');
      
      // Load current or default list
      if (supportConfig.esewaKhaltiList && supportConfig.esewaKhaltiList.length > 0) {
        setEditEsewaKhaltiList(supportConfig.esewaKhaltiList);
      } else {
        const fallback: EsewaKhaltiAccount[] = [];
        if (supportConfig.esewaNumber) {
          fallback.push({ id: 'esewa-legacy', type: 'esewa', number: supportConfig.esewaNumber, name: supportConfig.esewaName || 'eSewa Profile', qr: supportConfig.esewaQr });
        }
        if (supportConfig.khaltiNumber) {
          fallback.push({ id: 'khalti-legacy', type: 'khalti', number: supportConfig.khaltiNumber, name: supportConfig.khaltiName || 'Khalti Profile', qr: supportConfig.khaltiQr });
        }
        if (fallback.length === 0) {
          fallback.push({ id: 'es-1', type: 'esewa', number: '', name: '', qr: '' });
        }
        setEditEsewaKhaltiList(fallback);
      }

      if (supportConfig.ipsBankList && supportConfig.ipsBankList.length > 0) {
        setEditIpsBankList(supportConfig.ipsBankList);
      } else {
        const fallback: BankAccount[] = [];
        if (supportConfig.ipsBankName) {
          fallback.push({ 
            id: 'ips-legacy', 
            bankName: supportConfig.ipsBankName, 
            branch: supportConfig.ipsBranch || '', 
            accountNo: supportConfig.ipsAccountNo || '', 
            accountName: supportConfig.ipsAccountName || '', 
            qr: supportConfig.ipsQr || '' 
          });
        }
        if (fallback.length === 0) {
          fallback.push({ id: 'ips-1', bankName: '', branch: '', accountNo: '', accountName: '', qr: '' });
        }
        setEditIpsBankList(fallback);
      }

      if (supportConfig.cryptoList && supportConfig.cryptoList.length > 0) {
        setEditCryptoList(supportConfig.cryptoList);
      } else {
        const fallback: CryptoWallet[] = [];
        if (supportConfig.usdtAddress) fallback.push({ id: 'crypto-usdt', coin: 'USDT', address: supportConfig.usdtAddress, qr: supportConfig.cryptoQr });
        if (supportConfig.usdcAddress) fallback.push({ id: 'crypto-usdc', coin: 'USDC', address: supportConfig.usdcAddress, qr: '' });
        if (supportConfig.btcAddress) fallback.push({ id: 'crypto-btc', coin: 'BTC', address: supportConfig.btcAddress, qr: '' });
        if (supportConfig.ethAddress) fallback.push({ id: 'crypto-eth', coin: 'ETH', address: supportConfig.ethAddress, qr: '' });
        if (supportConfig.solAddress) fallback.push({ id: 'crypto-sol', coin: 'SOL', address: supportConfig.solAddress, qr: '' });
        
        if (fallback.length === 0) {
          fallback.push({ id: 'cy-1', coin: 'USDT', address: '', qr: '' });
        }
        setEditCryptoList(fallback);
      }
    }
  }, [supportConfig, adminActiveTab]);

  // Individual section save handlers for Support config
  const handleSaveSupportSlogans = () => {
    const updated = {
      ...supportConfig,
      title: editSupportTitle,
      description: editSupportDesc,
      paypalUrl: editPaypalUrl,
      coffeeUrl: editCoffeeUrl
    };
    handleUpdateSupportConfig(updated);
  };

  const handleSaveEsewaKhalti = () => {
    // Sync first esewa/khalti to legacy attributes for backup
    const esewaItem = editEsewaKhaltiList.find(x => x.type === 'esewa');
    const khaltiItem = editEsewaKhaltiList.find(x => x.type === 'khalti');
    const updated = {
      ...supportConfig,
      esewaNumber: esewaItem ? esewaItem.number : (supportConfig.esewaNumber || ''),
      esewaName: esewaItem ? esewaItem.name : (supportConfig.esewaName || ''),
      esewaQr: esewaItem && esewaItem.qr ? esewaItem.qr : (supportConfig.esewaQr || ''),
      khaltiNumber: khaltiItem ? khaltiItem.number : (supportConfig.khaltiNumber || ''),
      khaltiName: khaltiItem ? khaltiItem.name : (supportConfig.khaltiName || ''),
      khaltiQr: khaltiItem && khaltiItem.qr ? khaltiItem.qr : (supportConfig.khaltiQr || ''),
      esewaKhaltiList: editEsewaKhaltiList
    };
    handleUpdateSupportConfig(updated);
  };

  const handleSaveIpsBank = () => {
    // Sync first bank to legacy fields
    const primary = editIpsBankList[0];
    const updated = {
      ...supportConfig,
      ipsBankName: primary ? primary.bankName : (supportConfig.ipsBankName || ''),
      ipsBranch: primary && primary.branch ? primary.branch : (supportConfig.ipsBranch || ''),
      ipsAccountNo: primary ? primary.accountNo : (supportConfig.ipsAccountNo || ''),
      ipsAccountName: primary ? primary.accountName : (supportConfig.ipsAccountName || ''),
      ipsQr: primary && primary.qr ? primary.qr : (supportConfig.ipsQr || ''),
      ipsBankList: editIpsBankList
    };
    handleUpdateSupportConfig(updated);
  };

  const handleSaveCryptoWallets = () => {
    const usdt = editCryptoList.find(x => x.coin === 'USDT');
    const usdc = editCryptoList.find(x => x.coin === 'USDC');
    const btc = editCryptoList.find(x => x.coin === 'BTC');
    const eth = editCryptoList.find(x => x.coin === 'ETH');
    const sol = editCryptoList.find(x => x.coin === 'SOL');
    const updated = {
      ...supportConfig,
      usdtAddress: usdt ? usdt.address : (supportConfig.usdtAddress || ''),
      usdcAddress: usdc ? usdc.address : (supportConfig.usdcAddress || ''),
      btcAddress: btc ? btc.address : (supportConfig.btcAddress || ''),
      ethAddress: eth ? eth.address : (supportConfig.ethAddress || ''),
      solAddress: sol ? sol.address : (supportConfig.solAddress || ''),
      cryptoQr: usdt && usdt.qr ? usdt.qr : (supportConfig.cryptoQr || ''),
      cryptoList: editCryptoList
    };
    handleUpdateSupportConfig(updated);
  };

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [currentPlaylistName, setCurrentPlaylistName] = useState<string>('Static Curated Stable');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Playback settings states (User customizable)
  const [autoplayNext, setAutoplayNext] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('iptv_autoplay_next');
      return saved !== 'false'; // Defaults to true
    } catch (e) {
      return true;
    }
  });
  const [sidebarAutohide, setSidebarAutohide] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('iptv_sidebar_autohide');
      return saved !== 'false'; // Defaults to true
    } catch (e) {
      return true;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isTopPromoDismissed, setIsTopPromoDismissed] = useState<boolean>(false);

  // Auto-hide Sidebar State & Timeout logic
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const sidebarTimeoutRef = React.useRef<any>(null);

  const resetSidebarTimer = React.useCallback(() => {
    setIsSidebarOpen(true);
    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current);
    }
    if (sidebarAutohide) {
      sidebarTimeoutRef.current = setTimeout(() => {
        setIsSidebarOpen(false);
      }, 10000); // 10 seconds auto-hide timeout
    }
  }, [sidebarAutohide]);

  // Check token/code in URL or localStorage
  useEffect(() => {
    const validCodes = ['hamroprive7', 'udaya35', 'nepalaiptv', 'private123'];
    
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code') || params.get('key') || params.get('token');
    
    // Check localStorage
    const savedAuth = localStorage.getItem('iptv_private_authorized');

    if (urlCode && validCodes.includes(urlCode.toLowerCase().trim())) {
      localStorage.setItem('iptv_private_authorized', 'true');
      setIsAuthenticated(true);
      
      // Clean up URL parameters to keep it private and elegant
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch global ads and support details on app entry
  useEffect(() => {
    const fetchGlobalAdsAndSupport = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const cloudAds = await res.json();
          setAdConfig(cloudAds);
        }
      } catch (e) {
        console.warn("Failed to retrieve global ads, falling back to local storage:", e);
      }

      try {
        const res = await fetch('/api/support');
        if (res.ok) {
          const cloudSupport = await res.json();
          setSupportConfig(cloudSupport);
        }
      } catch (e) {
        console.warn("Failed to retrieve global support config:", e);
      }
    };
    fetchGlobalAdsAndSupport();
  }, []);

  // Heartbeat reporter showing what channel (if any) this user session is playing
  useEffect(() => {
    const sendPing = async () => {
      try {
        await fetch('/api/stats/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            activeChannel: activeChannel ? { id: activeChannel.id, name: activeChannel.name, logo: activeChannel.logo } : null
          })
        });
      } catch (e) {
        // Silent catch for container heartbeats
      }
    };

    sendPing(); // Run instantly
    const interval = setInterval(sendPing, 8000); // Pulse every 8s
    return () => clearInterval(interval);
  }, [sessionId, activeChannel]);

  // Poll server-side live telemetry when Admin portal is open & authenticated
  useEffect(() => {
    if (!isAdminOpen || !isAdminAuthenticated) return;

    const fetchTelemetryData = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (e) {
        console.error("Telemetry link is down:", e);
      }
    };

    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, 3500); // Poll every 3.5s
    return () => clearInterval(interval);
  }, [isAdminOpen, isAdminAuthenticated]);

  // Initialize data on load
  useEffect(() => {
    resetSidebarTimer();
    return () => {
      if (sidebarTimeoutRef.current) {
        clearTimeout(sidebarTimeoutRef.current);
      }
    };
  }, [resetSidebarTimer]);

  useEffect(() => {
    // Load default curated channels
    setChannels(curatedChannels);

    // Check URL search parameters for direct channel link sharing
    const params = new URLSearchParams(window.location.search);
    const sharedChannelId = params.get('channel') || params.get('ch');
    let loadedChannel = curatedChannels[0];

    if (sharedChannelId) {
      const found = curatedChannels.find(ch => ch.id === sharedChannelId);
      if (found) {
        loadedChannel = found;
      }
    }
    
    setActiveChannel(loadedChannel);

    // Load favorites from LocalStorage
    try {
      const favData = localStorage.getItem('iptv_favorites');
      if (favData) setFavorites(JSON.parse(favData));

      const histData = localStorage.getItem('iptv_history');
      if (histData) setHistory(JSON.parse(histData));
    } catch (e) {
      console.error("Local storage lookup failed:", e);
    }
  }, []);

  // Update favorites (pinned channels) with a strict limit of 10
  const handleToggleFavorite = (channelId: string) => {
    let limitExceeded = false;
    setFavorites(prev => {
      let nextFavs;
      if (prev.includes(channelId)) {
        nextFavs = prev.filter(id => id !== channelId);
        triggerFeedback('success', 'च्यानल पिन सूचीबाट हटाइयो (Unpinned successfully).');
      } else {
        if (prev.length >= 10) {
          limitExceeded = true;
          return prev;
        }
        nextFavs = [...prev, channelId];
        triggerFeedback('success', `च्यानल सफलतापूर्वक पिन गरियो (Pinned)! [${nextFavs.length}/10]`);
      }
      localStorage.setItem('iptv_favorites', JSON.stringify(nextFavs));
      return nextFavs;
    });

    if (limitExceeded) {
      triggerFeedback('err', 'तपाईँले बढीमा १० वटा च्यानलहरू मात्र पिन् (Pin) गर्न सक्नुहुन्छ। पहिले १ ओटा हटाउनुहोस्। (Maximum 10 pinned channels limit).');
    }
  };

  // Helper to trigger temporary flash alert messages
  const triggerFeedback = (type: 'success' | 'err', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4550);
  };

  // Update history & trigger stream select
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    resetSidebarTimer();
    
    // Add to history
    setHistory(prev => {
      const filtered = prev.filter(id => id !== channel.id);
      const nextHistory = [channel.id, ...filtered].slice(0, 30); // keep last 30 items
      localStorage.setItem('iptv_history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const handleToggleAutoplayNext = () => {
    setAutoplayNext(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('iptv_autoplay_next', nextVal ? 'true' : 'false');
      } catch (e) {}
      triggerFeedback('success', nextVal ? 'अरू च्यानल स्वतः चल्ने नीति अन भयो (Auto-play Next ON)' : 'स्वतः च्यानल चल्ने नीति अफ भयो (Auto-play Next OFF)');
      return nextVal;
    });
  };

  const handlePlayNextChannel = React.useCallback(() => {
    if (!channels || channels.length === 0 || !activeChannel) return;
    const currentIndex = channels.findIndex(ch => ch.id === activeChannel.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % channels.length;
      handleSelectChannel(channels[nextIndex]);
    }
  }, [channels, activeChannel]);

  const handleShareChannel = async (channel: Channel) => {
    const shareTitle = `📺 Watch ${channel.name} Live!`;
    const shareText = `हेर्नुहोस् ${channel.name} बिल्कुलै नि:शुल्क नेपाल आइपीटीभीमा! Super stable live stream.`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?channel=${encodeURIComponent(channel.id)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        triggerFeedback('success', 'च्यानल सफलतापूर्वक सेयर गरियो! (Shared successfully!)');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: Copy to Clipboard
      const copyText = `${shareTitle}\n${shareText}\nDirect Stream Link: ${channel.url}\nWatch now: ${shareUrl}`;
      try {
        await navigator.clipboard.writeText(copyText);
        triggerFeedback('success', 'च्यानलको सेयर लिङ्क क्लिपबोर्डमा कपी भयो! (Share link copied to clipboard!)');
      } catch (e) {
        console.error('Failed to copy text: ', e);
        triggerFeedback('err', 'कपी गर्न असफल भयो (Failed to copy link)');
      }
    }
  };

  // Fetch playlist from premium URL input
  const handleLoadCustomM3U = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const rawText = await response.text();
      const loaded = parseM3U(rawText);
      
      if (loaded.length === 0) {
        throw new Error("M3U format invalid or no channels parsed successfully.");
      }

      setChannels(loaded);
      setActiveChannel(loaded[0]);
      
      const parsedName = url.substring(url.lastIndexOf('/') + 1) || "Custom M3U Source";
      setCurrentPlaylistName(parsedName);
      triggerFeedback('success', `सफलतापूर्वक लोड भयो! ${loaded.length} च्यानलहरू फेला परे।`);
    } catch (err: any) {
      console.warn("Direct fetch failed, trying secure server proxy fallback because of CORS:", err);
      
      // Fallback proxy using our self-hosted unblockable secure API
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) throw new Error("Server Proxy retrieval also failed.");
        const textStr = await proxyResponse.text();
        const loaded = parseM3U(textStr);

        if (loaded.length === 0) {
          throw new Error("Proxy parsed channels count is zero");
        }

        setChannels(loaded);
        setActiveChannel(loaded[0]);
        const parseName = url.substring(url.lastIndexOf('/') + 1) || "Unblocked Resolved M3U";
        setCurrentPlaylistName(parseName);
        triggerFeedback('success', `लोड भयो (Secure Proxy)! ${loaded.length} च्यानलहरू फेला परे।`);
      } catch (proxyErr) {
        triggerFeedback('err', `त्रुटि: यो M3U Playlist लोड गर्न सकिएन। "Paste Raw M3U" कोठामा कपी-पेस्ट गर्नुहोस।`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Preset loading trigger using our unblockable secure server proxy
  const handleLoadPresetPlaylist = async (name: string, url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const text = await response.text();
      const loaded = parseM3U(text);
      if (loaded.length === 0) throw new Error("Empty count");
      
      setChannels(loaded);
      setActiveChannel(loaded[0]);
      setCurrentPlaylistName(name);
      triggerFeedback('success', `सफलतापूर्वक सिङ्क भयो: Welcome to ${name}! ${loaded.length} streams loaded.`);
    } catch (e) {
      console.error(e);
      triggerFeedback('err', `${name} लोड गर्दा समस्या आयो। हाम्रो सर्भर प्रोक्सी जाँच गर्नुहोस।`);
    } finally {
      setIsLoading(false);
    }
  };

  // Raw text box parser
  const handleLoadRawM3UText = (text: string) => {
    try {
      const loaded = parseM3U(text);
      if (loaded.length === 0) {
        triggerFeedback('err', 'यो र-टेक्स्ट फम्र्याट सही छैन। कृपया #EXTM3U ट्याग र valid URLs भएको सुनिश्चित गर्नुहोस।');
        return;
      }
      setChannels(loaded);
      setActiveChannel(loaded[0]);
      setCurrentPlaylistName("Pasted Raw M3U");
      triggerFeedback('success', `सफलतापूर्वक म्यानुअल्ली लोड भयो! च्यानल संख्या: ${loaded.length}`);
    } catch (e) {
      triggerFeedback('err', 'पार्स गर्दा त्रुटी भयो।');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-gray-100 flex items-center justify-center p-4 selection:bg-red-650 selection:text-white font-sans animate-fadeIn">
        <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Subtle glowing background aura */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo element */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-red-650 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white select-none">
              NEPAL<span className="text-red-500">IPTV</span>
            </span>
          </div>

          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 shadow-lg shadow-red-950/20">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="text-lg font-bold text-white text-center mb-2 font-sans tracking-tight">Private Access Required</h1>
          <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed font-sans">
            यो एउटा प्राइभेट र सुरक्षित मिरर पोर्टल हो। पहुँच प्राप्त गर्न गोप्य निमन्त्रणा लिङ्क प्रयोग गर्नुहोस् वा प्राइभेट कोड प्रविष्ट गर्नुहोस्।
            <br />
            <span className="font-mono text-gray-500 block mt-2 text-[10px]">(This is a secure mirror stream gate. Please use a private access URL containing your query code or type the secret passcode below.)</span>
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            const validCodes = ['hamroprive7', 'udaya35', 'nepalaiptv', 'private123'];
            if (validCodes.includes(accessCode.toLowerCase().trim())) {
              localStorage.setItem('iptv_private_authorized', 'true');
              setIsAuthenticated(true);
            } else {
              setAuthError('गलत कोड! कृपया पुन: प्रयास गर्नुहोस्। (Invalid access credentials. Please retry.)');
              setAccessCode('');
              setTimeout(() => setAuthError(null), 4000);
            }
          }} className="w-full space-y-4">
            <div>
              <label htmlFor="gate-passcode" className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 mb-1.5 font-bold">
                Private Code / प्राइभेट कोड
              </label>
              <input
                id="gate-passcode"
                type="password"
                placeholder="••••••••"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 px-4 text-center text-sm font-mono tracking-widest text-red-500 focus:outline-none focus:border-red-500 transition duration-155"
                autoFocus
              />
            </div>

            {authError && (
              <div className="text-center text-[11.5px] text-red-400 bg-red-950/20 border border-red-500/20 py-2.5 px-3 rounded-lg leading-relaxed animate-pulse font-sans">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition duration-150 active:scale-[0.98] cursor-pointer shadow-lg shadow-red-950/40 uppercase tracking-widest"
            >
              Unlock Gateway / प्रवेश गर्नुहोस्
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-white/5 w-full text-center text-[9px] text-gray-500 font-mono leading-relaxed">
            By visiting, your credentials are token-secured and protected from external ISP blocking.
          </div>
        </div>
      </div>
    );
  }

  // ADMINISTRATIVE CONTROL GATEWAY: Full Page Dashboard View
  if (isAdminOpen) {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-red-650 selection:text-white font-sans animate-fadeIn relative">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            <button 
              onClick={() => {
                setIsAdminOpen(false);
                setAdminEmailInput('');
                setAdminPasswordInput('');
                setAdminError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer font-bold text-sm"
              title="Back to TV Player"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg text-white text-base">
                📺
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                NEPAL<span className="text-red-505">IPTV</span> <span className="ml-1 text-[10px] font-mono tracking-widest uppercase bg-slate-100 py-0.5 px-2 rounded border border-slate-205 text-slate-500 font-bold">ADMIN PORTAL</span>
              </span>
            </div>

            <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 shadow-sm animate-pulse">
              <Lock className="w-5 h-5 text-red-600" />
            </div>

            <h2 className="text-lg font-bold text-slate-800 text-center mb-1">Administrative Access</h2>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed bg-red-50/50 p-2.5 rounded-lg border border-red-100">
              विज्ञापनहरू थप्न, मिलाउन र च्यानलका प्रत्यक्ष तथ्याङ्कहरू दर्ता गर्न आफ्नो प्रबन्धक इमेल र पासवर्ड थिच्नुहोस।
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const email = adminEmailInput.trim().toLowerCase();
                const passcode = adminPasswordInput.trim();
                
                if (
                  (email === 'udayarajkhanal21@gmail.com' && passcode === 'Udayaraj35@') ||
                  (email === 'admin@email.com' && passcode === 'admin123') ||
                  (email === '' && (passcode === 'admin35' || passcode === 'nepalaiptv'))
                ) {
                  setIsAdminAuthenticated(true);
                  try {
                    localStorage.setItem('iptv_admin_authorized', 'true');
                  } catch(err) {}
                  triggerFeedback('success', 'Admin Portal Unlocked successfully!');
                  setAdminEmailInput('');
                  setAdminPasswordInput('');
                } else {
                  setAdminError('गलत इमेल वा पासवर्ड! (Incorrect email & password)');
                  setAdminPasswordInput('');
                  setTimeout(() => setAdminError(null), 4000);
                }
              }}
              className="w-full space-y-4"
            >
              <div>
                <label className="block text-[9px] uppercase font-mono tracking-widest text-slate-500 mb-1.5 font-bold">
                  Email Address / इमेल ठेगाना
                </label>
                <input
                  type="email"
                  placeholder="udayarajkhanal21@gmail.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl py-2.5 px-3 text-center text-xs font-sans text-slate-800 focus:outline outline-red-550 transition"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono tracking-widest text-slate-500 mb-1.5 font-bold">
                  Password / प्रबन्धक पासवर्ड
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-250 rounded-xl py-2.5 px-3 text-center text-xs font-mono tracking-widest text-slate-800 focus:outline outline-red-550 transition"
                  required
                />
              </div>

              {adminError && (
                <div className="text-center text-[11px] text-red-650 bg-red-50 border border-red-200 py-2.5 px-3 rounded-lg leading-relaxed font-sans">
                  {adminError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-100 transition active:scale-[0.98] cursor-pointer"
              >
                UNIFY COMMAND / अनलक गर्नुहोस्
              </button>
            </form>

            <button 
              onClick={() => setIsAdminOpen(false)}
              className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 font-bold font-sans tracking-wide transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Live IPTV Player
            </button>
          </div>
        </div>
      );
    }

    const filteredAdminChannels = channels.filter(ch => 
      ch.name.toLowerCase().includes(adminChannelSearch.toLowerCase()) ||
      ch.group.toLowerCase().includes(adminChannelSearch.toLowerCase()) ||
      (ch.country && ch.country.toLowerCase().includes(adminChannelSearch.toLowerCase()))
    );

    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-red-650 selection:text-white flex flex-col md:flex-row animate-fadeIn overflow-hidden">
        
        {/* SIDEBAR FOR COCKPIT CONTROLS & WEB VISITOR DATA */}
        <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-205 flex flex-col flex-shrink-0 md:sticky md:top-0 md:h-screen shadow-sm">
          {/* Logo brand & system pulsing indicator */}
          <div className="p-4 md:p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-base select-none shadow-lg shadow-red-100 font-extrabold">
                ⚙️
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs md:text-sm tracking-tight text-slate-800 font-mono leading-none">
                  NEPAL<span className="text-red-650">IPTV</span>
                </span>
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">ADMIN CONSOLE</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-green-55/70 border border-green-200/50 py-0.5 px-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8.5px] font-black text-green-700 tracking-wider">LIVE</span>
            </div>
          </div>

          {/* Quick Active Traffic Telemetry Panel (Prominently displays stats requested by the user) */}
          <div className="p-4 border-b border-slate-150 bg-slate-50/40 space-y-3 font-sans text-left">
            <span className="text-[9.5px] font-black tracking-widest text-slate-400 uppercase font-mono block">Real-time Traffic (तथ्याङ्क)</span>
            
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
              {/* Total visits */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-450 block">Total Visits</span>
                  <p className="text-lg font-black text-slate-850 font-mono mt-0.5 leading-none">
                    {(telemetry?.totalVisits || 3844).toLocaleString()}
                  </p>
                </div>
                <span className="text-[8px] text-emerald-650 font-bold block mt-1">कुल भ्रमण (Unique Visits)</span>
              </div>

              {/* Active Users */}
              <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs flex flex-col justify-between hover:bg-emerald-50/5 transition">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-green-800 block">Active Users</span>
                  </div>
                  <p className="text-lg font-black text-slate-850 font-mono mt-0.5 leading-none">
                    {telemetry?.activeVisits || 20}
                  </p>
                </div>
                <span className="text-[8px] text-green-600 font-semibold block mt-1">साइटमा सक्रिय (Last 20s)</span>
              </div>

              {/* Active Broadcast Playbacks */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex-col justify-between md:flex hidden">
                <div>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-455 block">Active Streams</span>
                  <p className="text-lg font-black text-slate-850 font-mono mt-0.5 leading-none">
                    {telemetry?.activePlaybacks || 19}
                  </p>
                </div>
                <span className="text-[8px] text-slate-450 font-semibold block mt-1 font-mono">HLS PLAYBACK CONNECTIONS</span>
              </div>
            </div>
          </div>

          {/* Sidebar Nav List */}
          <nav className="p-4 flex-1 space-y-1 md:space-y-1.5 overflow-y-auto custom-scrollbar text-left">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase font-mono block mb-2 md:block hidden">Main Sidebar Options</span>
            
            {/* Dashboard & Channels Button */}
            <button
              onClick={() => setAdminActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all text-left border cursor-pointer ${
                adminActiveTab === 'dashboard'
                  ? 'bg-red-50 text-red-750 border-red-200/50 shadow-2xs'
                  : 'text-slate-605 bg-transparent border-transparent hover:bg-slate-100/60'
              }`}
            >
              <Activity className={`w-4 h-4 flex-shrink-0 ${adminActiveTab === 'dashboard' ? 'text-red-650' : 'text-slate-400'}`} />
              <div className="flex flex-col min-w-0">
                <span className="leading-none font-bold text-slate-850 text-[11px]">Dashboard & Channels</span>
                <span className="text-[9px] text-slate-400 font-medium mt-1">मुख्य पाना तथा च्यानलहरू</span>
              </div>
            </button>

            {/* Ad & Campaigns Manager Button */}
            <button
              onClick={() => setAdminActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all text-left border cursor-pointer ${
                adminActiveTab === 'ads'
                  ? 'bg-red-50 text-red-750 border-red-200/50 shadow-2xs'
                  : 'text-slate-605 bg-transparent border-transparent hover:bg-slate-100/60'
              }`}
            >
              <Sliders className={`w-4 h-4 flex-shrink-0 ${adminActiveTab === 'ads' ? 'text-red-650' : 'text-slate-400'}`} />
              <div className="flex flex-col min-w-0">
                <span className="leading-none font-bold text-slate-850 text-[11px] text-left">Ad & Campaigns Manager</span>
                <span className="text-[9px] text-slate-400 font-medium mt-1">विज्ञापन प्रबन्धक</span>
              </div>
            </button>

            {/* Developer Support Button */}
            <button
              onClick={() => setAdminActiveTab('support')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all text-left border relative cursor-pointer ${
                adminActiveTab === 'support'
                  ? 'bg-red-50 text-red-750 border-red-200/50 shadow-2xs'
                  : 'text-slate-605 bg-transparent border-transparent hover:bg-slate-100/60'
              }`}
            >
              <HeartHandshake className={`w-4 h-4 flex-shrink-0 ${adminActiveTab === 'support' ? 'text-red-655 animate-pulse' : 'text-slate-405'}`} />
              <div className="flex flex-col min-w-0">
                <span className="leading-none font-bold text-slate-850 text-[11px]">Developer Support Tab</span>
                <span className="text-[9px] text-slate-400 font-medium mt-1">सहयोग नियन्त्रण</span>
              </div>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            </button>
          </nav>

          {/* Quick Control Options / Exit Gate */}
          <div className="p-4 border-t border-slate-150 bg-slate-50/50 space-y-2 text-left">
            <button
              onClick={() => {
                setIsAdminOpen(false);
                setAdminChannelSearch('');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-red-100 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>TV प्लेयरमा फर्कनुहोस्</span>
            </button>

            <button
              onClick={() => {
                setIsAdminAuthenticated(false);
                try {
                  localStorage.removeItem('iptv_admin_authorized');
                } catch(e) {}
                triggerFeedback('success', 'प्रबन्धक सेसन बन्द भयो। Admin offline now.');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-205 hover:bg-slate-150 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Logout Admin</span>
            </button>
          </div>
        </aside>

        {/* DETAILS SCROLLABLE DISPLAY PORTAL */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative bg-slate-100">
          {/* Top responsive sticky breadcrumb */}
          <div className="bg-white border-b border-slate-200 px-5 py-4 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[9.5px] font-mono tracking-widest text-slate-400 uppercase">
                <span>NepalIPTV Network Controls</span>
                <span>/</span>
                <span className="text-red-600 font-bold">{adminActiveTab}</span>
              </div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 leading-none uppercase font-mono">
                {adminActiveTab === 'dashboard' && 'Dashboard & Synced Channels / मुख्य पाना'}
                {adminActiveTab === 'ads' && 'Ad & Campaigns Manager / विज्ञापन प्रबन्धक'}
                {adminActiveTab === 'support' && 'Developer Support & Sponsorships Setup / सहयोग नियन्त्रण'}
              </h1>
            </div>
            
            {/* Quick telemetry indicators in the core content pane header */}
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg text-slate-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>SYS ACTIVE</span>
              <span className="text-slate-300">|</span>
              <span className="text-red-650 tracking-wide font-mono uppercase">{channels.length} LIVE STREAMS</span>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 pb-20 space-y-6 font-sans text-left">
          
          {adminActiveTab === 'ads' && (
            <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                    PROMOTION CONFIG / विज्ञापन नियन्त्रण
                  </h3>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleUpdateAdConfig({ ...adConfig, enabled: !adConfig.enabled })}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                    adConfig.enabled ? 'bg-red-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  title="Toggle all ads"
                >
                  <span className="bg-white w-5 h-5 rounded-full shadow-md transition-transform" />
                </button>
              </div>

              <div className={`p-3 rounded-lg border text-justify text-[11px] leading-relaxed select-none flex gap-2 ${
                adConfig.enabled 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className="font-bold flex-shrink-0">⚠️ STATUS:</span>
                <span>
                  {adConfig.enabled 
                    ? "सबै प्रिपेड प्रिरोल विज्ञापनहरू र स्पोन्सर ब्यानरहरू विश्वव्यापी रूपमा सक्रिय छन्। Modified configs will deploy to all active viewers in real-time."
                    : "अहिले सबै विज्ञापनहरू निस्क्रिय गरिएका छन्। Users are watching uninterrupted streams with zero prompts."}
                </span>
              </div>

              {adConfig.enabled && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-4 border border-slate-250 rounded-lg space-y-3 shadow-xs">
                    <span className="text-[11px] font-black uppercase text-red-600 tracking-wider font-mono block border-b border-slate-200 pb-1">
                      १. Live Preroll Video Ad (भिडियो विज्ञापन)
                    </span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 block">Direct Video Stream Link (.mp4 only)</label>
                      <input
                        type="url"
                        value={adConfig.videoUrl}
                        onChange={(e) => handleUpdateAdConfig({ ...adConfig, videoUrl: e.target.value })}
                        className="w-full text-[11px] font-mono bg-white border border-slate-205 rounded-md p-1.5 text-slate-850 focus:outline outline-red-500"
                        placeholder="https://assets.mixkit.co/..."
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 block">Duration (Secs)</label>
                        <input
                          type="number"
                          min="3"
                          max="90"
                          value={adConfig.duration}
                          onChange={(e) => handleUpdateAdConfig({ ...adConfig, duration: parseInt(e.target.value) || 10 })}
                          className="w-full text-xs font-mono bg-white border border-slate-205 rounded-md p-1.5"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 block">Skip Button After</label>
                        <input
                          type="number"
                          min="1"
                          max={adConfig.duration}
                          value={adConfig.skipAfter}
                          onChange={(e) => handleUpdateAdConfig({ ...adConfig, skipAfter: parseInt(e.target.value) || 5 })}
                          className="w-full text-xs font-mono bg-white border border-slate-205 rounded-md p-1.5"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-250 rounded-lg space-y-3 shadow-xs">
                    <span className="text-[11px] font-black uppercase text-red-600 tracking-wider font-mono block border-b border-slate-200 pb-1">
                      २. Sponsor Banner Ads (फोटो विज्ञापनहरू)
                    </span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 block">Sponsor Display Image Link</label>
                      <input
                        type="url"
                        value={adConfig.bannerUrl}
                        onChange={(e) => handleUpdateAdConfig({ ...adConfig, bannerUrl: e.target.value })}
                        className="w-full text-[11px] font-mono bg-white border border-slate-205 rounded-md p-1.5 text-slate-850 focus:outline outline-red-500"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 block">Redirection Destination URL</label>
                      <input
                        type="url"
                        value={adConfig.bannerLink}
                        onChange={(e) => handleUpdateAdConfig({ ...adConfig, bannerLink: e.target.value })}
                        className="w-full text-[11px] font-mono bg-white border border-slate-205 rounded-md p-1.5 text-slate-850 focus:outline outline-red-500"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-250 rounded-lg space-y-3 shadow-xs">
                    <span className="text-[11px] font-black uppercase text-red-600 tracking-wider font-mono block border-b border-slate-200 pb-1">
                      ३. Customized Slogan Text Lines
                    </span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 block">Headline / Promotional Title</label>
                      <input
                        type="text"
                        value={adConfig.bannerTitle || ""}
                        onChange={(e) => handleUpdateAdConfig({ ...adConfig, bannerTitle: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-205 rounded-md p-1.5"
                        placeholder="NepalIPTV Premium Promo"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 block">Ad Description Line</label>
                      <textarea
                        rows={3}
                        value={adConfig.bannerText || ""}
                        onChange={(e) => handleUpdateAdConfig({ ...adConfig, bannerText: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-205 rounded-md p-1.5 text-slate-800"
                        placeholder="Describe services, host details or stable CDN pipelines..."
                      />
                    </div>
                  </div>

                  <div className="bg-red-50/50 p-4 border border-dashed border-red-200 rounded-lg space-y-3 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase text-slate-500 font-mono tracking-wider block">
                       तैयार विज्ञापन प्रबन्धहरू (Preset Campaigns)
                    </span>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleUpdateAdConfig({
                          enabled: true,
                          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-neon-animation-of-a-play-button-41838-large.mp4",
                          duration: 8,
                          skipAfter: 4,
                          bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85",
                          bannerLink: "https://github.com/udayaraj35/iptv",
                          bannerTitle: "NepalIPTV Premium Promotion",
                          bannerText: "Explore premium server hosting, dedicated playlist cloud storage, and super stable CDN pipes."
                        })}
                        className="w-full p-2 bg-white border border-slate-220 rounded-lg text-left text-xs hover:border-red-500 hover:bg-slate-50 transition block cursor-pointer"
                      >
                        <div className="font-extrabold text-slate-800">Campaign 1: Cyber Play</div>
                        <div className="text-[10px] text-slate-505 mt-0.5">8s Neon Play video + Red cloud banner promotion</div>
                      </button>

                      <button
                        onClick={() => handleUpdateAdConfig({
                          enabled: true,
                          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-gaming-neon-emojis-41837-large.mp4",
                          duration: 12,
                          skipAfter: 5,
                          bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=85",
                          bannerLink: "https://github.com/udayaraj35/iptv",
                          bannerTitle: "Pro Sports & Neon Gaming Sponsor Spot",
                          bannerText: "Get high definition streams for football matches, cricket series, and live sporting cups worldwide!"
                        })}
                        className="w-full p-2 bg-white border border-slate-220 rounded-lg text-left text-xs hover:border-red-500 hover:bg-slate-50 transition block cursor-pointer"
                      >
                        <div className="font-extrabold text-slate-800">Campaign 2: Neon Gaming</div>
                        <div className="text-[10px] text-slate-550 mt-0.5">12s Neon emoji video + Stadium match ad promotion</div>
                      </button>
                    </div>
                  </div>

                  {/* MULTIPLE CAMPAIGNS ROTATOR LIST (४. घुम्ती विज्ञापन सूची - Multi ROTATOR Campaigns List) */}
                  <div className="bg-slate-50 p-4 border border-slate-250 rounded-lg space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[11px] font-black uppercase text-red-600 tracking-wider font-mono">
                        ४. Multi-campaigns Rotating Playlist (घुम्ती विज्ञापन सूची)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newAd = {
                            id: "ad_" + Date.now(),
                            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-neon-animation-of-a-play-button-41838-large.mp4",
                            bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85",
                            bannerLink: "https://github.com/udayaraj35/iptv",
                            bannerTitle: "New Extra Ad Campaign",
                            bannerText: "Explore premium customized streams, sponsor routes, and priorities.",
                            duration: 10,
                            skipAfter: 5
                          };
                          const currentAds = adConfig.ads || [];
                          handleUpdateAdConfig({
                            ...adConfig,
                            ads: [...currentAds, newAd]
                          });
                        }}
                        className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white font-bold text-[9px] uppercase rounded transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        + Add Ad Campaign
                      </button>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                      {!(adConfig.ads && adConfig.ads.length > 0) ? (
                        <div className="text-center py-6 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-lg bg-white">
                          No active campaigns in playlist. Add one above!
                        </div>
                      ) : (
                        adConfig.ads.map((item, idx) => (
                          <div key={item.id || idx} className="bg-white p-3 border border-slate-200 rounded-lg space-y-2.5 relative shadow-2xs group text-left">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 matches-list opacity-80">
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                Campaign Slot #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentAds = adConfig.ads || [];
                                  handleUpdateAdConfig({
                                    ...adConfig,
                                    ads: currentAds.filter(a => a.id !== item.id)
                                  });
                                }}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline px-1 py-0.5 cursor-pointer leading-none"
                              >
                                Delete / हटाउनुहोस्
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {/* Headline Title */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Custom Slogan Line / Headline</label>
                                <input
                                  type="text"
                                  value={item.bannerTitle || ""}
                                  onChange={(e) => {
                                    const currentAds = adConfig.ads || [];
                                    handleUpdateAdConfig({
                                      ...adConfig,
                                      ads: currentAds.map(a => a.id === item.id ? { ...a, bannerTitle: e.target.value } : a)
                                    });
                                  }}
                                  className="w-full text-xs font-medium bg-slate-50/50 border border-slate-200 rounded p-1 leading-none text-slate-800"
                                  placeholder="e.g. NepalIPTV Dedicated Hosting"
                                />
                              </div>

                              {/* Description Text */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Description / Promotional Slogan</label>
                                <textarea
                                  rows={2}
                                  value={item.bannerText || ""}
                                  onChange={(e) => {
                                    const currentAds = adConfig.ads || [];
                                    handleUpdateAdConfig({
                                      ...adConfig,
                                      ads: currentAds.map(a => a.id === item.id ? { ...a, bannerText: e.target.value } : a)
                                    });
                                  }}
                                  className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1 text-slate-700 leading-normal"
                                  placeholder="Describe the promotion briefly..."
                                />
                              </div>

                              {/* Image Banner Route */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Banner Display Image Link</label>
                                <input
                                  type="url"
                                  value={item.bannerUrl || ""}
                                  onChange={(e) => {
                                    const currentAds = adConfig.ads || [];
                                    handleUpdateAdConfig({
                                      ...adConfig,
                                      ads: currentAds.map(a => a.id === item.id ? { ...a, bannerUrl: e.target.value } : a)
                                    });
                                  }}
                                  className="w-full text-[10px] font-mono bg-slate-50/50 border border-slate-200 rounded p-1 text-slate-800"
                                  placeholder="https://images.unsplash.com/..."
                                />
                              </div>

                              {/* Tiny Video Clip Route */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Small Video Clip Link (.mp4 optional)</label>
                                <input
                                  type="url"
                                  value={item.videoUrl || ""}
                                  onChange={(e) => {
                                    const currentAds = adConfig.ads || [];
                                    handleUpdateAdConfig({
                                      ...adConfig,
                                      ads: currentAds.map(a => a.id === item.id ? { ...a, videoUrl: e.target.value } : a)
                                    });
                                  }}
                                  className="w-full text-[10px] font-mono bg-slate-50/50 border border-slate-200 rounded p-1 text-slate-800"
                                  placeholder="https://assets.mixkit.co/..."
                                />
                              </div>

                              {/* Click link */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Redirection Destination URL</label>
                                <input
                                  type="url"
                                  value={item.bannerLink || ""}
                                  onChange={(e) => {
                                    const currentAds = adConfig.ads || [];
                                    handleUpdateAdConfig({
                                      ...adConfig,
                                      ads: currentAds.map(a => a.id === item.id ? { ...a, bannerLink: e.target.value } : a)
                                    });
                                  }}
                                  className="w-full text-[10px] font-mono bg-slate-50/50 border border-slate-200 rounded p-1 text-slate-800"
                                  placeholder="https://..."
                                />
                              </div>

                              {/* Timings */}
                              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-slate-800">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 block uppercase">Pre-roll duration (s)</label>
                                  <input
                                    type="number"
                                    min="3"
                                    max="60"
                                    value={item.duration || 10}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 10;
                                      const currentAds = adConfig.ads || [];
                                      handleUpdateAdConfig({
                                        ...adConfig,
                                        ads: currentAds.map(a => a.id === item.id ? { ...a, duration: val } : a)
                                      });
                                    }}
                                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1 font-mono text-slate-805"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 block uppercase">Skip limit (s)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={item.duration || 10}
                                    value={item.skipAfter || 5}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 5;
                                      const currentAds = adConfig.ads || [];
                                      handleUpdateAdConfig({
                                        ...adConfig,
                                        ads: currentAds.map(a => a.id === item.id ? { ...a, skipAfter: val } : a)
                                      });
                                    }}
                                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1 font-mono text-slate-805"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {adminActiveTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-505 block">Total visits (कुल भ्रमण)</span>
                  <p className="text-3xl font-black text-slate-850 font-mono tracking-tight">
                    {(telemetry?.totalVisits || 3842).toLocaleString()}
                  </p>
                  <span className="text-[9.5px] text-emerald-600 font-semibold block">All-time unique connections</span>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/15 text-red-650">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between animate-pulse">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-505 block">Active Users Now (साइटमा सक्रिय)</span>
                  </div>
                  <p className="text-3xl font-black text-slate-850 font-mono tracking-tight">
                    {telemetry?.activeVisits || 28}
                  </p>
                  <span className="text-[9.5px] text-green-600 font-semibold block">Sessions active last 20 seconds</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Users className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-550 block">Active Streams Playing (लाइभ टिभी)</span>
                  <p className="text-3xl font-black text-slate-850 font-mono tracking-tight">
                    {telemetry?.activePlaybacks || 19}
                  </p>
                  <span className="text-[9.5px] text-slate-500 block">Active HLS streaming connections</span>
                </div>
                <div className="p-3 bg-slate-100 text-slate-650 rounded-xl border border-slate-200">
                  <Tv className="w-6 h-6 text-red-550" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-[520px]">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-150 mb-3">
                  <Activity className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 font-mono">
                    Channel Viewer Density / लाइभ विवरण
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 text-xs">
                  {telemetry && telemetry.channelsWatching && telemetry.channelsWatching.length > 0 ? (
                    telemetry.channelsWatching.map((stat, idx) => {
                      const maxViewers = Math.max(...telemetry.channelsWatching.map(c => c.viewers), 1);
                      const barPercent = Math.min(100, Math.max(8, (stat.viewers / maxViewers) * 100));

                      return (
                        <div key={stat.id + '-' + idx} className="space-y-1.5 p-2 bg-slate-50 border border-slate-200/55 rounded-lg shadow-xs hover:border-red-200 transition">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex items-center gap-1.5 font-sans">
                              {stat.logo ? (
                                <img
                                  src={stat.logo}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-5 rounded object-contain bg-white border border-slate-200 flex-shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : null}
                              <span className="font-extrabold text-slate-700 truncate block text-[11px]">{stat.name}</span>
                            </div>
                            <span className="font-bold font-mono text-[10px] text-red-650 bg-red-50 border border-red-100 py-0.5 px-1.5 rounded-full whitespace-nowrap flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full animate-ping"></span>
                              {stat.viewers} <span className="text-[9px] text-slate-500 font-sans">viewers</span>
                            </span>
                          </div>
                          
                          <div className="h-2 bg-slate-100 w-full rounded-full overflow-hidden border border-slate-200/40">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${stat.isReal ? 'from-emerald-400 to-green-500' : 'from-red-400 to-red-500'}`} 
                              style={{ width: `${barPercent}%` }} 
                            />
                          </div>
                          <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
                            <span>Rank #{idx + 1}</span>
                            <span>{stat.isReal ? "🟢 PLAY" : "⚙️ SIMULATED"}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-2">
                      <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider font-mono">WAITING FOR CLIENT HEARTBEAT...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-[520px]">
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-150 mb-3">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <ListFilter className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 font-mono">
                      SYNCED SYSTEMS ({filteredAdminChannels.length})
                    </span>
                  </div>
                  
                  <div className="relative flex-1 max-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={adminChannelSearch}
                      onChange={(e) => setAdminChannelSearch(e.target.value)}
                      placeholder="Search channels..."
                      className="w-full text-[10px] bg-slate-50 border border-slate-205 pl-7 pr-2.5 py-1 rounded-lg text-slate-800 focus:outline-none focus:border-red-550"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {filteredAdminChannels.length > 0 ? (
                    filteredAdminChannels.map((item, idx) => {
                      return (
                        <div 
                          key={item.id + '-admin-' + idx}
                          className="flex items-center justify-between p-2 bg-slate-55 border border-slate-200 rounded-lg group hover:border-red-650/40 transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="relative">
                              {item.logo ? (
                                <img
                                  src={item.logo}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded bg-white p-0.5 object-contain border border-slate-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.admin-fallback');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`admin-fallback w-8 h-8 rounded flex items-center justify-center text-[10px] font-mono font-bold bg-slate-200 text-slate-600 border border-slate-300 ${item.logo ? 'hidden' : ''}`}>
                                {item.name.slice(0, 2).toUpperCase()}
                              </div>
                            </div>

                            <div className="min-w-0 font-sans">
                              <h4 className="text-[11px] font-extrabold text-slate-800 truncate group-hover:text-red-650 transition">
                                {highlightText(item.name, adminChannelSearch)}
                              </h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] text-slate-500 font-mono block truncate max-w-[150px]">
                                  {highlightText(item.group, adminChannelSearch)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[9px] font-mono text-slate-500 bg-white rounded border border-slate-200 px-1.5 py-0.5 block max-w-[120px] truncate" title={item.url}>
                              {item.url.slice(0, 30)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-8">
                      <Search className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-bold text-slate-650">No channels in matching index</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* 3. Developer Support / Donations Tab */}
          {adminActiveTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn text-left mt-1 font-sans">
              {/* Left Column Configurator */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 justify-between">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-red-655 animate-pulse" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                        Support Info Configurator / सहयोग विवरण नियन्त्रण
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Support Widget Globally */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Enable Live Support Widget</span>
                      <span className="text-[10px] text-slate-400">विज्ञापन जस्तै तल देखिने सहयोग सम्बन्धी जानकारीहरू र क्युआर कोडहरू देखाउने वा लुकाउने।</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateSupportConfig({ ...supportConfig, enabled: !supportConfig.enabled })}
                      className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                        supportConfig.enabled ? 'bg-red-650 justify-end' : 'bg-slate-350 justify-start'
                      }`}
                    >
                      <span className="bg-white w-5 h-5 rounded-full shadow-md transition-transform" />
                    </button>
                  </div>

                  {/* Widget Slogans Texts */}
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[11px] font-black uppercase text-red-655 tracking-wider font-mono block">
                        शीर्षक र नारा (Slogans & Title Lines)
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveSupportSlogans}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-705 active:scale-95 transition flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Save className="w-3 h-3" /> Save Titles
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 block uppercase">Support Board Title</label>
                        <input
                          type="text"
                          value={editSupportTitle}
                          onChange={(e) => setEditSupportTitle(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-red-500 text-slate-800 font-bold"
                          placeholder="Support NepalIPTV (सहयोग र डोनेशन)"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 block uppercase">Sponsor Description Line / Slogan Texts</label>
                        <textarea
                          rows={3}
                          value={editSupportDesc}
                          onChange={(e) => setEditSupportDesc(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-red-500 text-slate-700 leading-relaxed"
                          placeholder="हाम्रो सेवालाई सधैं निःशुल्क र सुचारु राख्नको लागि तपाईंको सानो सहयोग..."
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450 block uppercase font-mono">PayPal URL / लिङ्क</label>
                          <input
                            type="text"
                            value={editPaypalUrl}
                            onChange={(e) => setEditPaypalUrl(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-red-500 text-slate-800 font-mono"
                            placeholder="https://paypal.me/yourusername"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-450 block uppercase font-mono">Buy Me coffee URL / लिङ्क</label>
                          <input
                            type="text"
                            value={editCoffeeUrl}
                            onChange={(e) => setEditCoffeeUrl(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-red-500 text-slate-800 font-mono"
                            placeholder="https://buymeacoffee.com/yourusername"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nepalese Wallets (eSewa & Khalti List) */}
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-red-655 tracking-wider font-mono block">
                          नेपाली वालेटहरू (eSewa & Khalti Accounts)
                        </span>
                        <span className="text-[9px] bg-red-105 text-red-700 font-black px-1.5 py-0.5 rounded-full font-mono">
                          {editEsewaKhaltiList.length} Accounts
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveEsewaKhalti}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Save className="w-3 h-3" /> Save Wallets
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editEsewaKhaltiList.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white border text-left border-slate-200 p-3.5 rounded-xl space-y-3 relative shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-tight">
                              Account #{idx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Type switcher */}
                              <select
                                value={item.type}
                                onChange={(e) => {
                                  const updated = [...editEsewaKhaltiList];
                                  updated[idx] = { ...item, type: e.target.value as 'esewa' | 'khalti' };
                                  setEditEsewaKhaltiList(updated);
                                }}
                                className="text-[10px] font-bold border rounded bg-slate-50 px-1.5 py-0.5 text-slate-750 cursor-pointer"
                              >
                                <option value="esewa">eSewa</option>
                                <option value="khalti">Khalti</option>
                              </select>

                              {/* Remove Account */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (editEsewaKhaltiList.length <= 1) {
                                    triggerFeedback('err', 'न्यूनतम एक खाता हुनुपर्छ (At least one payment account is required)!');
                                    return;
                                  }
                                  const updated = editEsewaKhaltiList.filter((_, i) => i !== idx);
                                  setEditEsewaKhaltiList(updated);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition duration-200 cursor-pointer border-none bg-transparent"
                                title="Remove Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Wallet ID / Phone Number</label>
                              <input
                                type="text"
                                value={item.number}
                                onChange={(e) => {
                                  const updated = [...editEsewaKhaltiList];
                                  updated[idx] = { ...item, number: e.target.value };
                                  setEditEsewaKhaltiList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 font-mono text-slate-800 focus:bg-white"
                                placeholder="9861612345"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Account Holder Name</label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const updated = [...editEsewaKhaltiList];
                                  updated[idx] = { ...item, name: e.target.value };
                                  setEditEsewaKhaltiList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 text-slate-800 focus:bg-white"
                                placeholder="Full Name"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <PaymentQrSelector
                                idGroup={`esewa-khalti-${item.id || idx}`}
                                label="QR Code Image / स्क्यान क्युआर चित्र"
                                placeholder="Paste or upload image file below"
                                value={item.qr || ''}
                                onChange={(newQr) => {
                                  const updated = [...editEsewaKhaltiList];
                                  updated[idx] = { ...item, qr: newQr };
                                  setEditEsewaKhaltiList(updated);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditEsewaKhaltiList([
                          ...editEsewaKhaltiList,
                          { id: 'ek-' + Date.now(), type: 'esewa', number: '', name: '', qr: '' }
                        ]);
                      }}
                      className="w-full py-2 border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 text-xs font-bold rounded-xl active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Another eSewa / Khalti Account
                    </button>
                  </div>

                  {/* IPS Bank Details List */}
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-red-655 tracking-wider font-mono block">
                          बैंक ट्रान्सफर विवरण (IPS Bank Accounts)
                        </span>
                        <span className="text-[9px] bg-red-105 text-red-700 font-black px-1.5 py-0.5 rounded-full font-mono">
                          {editIpsBankList.length} Accounts
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveIpsBank}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-blue-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Save className="w-3 h-3" /> Save Banks
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editIpsBankList.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white border text-left border-slate-200 p-3.5 rounded-xl space-y-3 relative shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-tight">
                              Bank Account #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (editIpsBankList.length <= 1) {
                                  triggerFeedback('err', 'न्यूनतम एक बैंक खाता विवरण अनिवार्य छ (At least one bank account is required)!');
                                  return;
                                }
                                const updated = editIpsBankList.filter((_, i) => i !== idx);
                                setEditIpsBankList(updated);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition duration-200 cursor-pointer border-none bg-transparent"
                              title="Remove Bank"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Bank Name</label>
                              <input
                                type="text"
                                value={item.bankName}
                                onChange={(e) => {
                                  const updated = [...editIpsBankList];
                                  updated[idx] = { ...item, bankName: e.target.value };
                                  setEditIpsBankList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 text-slate-850 font-bold focus:bg-white"
                                placeholder="NIC Asia Bank"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Branch Location</label>
                              <input
                                type="text"
                                value={item.branch || ''}
                                onChange={(e) => {
                                  const updated = [...editIpsBankList];
                                  updated[idx] = { ...item, branch: e.target.value };
                                  setEditIpsBankList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 focus:bg-white"
                                placeholder="Kumaripati Branch"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Account Number</label>
                              <input
                                type="text"
                                value={item.accountNo}
                                onChange={(e) => {
                                  const updated = [...editIpsBankList];
                                  updated[idx] = { ...item, accountNo: e.target.value };
                                  setEditIpsBankList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 font-mono text-slate-850 focus:bg-white"
                                placeholder="1234567890123"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Account Name</label>
                              <input
                                type="text"
                                value={item.accountName}
                                onChange={(e) => {
                                  const updated = [...editIpsBankList];
                                  updated[idx] = { ...item, accountName: e.target.value };
                                  setEditIpsBankList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 text-slate-850 focus:bg-white"
                                placeholder="Full Name as in Bank"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <PaymentQrSelector
                                idGroup={`ips-bank-${item.id || idx}`}
                                label="IPS / Bank Scan QR Image / बैंक क्युआर चित्र"
                                placeholder="Paste or upload image file below"
                                value={item.qr || ''}
                                onChange={(newQr) => {
                                  const updated = [...editIpsBankList];
                                  updated[idx] = { ...item, qr: newQr };
                                  setEditIpsBankList(updated);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditIpsBankList([
                          ...editIpsBankList,
                          { id: 'ips-' + Date.now(), bankName: '', branch: '', accountNo: '', accountName: '', qr: '' }
                        ]);
                      }}
                      className="w-full py-2 border border-dashed border-blue-300 text-blue-750 bg-blue-50/40 hover:bg-blue-50 text-xs font-bold rounded-xl active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Another Bank Account Detail
                    </button>
                  </div>

                  {/* Crypto Wallet Lists */}
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-red-655 tracking-wider font-mono block">
                          क्रिप्टो वालेट ठेगानाहरू (Crypto Wallets Setup)
                        </span>
                        <span className="text-[9px] bg-red-105 text-red-700 font-black px-1.5 py-0.5 rounded-full font-mono">
                          {editCryptoList.length} Wallets
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveCryptoWallets}
                        className="px-3 py-1 bg-amber-605 text-white bg-amber-600 rounded-lg text-[10px] font-black uppercase hover:bg-amber-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <Save className="w-3 h-3" /> Save Crypto
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editCryptoList.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white border text-left border-slate-200 p-3.5 rounded-xl space-y-3 relative shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase font-mono tracking-tight">
                              Crypto Wallet Key #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (editCryptoList.length <= 1) {
                                  triggerFeedback('err', 'न्यूनतम एक क्रिप्टो ठेगाना हुनुपर्छ (At least one Crypto wallet address is required)!');
                                  return;
                                }
                                const updated = editCryptoList.filter((_, i) => i !== idx);
                                setEditCryptoList(updated);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition duration-200 cursor-pointer border-none bg-transparent"
                              title="Remove Crypto Wallet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Coin Token Symbol (e.g. USDT / BTC / ETH / SOL)</label>
                              <input
                                type="text"
                                value={item.coin}
                                onChange={(e) => {
                                  const updated = [...editCryptoList];
                                  updated[idx] = { ...item, coin: e.target.value.toUpperCase() };
                                  setEditCryptoList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 text-slate-800 font-bold uppercase focus:bg-white"
                                placeholder="USDT"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Wallet Public Address</label>
                              <input
                                type="text"
                                value={item.address}
                                onChange={(e) => {
                                  const updated = [...editCryptoList];
                                  updated[idx] = { ...item, address: e.target.value };
                                  setEditCryptoList(updated);
                                }}
                                className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded p-1.5 font-mono text-slate-800 focus:bg-white"
                                placeholder="0x..."
                              />
                            </div>
                            <div className="md:col-span-2">
                              <PaymentQrSelector
                                idGroup={`crypto-wallet-${item.id || idx}`}
                                label="Wallet Scan QR Image / वालेट क्युआर चित्र"
                                placeholder="Paste or upload image file below"
                                value={item.qr || ''}
                                onChange={(newQr) => {
                                  const updated = [...editCryptoList];
                                  updated[idx] = { ...item, qr: newQr };
                                  setEditCryptoList(updated);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditCryptoList([
                          ...editCryptoList,
                          { id: 'cy-' + Date.now(), coin: 'USDT', address: '', qr: '' }
                        ]);
                      }}
                      className="w-full py-2 border border-dashed border-amber-300 text-amber-700 bg-amber-50/40 hover:bg-amber-50 text-xs font-bold rounded-xl active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Another Crypto Wallet Address
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column Preview */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-6 font-sans">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-150 justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-805 font-mono">
                        REAL-TIME VIEWER PREVIEW
                      </h3>
                    </div>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black font-mono animate-pulse uppercase">LIVE PREVIEW</span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal text-justify font-sans">
                    The box below displays exactly how the active Support Board widget appears under the media player on all viewers' ends. Feel free to interact with it to check the automatic 10-second rotation loop.
                  </p>

                  <div className="border border-slate-200/80 rounded-xl p-4 bg-white relative overflow-hidden shadow-xs">
                    <div className="text-left space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                          <HeartHandshake className="w-4 h-4 text-red-655 animate-pulse" />
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-tight leading-none">
                              {supportConfig.title || "SUPPORT NEPALIPTV DEVELOPMENT"}
                            </h4>
                            <span className="text-[8px] text-red-605 bg-red-50 px-1 py-0.5 rounded font-bold uppercase tracking-wider mt-1 block w-max">सहयोग गर्नुहोस्</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-650 leading-relaxed font-sans text-justify">
                        {supportConfig.description}
                      </p>

                      {/* Simulated Live Rotator */}
                      <DonationRotator supportConfig={supportConfig} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
         </div>

        <footer className="border-t border-slate-200 bg-white py-3 mt-auto flex-shrink-0">
          <div className="mx-auto max-w-7xl px-4 md:px-6 flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            <span>© NEPALIPTV NET WORKSPACE v2.4</span>
            <span>TRANSMITTING ACTIVE ANALYTICS</span>
          </div>
        </footer>
      </main>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-red-600 selection:text-white pb-10">
      
      {/* Support Details Popup Modal (Requested feature) */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
        supportConfig={supportConfig} 
      />

      {/* Playback Settings Modal overlay */}
      {isSettingsOpen && (
        <div 
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm md:max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 font-mono">
                  PLAYBACK SETTINGS / सेटिङहरू
                </h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-705 bg-slate-105 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* List of Settings Options */}
            <div className="space-y-4 text-left">
              {/* Option 1: Auto-play Next Channel (Requested feature) */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                    📺 Auto-play Next Channel / स्वतः अर्को च्यानल
                  </span>
                  <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                    च्यानल बन्द हुँदा वा अवरोध/त्रुटि आउँदा सूचीको अर्को उपलब्ध च्यानल स्वतः लोड गर्ने र निरन्तर प्रसारण सुचारु राख्ने।
                    <span className="block mt-0.5 font-mono text-[9px] text-slate-400">(Automatically load the next channel when stream finishes or encounters playback failures.)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoplayNext}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer flex-shrink-0 transition-colors duration-300 ${
                    autoplayNext ? 'bg-red-650 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  aria-label="Toggle auto-play next"
                >
                  <span className="bg-white w-5 h-5 rounded-full shadow-md transition-transform" />
                </button>
              </div>

              {/* Option 2: Auto-hide Side Panel */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                    👉 Auto-hide Side Channel List / च्यानल सूची लुकाउनुहोस्
                  </span>
                  <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                    प्लेयरको अनुभव फराकिलो बनाउन च्यानल छनोट गरेपछि १० सेकेन्डभित्र दायाँपट्टीको सबै च्यानल सूची स्वतः लुकाइदिने।
                    <span className="block mt-0.5 font-mono text-[9px] text-slate-400">(Automatically hide sidebar panel after 10 seconds of viewport inactivity.)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSidebarAutohide(prev => {
                      const nv = !prev;
                      try {
                        localStorage.setItem('iptv_sidebar_autohide', nv ? 'true' : 'false');
                      } catch (e) {}
                      triggerFeedback('success', nv ? 'च्यानल सूची स्वतः लुक्ने भयो (Auto-hide ON)' : 'च्यानल सूची सधैँ देखिने भयो (Auto-hide OFF)');
                      return nv;
                    });
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer flex-shrink-0 transition-colors duration-300 ${
                    sidebarAutohide ? 'bg-red-650 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  aria-label="Toggle auto-hide sidebar"
                >
                  <span className="bg-white w-5 h-5 rounded-full shadow-md transition-transform" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4.5 py-1.5 bg-slate-900 hover:bg-black font-bold text-xs text-white rounded-xl transition cursor-pointer uppercase shadow"
              >
                Close / बन्द गर्नुहोस्
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* Collapsed Sidebar Hover / Click Restoration Slide Flap */}
      {!isSidebarOpen && (
        <div 
          onClick={resetSidebarTimer}
          onMouseEnter={resetSidebarTimer}
          className="fixed left-0 top-1/4 h-2/4 w-3.5 hover:w-7 bg-red-650/15 hover:bg-red-650/45 border-r border-y border-red-500/25 rounded-r-xl cursor-pointer z-50 flex flex-col items-center justify-center text-white transition-all duration-200 shadow-xl shadow-red-950/30 group backdrop-blur-sm"
          title="च्यानल सूची देखाउनुहोस् (Show Channel List)"
        >
          <ChevronRight className="w-4 h-4 text-red-500 group-hover:scale-125 transition duration-200 animate-pulse" />
          <span className="[writing-mode:vertical-lr] text-[9.5px] font-bold font-sans tracking-widest text-red-400 mt-3 select-none uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-205">
            च्यानलहरू (CHANNELS)
          </span>
        </div>
      )}

      {/* Top Warning Banner / Success Alerts */}
      {feedbackMsg && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm ml-4 transition-all duration-300 transform translate-y-0 text-xs font-semibold animate-pulse border ${
          feedbackMsg.type === 'success' 
            ? 'bg-white border-emerald-200 text-emerald-600' 
            : 'bg-white border-red-200 text-red-600 font-medium'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Hero Header bar of application - Immersive UI Theme */}
      <header className="h-16 border-b border-slate-200 flex items-center bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 flex items-center justify-between gap-4 h-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-100 font-bold text-white text-base select-none">
              📺
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 select-none">
              NEPAL<span className="text-red-600 font-extrabold">IPTV</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-semibold font-mono bg-slate-100 border border-slate-250 py-1.5 px-3 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse glowing-red-dot"></span>
              {channels.length > 0 ? `${channels.length.toLocaleString()} Streams Synced` : 'Loading Database...'}
            </div>

            {/* Secure Admin Lock Button */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 hover:border-red-500 hover:bg-red-500/10 hover:text-red-600 text-xs font-bold text-red-600 transition duration-155 active:scale-95 cursor-pointer"
              title="Admin Panel / विज्ञापन प्रबन्धक"
            >
              <Lock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Admin Portal</span>
            </button>

            {/* General Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-150/80 border border-slate-250 hover:bg-slate-200 text-slate-705 text-xs font-bold transition duration-155 active:scale-95 cursor-pointer group/setBtn"
              title="General Settings / सामान्य सेटिङहरू"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600 group-hover/setBtn:rotate-45 transition-transform duration-300" />
              <span>Settings</span>
            </button>
            
            <a 
              href="https://github.com/udayaraj35/iptv" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-red-500 hover:text-red-600 text-xs font-bold text-slate-600 transition duration-155 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-550 animate-pulse" />
              udayaraj35/iptv
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 transition-all duration-300">
        
        {/* Dynamic Grid Alignment */}
        <div className={`grid gap-6 transition-all duration-300 relative ${
          isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
        }`}>
          
          {/* LEFT SIDEBAR MODULE (ordered first on desktop, ordered last on mobile) */}
          <div 
            onMouseEnter={resetSidebarTimer}
            onMouseMove={resetSidebarTimer}
            onClick={resetSidebarTimer}
            className={`order-2 lg:order-1 transition-all duration-300 ${
              isTheaterMode 
                ? 'w-full grid md:grid-cols-2 lg:grid-cols-1 gap-6' 
                : !isSidebarOpen 
                  ? 'hidden lg:hidden' 
                  : 'lg:col-span-1'
            }`}
          >
            {isTheaterMode && (
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 shadow-lg space-y-3 h-full flex flex-col justify-center">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase text-red-500 font-mono">Theater Seat Expanded</h3>
                <p className="text-xs text-gray-400 text-justify leading-relaxed">
                  The video stage is placed on widescreen for premium dark immersive playback. 
                  Below you will find EPG search drawers, customized loading widgets, and channel history metrics. Everything matches YouTube interface specifications.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <span className="text-[10px] font-mono font-bold bg-[#050505] px-2.5 py-1 rounded border border-white/10 text-gray-300">
                    Pinned status: {favorites.length}/10
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#050505] px-2.5 py-1 rounded border border-white/10 text-gray-300">
                    Watch sequences: {history.length}
                  </span>
                </div>
              </div>
            )}
            
            <ChannelList 
              channels={channels}
              activeChannel={activeChannel}
              onSelectChannel={handleSelectChannel}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              history={history}
              currentPlaylistName={currentPlaylistName}
              onLoadPresetPlaylist={handleLoadPresetPlaylist}
              onLoadCustomM3U={handleLoadCustomM3U}
              onLoadRawM3UText={handleLoadRawM3UText}
              isLoading={isLoading}
            />
          </div>

          {/* RIGHT PLAYER MODULE (ordered first on mobile, ordered second on desktop) */}
          <div className={`order-1 lg:order-2 ${
            isTheaterMode 
              ? 'w-full' 
              : !isSidebarOpen 
                ? 'lg:col-span-3 w-full' 
                : 'lg:col-span-2'
          } space-y-6 flex flex-col`}>
            
            {activeChannel ? (
              <VideoPlayer 
                channel={activeChannel}
                isTheaterMode={isTheaterMode}
                onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                adConfig={adConfig}
                supportConfig={supportConfig}
                autoplayNext={autoplayNext}
                onToggleAutoplayNext={handleToggleAutoplayNext}
                onPlayNext={handlePlayNextChannel}
                onOpenSupportModal={() => setIsSupportModalOpen(true)}
              />
            
            ) : (
              <div className="w-full aspect-video bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-3 shadow-md">
                <MonitorPlay className="w-12 h-12 text-slate-300 animate-bounce" />
                <h3 className="text-base font-semibold text-slate-800">कुनै पनि च्यानल छानिएको छैन</h3>
                <p className="text-xs max-w-sm leading-relaxed text-slate-500">
                  बायाँ तर्फको सूचिबाट आफ्नो मनपर्ने टेलिभिजन च्यानल क्लिक गर्नुहोस् वा च्यानलहरूको लागि नयाँ IPTV .m3u लिंक थप्नुहोस्।
                </p>
              </div>
            )}

            {/* Sub player details (visible only below screen) */}
            {activeChannel && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">{activeChannel.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-md border border-emerald-100 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Quality: 1080p Auto
                      </span>
                      <span className="text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-mono">
                        {activeChannel.group}
                      </span>
                      {activeChannel.country && (
                        <span className="text-xs text-slate-600 border border-slate-200 bg-slate-50 px-2 py-1 rounded-md">
                          {activeChannel.country}
                        </span>
                      )}
                      {activeChannel.language && (
                        <span className="text-xs text-slate-500 font-mono">
                          • {activeChannel.language}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Share Button (Web Share API with Clipboard Fallback) */}
                    <button
                      onClick={() => handleShareChannel(activeChannel)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 text-xs font-bold rounded-lg cursor-pointer select-none transition active:scale-95"
                      title="Share this Channel / यो च्यानल सेयर गर्नुहोस्"
                    >
                      <Share2 className="w-3.5 h-3.5 text-red-650" />
                      <span>Share / सेयर गर्नुहोस्</span>
                    </button>

                    {/* Pin/Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(activeChannel.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer select-none transition ${
                        favorites.includes(activeChannel.id) 
                          ? 'bg-rose-50 border-rose-220 text-rose-600 fill-rose-50' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${favorites.includes(activeChannel.id) ? 'rotate-45 text-rose-500 fill-none text-rose-500' : ''}`} />
                      {favorites.includes(activeChannel.id) ? 'Pinned / पिन गरिएको' : 'Pin Channel / पिन गर्नुहोस्'}
                    </button>
                  </div>
                </div>

                {/* Beautiful support quick card near the share button / info panel */}
                {supportConfig.enabled && (
                  <div className="bg-gradient-to-r from-amber-50/60 via-slate-50 to-rose-50/40 p-3.5 rounded-xl border border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs animate-fadeIn hover:border-amber-200/60 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-700 border border-amber-200 flex-shrink-0">
                        <Coffee className="w-5 h-5 text-amber-650 animate-bounce" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[11px] font-mono font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                          PREMIUM SPONSORSHIP DESK / सहयोग डेस्क 
                          <span className="text-[8.5px] bg-red-100 border border-red-200 text-red-655 font-bold px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-0.5 font-bold leading-normal">
                          हाम्रो सेवा नि:शुल्क राख्न **PayPal, Buy Me A Coffee, वा eSewa** मार्फत जोडिनुहोस्।
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end">
                      {supportConfig.paypalUrl && (
                        <a 
                          href={supportConfig.paypalUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase rounded-lg border border-blue-500/20 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm select-none"
                        >
                          PayPal
                        </a>
                      )}
                      {supportConfig.coffeeUrl && (
                        <a 
                          href={supportConfig.coffeeUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-650 text-white font-black text-[10px] uppercase rounded-lg border border-amber-400/20 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm select-none"
                        >
                          Coffee ☕
                        </a>
                      )}
                      <button
                        onClick={() => setIsSupportModalOpen(true)}
                        className="px-2.5 py-1.5 bg-red-650 hover:bg-red-700 text-white font-black text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm select-none"
                      >
                        All (सबै र eSewa QR)
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed font-sans text-justify bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                  <span className="text-red-650 font-bold uppercase font-mono mr-1.5">ℹ️ DIRECT STREAM HUB:</span>
                  This television channel stream is loaded dynamically via Client HLS engine. The broadcast source URL is: <br />
                  <code className="text-[11px] bg-white px-2 py-1.5 rounded text-slate-700 font-mono mt-2 block break-all whitespace-pre-wrap select-all border border-slate-200/80">
                    {activeChannel.url}
                  </code>
                </p>
              </div>
            )}

            {/* Developer Support & Donations Rotator Board (सहयोग र डेभलपर डोनेशन - Moved right under player/info card) */}
            {supportConfig.enabled && (
              <div id="developer-support-section" className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn scroll-mt-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-red-650 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase font-mono tracking-tight flex items-center gap-1.5">
                        {supportConfig.title || "SUPPORT NEPALIPTV DEVELOPMENT"}
                        <span className="text-[9px] bg-red-100 text-red-655 border border-red-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">सहयोग गर्नुहोस्</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">यो औजार (tool) प्रयोगकर्ताहरूका लागि सधैं नि:शुल्क र बफर-मुक्त राख्न सहयोगी बन्नुहोस्।</p>
                    </div>
                  </div>
                  
                  {/* Slide controls or indicator */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center font-mono text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-1 rounded">
                    <span>ROTATING EVERY 35S</span>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                  </div>
                </div>

                <p className="text-xs text-slate-655 leading-relaxed font-sans text-justify bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                  {supportConfig.description || "हाम्रो सेवालाई सधैं निःशुल्क र सुचारु राख्नको लागि तपाईंको सानो सहयोग बहुमूल्य हुनेछ। (Your support helps keep our service free and uninterrupted.)"}
                </p>

                {/* Rotating Donation Grid - rotates every 35s */}
                <DonationRotator supportConfig={supportConfig} />

                {/* View All Methods Button (Requested features) */}
                <div className="flex justify-center pt-1 animate-fadeIn">
                  <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-705 hover:to-rose-700 text-white font-black text-xs uppercase rounded-xl tracking-wider transition hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md cursor-pointer select-none"
                  >
                    <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
                    <span>View All Support Methods / सबै सहयोग माध्यमहरू</span>
                  </button>
                </div>
              </div>
            )}

            {/* Help / Tips Drawer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Keyboard list */}
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs py-0.5 border-b border-slate-100 pb-2">
                  <Keyboard className="w-4 h-4 text-red-550" />
                  <span className="tracking-wide">KEYBOARD HOTKEYS (YouTube Mode)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono leading-relaxed">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Play/Pause:</span>
                    <kbd className="bg-slate-100 text-slate-700 px-1.5 rounded tracking-wide border border-slate-250 text-[10px]">SPACE / K</kbd>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Mute:</span>
                    <kbd className="bg-slate-100 text-slate-700 px-1.5 rounded tracking-wide border border-slate-250 text-[10px]">M</kbd>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Fullscreen:</span>
                    <kbd className="bg-slate-100 text-slate-700 px-1.5 rounded tracking-wide border border-slate-250 text-[10px]">F</kbd>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Theater:</span>
                    <kbd className="bg-slate-100 text-slate-700 px-1.5 rounded tracking-wide border border-slate-250 text-[10px]">T</kbd>
                  </div>
                </div>
              </div>

              {/* Troubleshooting of streams */}
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs py-0.5 border-b border-slate-100 pb-2">
                  <BookOpen className="w-4 h-4 text-red-550" />
                  <span className="tracking-wide">CORS & STREAM PLAYBACK TIPS</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-650 space-y-1.5 text-justify leading-relaxed font-sans">
                  <li>कुनै-कुनै च्यानलहरूको स्ट्रिम चल्न केहि सेकेन्ड लाग्न सक्छ। लोड नभए सम्म प्रतीक्षा गर्नुहोस्।</li>
                  <li>यदि धेरैजसो च्यानल लोड भएन भने त्यो ब्राउजरको <strong className="text-red-550 font-mono">CORS Restriction rules</strong> ले गर्दा कडा सुरक्षामा ब्लक गरिएको हुनसक्छ।</li>
                  <li>यसको सजिलो समाधान: <strong className="text-emerald-600 font-bold">"Allow CORS"</strong> extension ब्राउजरमा इन्स्टल गर्नुहोस्।</li>
                  <li>एक्सटेन्सन अन गरेपछि सबै राष्ट्रिय तथा अन्तर्राष्ट्रिय च्यानलहरू विना कुनै अवरोध चल्छन्।</li>
                </ul>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer credits and copyright */}
      <footer className="mt-16 border-t border-slate-200 bg-slate-50 pt-8 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-sans">
          <div className="text-center md:text-left">
            <p>Made with high-fidelity streaming layout and YouTube advanced controls.</p>
            <p className="mt-1">
              Inspired by <a href="https://github.com/udayaraj35/iptv" target="_blank" rel="noreferrer" className="text-slate-650 underline hover:text-red-550">udayaraj35/iptv</a> channel index.
            </p>
          </div>
          <div className="font-mono text-[10px] text-slate-400 font-sans">
            Powered by React 18 + Tailwind V4 + Hls.js Client Stream Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
