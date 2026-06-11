import React, { useState } from 'react';
import { 
  X, Check, Copy, Heart, QrCode, Smartphone, Building, Coins, Info, ShieldCheck, Coffee, ExternalLink
} from 'lucide-react';
import { SupportConfig } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportConfig: SupportConfig;
}

export default function SupportModal({ isOpen, onClose, supportConfig }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'wallets' | 'bank' | 'crypto'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract list items from config
  const esewaKhalti = supportConfig.esewaKhaltiList || [];
  const ipsBanks = supportConfig.ipsBankList || [];
  const cryptos = supportConfig.cryptoList || [];

  // Local helper for clipboard copying
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const hasWallets = esewaKhalti.length > 0 || !!supportConfig.esewaNumber || !!supportConfig.khaltiNumber;
  const hasBanks = ipsBanks.length > 0 || !!supportConfig.ipsBankName;
  const hasCryptos = cryptos.length > 0 || [
    supportConfig.usdtAddress, supportConfig.usdcAddress, 
    supportConfig.btcAddress, supportConfig.ethAddress, supportConfig.solAddress
  ].some(addr => !!addr);

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-655 animate-pulse">
              <Heart className="w-5 h-5 fill-red-500 text-red-655" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase font-mono tracking-tight leading-none">
                {supportConfig.title || "SUPPORT NEPALIPTV DEVELOPMENT"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-none">सहयोग तथा प्रायोजन विवरणहरू (Official Support & Sponsorship Desk)</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-150 h-8 w-8 rounded-full flex items-center justify-center border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
            title="Close / बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative description banner */}
        <div className="px-5 py-3.5 bg-rose-50/50 border-b border-rose-100 flex items-start gap-2.5 text-left">
          <Info className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-rose-900 leading-normal">
              {supportConfig.description || "सेवालाई व्यावसायिक र लोड-मुक्त राख्न तपाईंको सहयोग अमूल्य हुनेछ।"}
            </p>
            <p className="text-[9.5px] text-slate-500 leading-normal font-mono">
              All contributions go directly towards high-performance VPS server maintenance, stream CDN pipelines, and continuous software optimization.
            </p>
          </div>
        </div>

        {/* Tab switcher buttons bar */}
        <div className="px-5 py-2.5 border-b border-slate-150 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-red-650 text-white shadow-md shadow-red-100/50' 
                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
            }`}
          >
            All Methods (सबै)
          </button>
          
          {hasWallets && (
            <button
              onClick={() => setActiveTab('wallets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'wallets' 
                  ? 'bg-emerald-650 text-white shadow-md shadow-emerald-100/50' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Wallets (वालेटहरू)
            </button>
          )}

          {hasBanks && (
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'bank' 
                  ? 'bg-indigo-650 text-white shadow-md shadow-indigo-100/50' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Bank Transfers (बैंक)
            </button>
          )}

          {hasCryptos && (
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'crypto' 
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-100/50' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
              }`}
            >
              <Coins className="w-3.5 h-3.5" /> Cryptocurrencies (क्रिप्टो)
            </button>
          )}
        </div>

        {/* Main interactive area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 custom-scrollbar text-left">
          
          {/* International Sponsorship Section */}
          {(supportConfig.paypalUrl || supportConfig.coffeeUrl) && (activeTab === 'all') && (
            <div className="bg-gradient-to-br from-slate-900 via-[#1E293B] to-slate-950 p-4.5 rounded-xl border border-slate-800 shadow-lg text-white space-y-3.5 mb-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-rose-500/20">
                <Coffee className="w-4 h-4 text-rose-400 animate-bounce" />
                <div>
                  <h4 className="text-[10.5px] font-black uppercase text-slate-205 font-mono tracking-wider">INTERNATIONAL SPONSORSHIPS / अन्तर्राष्ट्रिय सहयोग</h4>
                  <p className="text-[9px] text-slate-400">Support NepalIPTV from anywhere outside Nepal securely</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {supportConfig.paypalUrl && (
                  <a 
                    href={supportConfig.paypalUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between gap-3 p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black font-mono text-[13px] tracking-tight text-white shadow-md">
                        Py
                      </div>
                      <div>
                        <span className="text-xs font-extrabold block group-hover:text-blue-400 transition">PayPal Account</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Send custom amounts</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                  </a>
                )}

                {supportConfig.coffeeUrl && (
                  <a 
                    href={supportConfig.coffeeUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-sm shadow-md">
                        ☕
                      </div>
                      <div>
                        <span className="text-xs font-extrabold block group-hover:text-amber-400 transition">Buy me a Coffee</span>
                        <span className="text-[9px] text-slate-400 block font-mono">support the development</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Mobile wallets layout */}
          {(activeTab === 'all' || activeTab === 'wallets') && hasWallets && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black tracking-widest text-slate-405 font-mono uppercase">MOBILE WALLET DESTINATIONS / मोबाइल वालेटहरू</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {esewaKhalti.length > 0 ? (
                  esewaKhalti.map((item, index) => {
                    const uniqueId = `wallet-${item.id}-${index}`;
                    return (
                      <div key={uniqueId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative flex flex-col justify-between gap-3 hover:border-emerald-450/40 transition">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-black uppercase flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${item.type === 'esewa' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                              {item.type === 'esewa' ? 'eSewa Merchant' : 'Khalti Wallet'}
                            </span>
                            <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ${
                              item.type === 'esewa' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              A/C {index + 1}
                            </span>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider font-mono">Account Phone (ID)</span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-md px-2 py-1 mt-0.5">
                                <code className="text-[11px] font-mono font-bold text-slate-800">{item.number}</code>
                                <button 
                                  onClick={() => handleCopy(item.number, uniqueId + '-num')}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 transition"
                                >
                                  {copiedId === uniqueId + '-num' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider font-mono">Account Name</span>
                              <span className="text-xs font-extrabold text-slate-700 block">{item.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable QR section inside wallet card */}
                        {item.qr && (
                          <div className="border-t border-slate-100 pt-2.5 mt-1">
                            <button
                              onClick={() => setExpandedQrId(expandedQrId === uniqueId ? null : uniqueId)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-600 text-[10.5px] font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              {expandedQrId === uniqueId ? 'Hide QR Code' : 'Scan QR Code'}
                            </button>
                            
                            {expandedQrId === uniqueId && (
                              <div className="flex justify-center pt-3 animate-fadeIn">
                                <div className="p-2 border border-slate-200 bg-white rounded-xl shadow-inner max-w-[170px] aspect-square">
                                  <img 
                                    src={item.qr} 
                                    alt="QR Code" 
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* Fallback legacy support accounts */}
                    {supportConfig.esewaNumber && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative flex flex-col justify-between gap-3 hover:border-emerald-450/40 transition">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-black uppercase flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              eSewa Pay
                            </span>
                            <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">PRIMARY</span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-bold font-mono">eSewa ID</span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-md px-2 py-1 mt-0.5 font-mono">
                                <code className="text-[11px] font-bold text-slate-800">{supportConfig.esewaNumber}</code>
                                <button
                                  onClick={() => handleCopy(supportConfig.esewaNumber || '', 'esewa-legacy-copy')}
                                  className="text-slate-405 hover:text-slate-700"
                                >
                                  {copiedId === 'esewa-legacy-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-bold font-mono text-left">Account Holder</span>
                              <span className="text-xs font-extrabold text-slate-700">{supportConfig.esewaName}</span>
                            </div>
                          </div>
                        </div>

                        {supportConfig.esewaQr && (
                          <div className="border-t border-slate-100 pt-2 text-left">
                            <button
                              onClick={() => setExpandedQrId(expandedQrId === 'esewa-leg' ? null : 'esewa-leg')}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10.5px] font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              {expandedQrId === 'esewa-leg' ? 'Hide QR Code' : 'Scan QR Code'}
                            </button>
                            {expandedQrId === 'esewa-leg' && (
                              <div className="flex justify-center pt-2.5 animate-fadeIn">
                                <div className="p-2 border border-slate-200 bg-white rounded-xl bg-slate-50 max-w-[150px]">
                                  <img src={supportConfig.esewaQr} alt="eSewa QR" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {supportConfig.khaltiNumber && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative flex flex-col justify-between gap-3 hover:border-indigo-400/40 transition">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-black uppercase flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              Khalti Pay
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-mono">Khalti ID</span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-md px-2 py-1 mt-0.5 font-mono">
                                <code className="text-[11px] font-bold text-slate-800">{supportConfig.khaltiNumber}</code>
                                <button
                                  onClick={() => handleCopy(supportConfig.khaltiNumber || '', 'khalti-legacy-copy')}
                                  className="text-slate-405 hover:text-slate-700"
                                >
                                  {copiedId === 'khalti-legacy-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-mono text-left">Account Holder</span>
                              <span className="text-xs font-extrabold text-slate-700">{supportConfig.khaltiName}</span>
                            </div>
                          </div>
                        </div>

                        {supportConfig.khaltiQr && (
                          <div className="border-t border-slate-100 pt-2 text-left">
                            <button
                              onClick={() => setExpandedQrId(expandedQrId === 'khalti-leg' ? null : 'khalti-leg')}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10.5px] font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              {expandedQrId === 'khalti-leg' ? 'Hide QR Code' : 'Scan QR Code'}
                            </button>
                            {expandedQrId === 'khalti-leg' && (
                              <div className="flex justify-center pt-2.5 animate-fadeIn">
                                <div className="p-2 border border-slate-200 bg-white rounded-xl max-w-[150px]">
                                  <img src={supportConfig.khaltiQr} alt="Khalti QR" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Banks (IPS) */}
          {(activeTab === 'all' || activeTab === 'bank') && hasBanks && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] font-black tracking-widest text-slate-405 font-mono uppercase">BANK TRANSFERS (NPS / IPS) / बैंक खाता विवरणहरू</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ipsBanks.length > 0 ? (
                  ipsBanks.map((item, index) => {
                    const uniqueId = `bank-${item.id}-${index}`;
                    return (
                      <div key={uniqueId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative flex flex-col justify-between gap-3 hover:border-indigo-500/20 transition">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-extrabold text-slate-800 block truncate max-w-[180px]" title={item.bankName}>
                              🏦 {item.bankName}
                            </span>
                            <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">BANK</span>
                          </div>

                          <div className="mt-3.5 space-y-3">
                            {item.branch && (
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Branch office</span>
                                <span className="text-[11px] font-bold text-slate-600 block mt-1">{item.branch}</span>
                              </div>
                            )}

                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Account Number</span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-md px-2 py-1 mt-1 font-mono">
                                <code className="text-[11px] font-bold text-slate-850">{item.accountNo}</code>
                                <button
                                  onClick={() => handleCopy(item.accountNo, uniqueId + '-no')}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  {copiedId === uniqueId + '-no' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-mono leading-none">Account Name</span>
                              <span className="text-[11.5px] font-black text-slate-700 block mt-1">{item.accountName}</span>
                            </div>
                          </div>
                        </div>

                        {item.qr && (
                          <div className="border-t border-slate-150 pt-3 mt-1.5 text-left">
                            <button
                              onClick={() => setExpandedQrId(expandedQrId === uniqueId ? null : uniqueId)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-indigo-705 text-[10.5px] font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              {expandedQrId === uniqueId ? 'Hide Account QR' : 'Show Account QR'}
                            </button>
                            {expandedQrId === uniqueId && (
                              <div className="flex justify-center pt-2.5 animate-fadeIn">
                                <div className="p-2 border border-slate-200 bg-white rounded-xl max-w-[150px]">
                                  <img src={item.qr} alt="Bank QR" className="w-full h-full object-contain overflow-hidden" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <>
                    {supportConfig.ipsBankName && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative flex flex-col justify-between gap-3 hover:border-indigo-500/20 transition col-span-2">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800">🏦 {supportConfig.ipsBankName}</span>
                            <span className="text-[9px] font-bold bg-indigo-55 text-indigo-700 px-1.5 py-0.5 rounded">BANK TRANSFER</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                            {supportConfig.ipsBranch && (
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-mono">Branch Office</span>
                                <span className="text-xs font-bold text-slate-705">{supportConfig.ipsBranch}</span>
                              </div>
                            )}

                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-mono">Account Number</span>
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-205 px-2 py-1 mt-0.5 font-mono">
                                <code className="text-xs font-bold text-slate-800">{supportConfig.ipsAccountNo}</code>
                                <button
                                  onClick={() => handleCopy(supportConfig.ipsAccountNo || '', 'bank-legacy-copy')}
                                  className="text-slate-405 hover:text-slate-700"
                                >
                                  {copiedId === 'bank-legacy-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <span className="text-[9px] text-slate-400 block uppercase font-mono">Account Holder Name</span>
                              <span className="text-xs font-extrabold text-slate-800 block">{supportConfig.ipsAccountName}</span>
                            </div>
                          </div>
                        </div>

                        {supportConfig.ipsQr && (
                          <div className="border-t border-slate-100 pt-3 text-left">
                            <button
                              onClick={() => setExpandedQrId(expandedQrId === 'bank-leg' ? null : 'bank-leg')}
                              className="w-[180px] flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10.5px] font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              {expandedQrId === 'bank-leg' ? 'Hide QR Code' : 'Scan QR Code'}
                            </button>
                            {expandedQrId === 'bank-leg' && (
                              <div className="flex justify-center pt-2.5 animate-fadeIn">
                                <div className="p-2 border border-slate-200 bg-white rounded-xl max-w-[150px]">
                                  <img src={supportConfig.ipsQr} alt="Bank QR" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Crypto addresses layout */}
          {(activeTab === 'all' || activeTab === 'crypto') && hasCryptos && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] font-black tracking-widest text-slate-405 font-mono uppercase">CRYPTOCURRENCY WALLETS / क्रिप्टो विवरणहरू</h4>
              <div className="space-y-2.5">
                {cryptos.length > 0 ? (
                  cryptos.map((item, index) => {
                    const uniqueId = `crypto-${item.id}-${index}`;
                    return (
                      <div key={uniqueId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-amber-500/25 transition">
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                            🪙 {item.coin || 'Unknown Coin'}
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <code className="text-[10.5px] text-slate-700 bg-slate-50 border border-slate-200/60 rounded px-2.5 py-1.5 block font-mono break-all select-all flex-1 text-left leading-relaxed">
                              {item.address}
                            </code>
                            <button
                              onClick={() => handleCopy(item.address, uniqueId + '-addr')}
                              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 rounded-lg border border-slate-200 flex-shrink-0 transition cursor-pointer"
                              title="Copy / प्रतिलिपि गर्नुहोस्"
                            >
                              {copiedId === uniqueId + '-addr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {item.qr && (
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => setExpandedQrId(expandedQrId === uniqueId ? null : uniqueId)}
                              className="h-10 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <QrCode className="w-4 h-4" />
                              {expandedQrId === uniqueId ? 'Hide QR Code' : 'QR Code'}
                            </button>
                            {expandedQrId === uniqueId && (
                              <div className="absolute right-6 bg-white border border-slate-200 p-2 rounded-xl shadow-xl z-50 mt-1.5 animate-fadeIn max-w-[120px] aspect-square">
                                <img src={item.qr} alt="Crypto QR" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* Fallback legacy crypto coins */}
                    {[
                      { coin: 'USDT (TRC-20)', address: supportConfig.usdtAddress },
                      { coin: 'USDC (ERC-20)', address: supportConfig.usdcAddress },
                      { coin: 'Bitcoin (BTC)', address: supportConfig.btcAddress },
                      { coin: 'Ethereum (ETH)', address: supportConfig.ethAddress },
                      { coin: 'Solana (SOL)', address: supportConfig.solAddress },
                    ].filter(c => !!c.address).map((item, idx) => {
                      const uniqueId = `crypto-legacy-${idx}`;
                      return (
                        <div key={uniqueId} className="bg-white border border-slate-205 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400/25 transition">
                          <div className="font-mono min-w-0 flex-1 text-left">
                            <span className="text-[10px] bg-amber-100/40 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">{item.coin}</span>
                            <div className="flex items-center gap-2 mt-2">
                              <code className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 p-1.5 rounded block break-all flex-1 select-all">{item.address}</code>
                              <button
                                onClick={() => handleCopy(item.address || '', uniqueId)}
                                className="p-1.5 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition"
                              >
                                {copiedId === uniqueId ? <Check className="w-3.5 h-3.5 text-emerald-555" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-emerald-55 border border-emerald-200/50 py-1 px-2.5 rounded-full text-[10px] text-emerald-800 font-black tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 animate-pulse" />
            <span>Secure Official Transfer / सुरक्षित आधिकारिक च्यानल</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer select-none active:scale-95"
          >
            Done / बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
}
