import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Heart, History, Globe, AlignLeft, 
  Download, Plus, Film, Radio, FileText, Settings, Loader2, Pin, PinOff, Play 
} from 'lucide-react';
import { Channel, AdConfig } from '../types';
import { publicPlaylists } from '../data/curatedChannels';

interface ChannelListProps {
  channels: Channel[];
  activeChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  favorites: string[];
  onToggleFavorite: (channelId: string) => void;
  history: string[];
  currentPlaylistName: string;
  onLoadPresetPlaylist: (name: string, url: string) => void;
  onLoadCustomM3U: (url: string) => void;
  onLoadRawM3UText: (text: string) => void;
  isLoading: boolean;
}

type TabType = 'channels' | 'favorites' | 'history' | 'playlists';

// Helper to resolve appropriate country flags visually
function getCountryFlag(countryName?: string): string {
  if (!countryName) return '📺';
  const lower = countryName.toLowerCase().trim();
  if (lower.includes('nepal') || lower.includes('np')) return '🇳🇵';
  if (lower.includes('india') || lower.includes('in')) return '🇮🇳';
  if (lower.includes('united states') || lower.includes('usa') || lower.includes('us')) return '🇺🇸';
  if (lower.includes('united kingdom') || lower.includes('uk') || lower.includes('gb')) return '🇬🇧';
  if (lower.includes('france') || lower.includes('fr')) return '🇫🇷';
  if (lower.includes('germany') || lower.includes('de')) return '🇩🇪';
  if (lower.includes('qatar') || lower.includes('qa')) return '🇶🇦';
  if (lower.includes('singapore') || lower.includes('sg')) return '🇸🇬';
  if (lower.includes('turkey') || lower.includes('tr')) return '🇹🇷';
  if (lower.includes('south korea') || lower.includes('kr')) return '🇰🇷';
  if (lower.includes('canada') || lower.includes('ca')) return '🇨🇦';
  if (lower.includes('australia') || lower.includes('au')) return '🇦🇺';
  if (lower.includes('china') || lower.includes('cn')) return '🇨🇳';
  if (lower.includes('japan') || lower.includes('jp')) return '🇯🇵';
  if (lower.includes('brazil') || lower.includes('br')) return '🇧🇷';
  if (lower.includes('italy') || lower.includes('it')) return '🇮🇹';
  if (lower.includes('spain') || lower.includes('es')) return '🇪🇸';
  if (lower.includes('russia') || lower.includes('ru')) return '🇷🇺';
  return '🌍';
}

export default function ChannelList({
  channels,
  activeChannel,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  history,
  currentPlaylistName,
  onLoadPresetPlaylist,
  onLoadCustomM3U,
  onLoadRawM3UText,
  isLoading
}: ChannelListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('channels');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  
  // Custom Playlist form state
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState<string>('');
  const [customRawText, setCustomRawText] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Single Stream Playground form state
  const [playgroundName, setPlaygroundName] = useState<string>('');
  const [playgroundUrl, setPlaygroundUrl] = useState<string>('');

  // Automatically reset filtering states whenever playlist changes
  useEffect(() => {
    setSelectedCountry('All Countries');
    setSelectedGroup('All');
    setSearchQuery('');
  }, [channels]);

  // Extract unique categories/groups for pills
  const groups = useMemo(() => {
    const list = new Set<string>();
    channels.forEach(ch => {
      if (ch.group) list.add(ch.group);
    });
    const sorted = Array.from(list).sort();
    
    // Prioritize "🏆 World Cup / Sports" right after "All" so it's super easy to locate
    const wcGroup = sorted.find(g => g.toLowerCase().includes('world cup'));
    if (wcGroup) {
      const remaining = sorted.filter(g => g !== wcGroup);
      return ['All', wcGroup, ...remaining];
    }
    return ['All', ...sorted];
  }, [channels]);

  // Extract unique countries in the playlist for dropdown support
  const countries = useMemo(() => {
    const list = new Set<string>();
    channels.forEach(ch => {
      if (ch.country && ch.country.trim()) {
        list.add(ch.country.trim());
      }
    });
    return ['All Countries', ...Array.from(list).sort()];
  }, [channels]);

  // Filter channels based on query, group, country and active tab
  const filteredChannels = useMemo(() => {
    let list = [...channels];

    // Filter by Tab
    if (activeTab === 'favorites') {
      list = list.filter(ch => favorites.includes(ch.id));
    } else if (activeTab === 'history') {
      list = list.filter(ch => history.includes(ch.id));
      // Sort history to match the viewing sequence
      list.sort((a, b) => history.indexOf(a.id) - history.indexOf(b.id));
    }

    // Filter by group-category pill
    if (selectedGroup !== 'All') {
      list = list.filter(ch => ch.group === selectedGroup);
    }

    // Filter by selected country (only relevant on main browse tab)
    if (activeTab === 'channels' && selectedCountry !== 'All Countries') {
      list = list.filter(ch => ch.country === selectedCountry);
    }

    // Filter by search text (checks channel name, category category, or country name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(ch => 
        ch.name.toLowerCase().includes(q) || 
        (ch.group && ch.group.toLowerCase().includes(q)) || 
        (ch.country && ch.country.toLowerCase().includes(q))
      );
    }

    return list;
  }, [channels, activeTab, selectedGroup, selectedCountry, searchQuery, favorites, history]);

  const handleCustomPlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadError(null);
    if (!customPlaylistUrl.trim()) {
      setLoadError("Please enter a valid M3U file URL.");
      return;
    }
    if (!customPlaylistUrl.startsWith('http://') && !customPlaylistUrl.startsWith('https://')) {
      setLoadError("Playlist URL must start with http:// or https://");
      return;
    }
    onLoadCustomM3U(customPlaylistUrl);
    setCustomPlaylistUrl('');
  };

  const handleRawTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadError(null);
    if (!customRawText.trim()) {
      setLoadError("Please paste some M3U content.");
      return;
    }
    onLoadRawM3UText(customRawText);
    setCustomRawText('');
  };

  const handlePlaygroundPlay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadError(null);
    if (!playgroundUrl.trim()) {
      setLoadError("सिम्युलेटर वा टेस्ट प्ले गर्न लिङ्क राख्नुहोस् (Please enter a stream link).");
      return;
    }
    
    const isUrl = playgroundUrl.trim().startsWith('http://') || playgroundUrl.trim().startsWith('https://');
    if (!isUrl) {
      setLoadError("स्ट्रिम लिङ्क http:// वा https:// बाट सुरु भएको हुनुपर्दछ (Stream link must start with http or https).");
      return;
    }

    const playChannel: Channel = {
      id: "playground_" + Date.now(),
      name: playgroundName.trim() || "Playground Test Live Stream",
      logo: null,
      url: playgroundUrl.trim(),
      group: "Live Stream Playground",
      country: "🌐 Custom Test"
    };

    onSelectChannel(playChannel);
    setActiveTab('channels');
  };

  return (
    <div id="sidebar-controls" className="w-full flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[500px] shadow-sm animate-fadeIn">
      
      {/* Current Playlist Banner */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-red-600 font-bold block">Loaded Playlist</span>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px]">
            {currentPlaylistName}
          </h3>
        </div>
        <div className="text-xs text-slate-600 font-mono bg-slate-150/80 px-2.5 py-1 rounded-md border border-slate-200 font-semibold shadow-xs">
          {channels.length} chs
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/40 p-1 gap-1">
        <button
          onClick={() => { setActiveTab('channels'); setSelectedGroup('All'); }}
          className={`flex-1 flex flex-col items-center py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'channels' 
              ? 'bg-white border border-slate-200 text-red-600 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Radio className="w-4 h-4 mb-1 text-red-550" />
          Browse (ब्राउज)
        </button>
        <button
          onClick={() => { setActiveTab('favorites'); setSelectedGroup('All'); }}
          className={`flex-1 flex flex-col items-center py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'favorites' 
              ? 'bg-white border border-slate-200 text-red-600 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Pin className={`w-4 h-4 mb-1 text-rose-500 ${activeTab === 'favorites' ? 'rotate-45' : ''}`} />
          Pinned ({favorites.length}/10)
        </button>
        <button
          onClick={() => { setActiveTab('history'); setSelectedGroup('All'); }}
          className={`flex-1 flex flex-col items-center py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'history' 
              ? 'bg-white border border-slate-200 text-red-600 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <History className="w-4 h-4 mb-1 text-red-555" />
          History
        </button>
        <button
          onClick={() => { setActiveTab('playlists'); setSelectedGroup('All'); }}
          className={`flex-1 flex flex-col items-center py-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-200 ${
            activeTab === 'playlists' 
              ? 'bg-white border border-slate-200 text-red-650 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Download className="w-4 h-4 mb-0.5 text-red-555" />
          Import
        </button>
      </div>

      {/* Playlist Custom Form / Quick Links */}
      {activeTab === 'playlists' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-slate-50/20 animate-fadeIn">
          {/* Stream Tester Playground */}
          <div className="p-3.5 rounded-xl bg-red-50/30 border border-red-200/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-550 animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-red-600 font-bold block">
                🚀 Live Stream Playground (च्यानल प्लेग्राउन्ड)
              </span>
            </div>
            <p className="text-[10.5px] text-slate-600 leading-relaxed text-justify">
              कुनै पनि एकल च्यानलको <span className="font-mono text-red-600 font-bold">.m3u8</span>, <span className="font-mono text-red-600 font-bold">.mp4</span> वा अन्य स्ट्रिम लिङ्क यहाँ राखेर सोझै प्ले गर्नुहोस्। यसले ब्राउजरको CORS सुरक्षा प्रतिबन्धहरू बाइपास गर्दछ।
            </p>
            <form onSubmit={handlePlaygroundPlay} className="space-y-2">
              <input
                type="text"
                placeholder="च्यानलको नाम (उदा: Live Nepali TV)"
                value={playgroundName}
                onChange={(e) => setPlaygroundName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 py-2 px-3 rounded-md text-slate-800 focus:outline-none focus:border-red-500 transition-colors shadow-xs"
              />
              <input
                type="url"
                placeholder="स्ट्रिम लिङ्क राख्नुहोस् (URL: https://...)"
                value={playgroundUrl}
                onChange={(e) => setPlaygroundUrl(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 py-2 px-3 rounded-md text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-red-550 transition-colors shadow-xs"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-200"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" /> Quick Play (प्ले गर्नुहोस्)
              </button>
            </form>
          </div>

          <hr className="border-slate-200/60" />

          {/* Presets Grid */}
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-2.5">Quick Playlists (from GitHub)</span>
            <div className="grid grid-cols-1 gap-2">
              {publicPlaylists.map((pres) => (
                <button
                  key={pres.name}
                  onClick={() => onLoadPresetPlaylist(pres.name, pres.url)}
                  disabled={isLoading}
                  className="p-3 text-left rounded-lg bg-white border border-slate-200 hover:border-red-500/40 transition group cursor-pointer flex flex-col justify-between shadow-xs hover:bg-slate-50/40"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-red-600 leading-tight transition">{pres.name}</span>
                    <Globe className="w-3.5 h-3.5 text-red-550 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug mt-1.5 line-clamp-2">
                    {pres.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-200/60" />

          {/* Form to submit custom M3U url */}
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-2">Import Custom M3U URL</span>
            <form onSubmit={handleCustomPlaylistSubmit} className="space-y-2">
              <input
                type="url"
                placeholder="https://example.com/stream.m3u"
                value={customPlaylistUrl}
                onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 py-2.5 px-3 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-550 focus:ring-1 focus:ring-red-550 shadow-xs"
              />
              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-red-100"
              >
                <Plus className="w-3.5 h-3.5" /> Fetch Playlist
              </button>
            </form>
          </div>

          <hr className="border-slate-200/60" />

          {/* Raw Text M3U Upload */}
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block mb-2 text-justify">Paste Raw M3U Content</span>
            <form onSubmit={handleRawTextSubmit} className="space-y-2">
              <textarea
                placeholder="#EXTM3U&#10;#EXTINF:-1,Channel 1&#10;https://example.com/stream.m3u8"
                value={customRawText}
                onChange={(e) => setCustomRawText(e.target.value)}
                rows={4}
                className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-red-550 focus:ring-1 focus:ring-red-550 shadow-xs"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 text-slate-705 font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-red-550" /> Parse M3U Text
              </button>
            </form>
          </div>

          {loadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-[11px] text-red-605 rounded-lg font-mono text-center">
              {loadError}
            </div>
          )}
        </div>
      ) : (
        // Search and browse content
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20">
          
          {/* Live Search and filters */}
          <div className="px-4 py-3 space-y-3 bg-slate-50/60 border-b border-slate-200/80 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'favorites' 
                    ? "Search favorites..." 
                    : activeTab === 'history' 
                      ? "Search watch history..." 
                      : "खोज्नुहोस् (उदा: Nepal, Sports, Space)..."
                }
                value={searchQuery}
                aria-label="Search channels"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-red-550 focus:ring-1 focus:ring-red-550 placeholder-slate-450 font-sans shadow-xs transition-shadow"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sub-group category pill selectors and Country Selector */}
            {activeTab === 'channels' && (
              <div className="space-y-2">
                {/* World Cup Zone Shortcut Banner */}
                {channels.some(c => c.group?.toLowerCase().includes('world cup')) && (
                  <div 
                    onClick={() => setSelectedGroup('🏆 World Cup / Sports')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${
                      selectedGroup === '🏆 World Cup / Sports' 
                        ? 'bg-gradient-to-r from-red-650 via-rose-600 to-orange-600 border-red-500 text-white shadow-md' 
                        : 'bg-[#fff5f5] hover:bg-[#ffebeb] border-[#ffd0d0] text-red-700 hover:text-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl animate-bounce">🏆</span>
                      <div className="min-w-0 text-left">
                        <span className="text-[11px] font-black uppercase tracking-wider block font-mono leading-none">
                          WORLD CUP DIRECTORY / विश्वकप खेलहरू
                        </span>
                        <span className="text-[9.5px] opacity-90 block truncate leading-tight mt-0.5 font-sans">
                          वर्ल्ड कप देखाउने सबै स्पोर्ट्स च्यानल हेर्नुहोस् (Choose channels)
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white border border-red-400 animate-pulse font-mono">
                      {channels.filter(c => c.group === '🏆 World Cup / Sports').length} Live
                    </div>
                  </div>
                )}

                {/* Horizontal Category Scroll */}
                <div className="flex gap-1 overflow-x-auto pb-1 max-w-full custom-scrollbar scrollbar-none select-none">
                  {groups.map((grp) => (
                    <button
                      key={grp}
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-3 py-1 border rounded-lg text-[10px] font-bold flex-shrink-0 cursor-pointer transition-all ${
                        selectedGroup === grp
                          ? 'bg-red-600 border-red-500 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>

                {/* Country Filter Dynamic Dropdown */}
                {countries.length > 2 && (
                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/80">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 whitespace-nowrap">देश (Country):</span>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="flex-1 text-xs bg-white border border-slate-200 py-1 px-2 rounded-md text-slate-800 focus:outline-none focus:border-red-500 font-sans cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      {countries.map((c) => {
                        const count = c === 'All Countries' 
                          ? channels.length 
                          : channels.filter(ch => ch.country === c).length;
                        return (
                          <option key={c} value={c} className="bg-[#0f0f0f] text-gray-200">
                            {c === 'All Countries' ? '🌍 All Countries' : `${getCountryFlag(c)} ${c}`} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center gap-2">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                <span className="text-[10px] text-slate-500 font-bold font-mono tracking-widest">FETCHING STREAM URLS...</span>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center text-slate-400">
                {activeTab === 'favorites' ? (
                  <>
                    <Pin className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs text-slate-600 font-bold">कुनै पनि च्यानल पिन गरिएको छैन</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                      च्यानलको दायाँ पट्टी रहेको पिन आइकनमा थिचेर बढीमा १० वटा सम्म च्यानल मनपर्ने सूचीमा पिन गर्नुहोस्!
                    </p>
                  </>
                ) : activeTab === 'history' ? (
                  <>
                    <History className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs text-slate-600 font-bold">No watch history detected</p>
                    <p className="text-[10px] text-slate-400 mt-1">Recently played stations list will compile here.</p>
                  </>
                ) : (
                  <>
                    <Search className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs text-slate-600 font-bold">No matches found</p>
                    <p className="text-[10px] text-slate-400 mt-1">Check spelling or reset country / category filters.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredChannels.map((ch, idx) => {
                  const isActive = activeChannel?.id === ch.id;
                  const isFavorited = favorites.includes(ch.id);

                  return (
                    <div
                      key={ch.id + '-' + idx}
                      className={`group rounded-lg p-2.5 flex items-center justify-between gap-3 transition-all duration-150 border cursor-pointer ${
                        isActive 
                          ? 'bg-red-50/80 border-red-200 shadow-inner' 
                          : 'bg-white border-slate-150 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Left Side: Logo & Name */}
                      <div 
                        onClick={() => onSelectChannel(ch)}
                        style={{ contentVisibility: 'auto' }}
                        className="flex-1 flex items-center gap-2.5 min-w-0"
                      >
                        <div className="relative flex-shrink-0">
                          {ch.logo ? (
                            <img
                              src={ch.logo}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-md bg-white p-0.5 object-contain border border-slate-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const placeholder = parent.querySelector('.fallback-node');
                                  if (placeholder) placeholder.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`fallback-node w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold border ${
                            isActive 
                              ? 'bg-red-630 border-red-500 text-white' 
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          } ${ch.logo ? 'hidden bg-slate-100' : ''}`}>
                            {ch.name.slice(0, 2).toUpperCase()}
                          </div>
                          
                          {/* Live overlay state */}
                          {isActive && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-600 border border-white rounded-full flex items-center justify-center glowing-red-dot">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold truncate leading-tight ${
                            isActive ? 'text-red-600 font-bold' : 'text-slate-800'
                          }`}>
                            {ch.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[9px] text-slate-500 group-hover:text-slate-600 font-mono block truncate">
                              {ch.group}
                            </span>
                            {ch.country && (
                              <span className="text-[8px] bg-slate-100 border border-slate-200/80 text-slate-600 px-1 py-0.5 rounded flex items-center gap-0.5 font-sans">
                                <span>{getCountryFlag(ch.country)}</span>
                                <span className="truncate max-w-[65px]">{ch.country}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Pin toggle button */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid triggering channel play on pin toggle click
                            onToggleFavorite(ch.id);
                          }}
                          aria-label={isFavorited ? "Remove pin" : "Pin channel"}
                          className={`p-1.5 rounded-lg hover:bg-slate-100 transition duration-155 cursor-pointer ${
                            isFavorited 
                              ? 'text-rose-500 fill-rose-500/10' 
                              : 'text-slate-400 hover:text-rose-500'
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isFavorited ? 'rotate-45' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
