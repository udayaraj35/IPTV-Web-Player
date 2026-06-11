import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Loader, Tv, Zap, RefreshCw, Info, AppWindow,
  Copy, Check, ExternalLink
} from 'lucide-react';
import { Channel, PlaybackStats, AdConfig, SupportConfig } from '../types';

interface VideoPlayerProps {
  channel: Channel;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
  adConfig: AdConfig;
  supportConfig?: SupportConfig;
  autoplayNext: boolean;
  onToggleAutoplayNext: () => void;
  onPlayNext: () => void;
  onOpenSupportModal?: () => void;
}

export default function VideoPlayer({ 
  channel, 
  isTheaterMode, 
  onToggleTheater, 
  adConfig,
  supportConfig,
  autoplayNext,
  onToggleAutoplayNext,
  onPlayNext,
  onOpenSupportModal
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const savedVolume = localStorage.getItem('iptv_volume_level');
      return savedVolume !== null ? parseFloat(savedVolume) : 0.8;
    } catch (e) {
      return 0.8;
    }
  });
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackErrorCode, setPlaybackErrorCode] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [useStreamProxy, setUseStreamProxy] = useState<boolean>(false);
  const [proxyIndex, setProxyIndex] = useState<number>(0);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);

  // Floating mini-player state
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);
  const [isMiniDismissed, setIsMiniDismissed] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Advertisement system states
  const [adPlaying, setAdPlaying] = useState<boolean>(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState<number>(0);
  const [isBannerAdDismissed, setIsBannerAdDismissed] = useState<boolean>(false);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const lastAdChannelIdRef = useRef<string | null>(null);

  // Find current active ad
  const getActiveAd = React.useCallback(() => {
    let activeList: any[] = [];
    if (adConfig.ads && adConfig.ads.length > 0) {
      activeList = [...adConfig.ads];
    } else {
      activeList = [
        {
          id: "fallback",
          videoUrl: adConfig.videoUrl || "",
          bannerUrl: adConfig.bannerUrl || "",
          bannerLink: adConfig.bannerLink || "",
          bannerTitle: adConfig.bannerTitle || "NepalIPTV Premium Partner",
          bannerText: adConfig.bannerText || "Explore premium high-speed local streams, dedicated hosting, and ad-free priority pipelines.",
          duration: adConfig.duration || 10,
          skipAfter: adConfig.skipAfter || 5,
        }
      ];
    }

    if (supportConfig && supportConfig.enabled) {
      activeList.push({
        id: "developer-donation-campaign",
        videoUrl: "", // empty videoUrl means a pure sponsor banner, which won't block playback with a preroll
        duration: 8,
        skipAfter: 1,
        bannerUrl: supportConfig.esewaQr || "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=80",
        bannerLink: "#developer-support-section",
        bannerTitle: supportConfig.title || "Support NepalIPTV (सहयोग गर्नुहोस्)",
        bannerText: `eSewa Number / Khalti: ${supportConfig.esewaNumber} | Account Holder: ${supportConfig.esewaName} | Click to view support addresses QR!`
      });
    }

    const idx = currentAdIndex % activeList.length;
    return activeList[idx];
  }, [adConfig, supportConfig, currentAdIndex]);

  const activeAd = getActiveAd();

  // Reset proxy setting synchronously when loading a new channel to avoid stale proxy state
  const lastChannelIdRef = useRef<string>('');
  if (lastChannelIdRef.current !== channel.id) {
    lastChannelIdRef.current = channel.id;
    setUseStreamProxy(false);
    setProxyIndex(0);
    setIsBannerAdDismissed(false);
  }

  // Save volume to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('iptv_volume_level', volume.toString());
    } catch (e) {
      console.warn("Could not save volume to localStorage:", e);
    }
  }, [volume]);

  // Auto-show/refresh banner ad every 10 seconds and rotate automatically
  useEffect(() => {
    if (!adConfig.enabled) return;
    const interval = setInterval(() => {
      setIsBannerAdDismissed(false);
      if (adConfig.ads && adConfig.ads.length > 1) {
        setCurrentAdIndex((prev) => (prev + 1) % adConfig.ads!.length);
      }
    }, 10000); // 10 seconds rotation
    return () => clearInterval(interval);
  }, [adConfig.enabled, adConfig.ads]);

  // Pre-roll ad effect trigger
  useEffect(() => {
    if (adConfig.enabled && channel && channel.id !== lastAdChannelIdRef.current) {
      lastAdChannelIdRef.current = channel.id;
      setAdPlaying(true);
      const currentActiveAd = getActiveAd();
      setAdTimeRemaining(currentActiveAd.duration);
    } else if (!adConfig.enabled) {
      setAdPlaying(false);
    }
  }, [channel, adConfig.enabled, getActiveAd]);

  // Monitor Ad seconds countdown tick
  useEffect(() => {
    if (!adPlaying) return;

    // Play ad video node asynchronously
    const adv = adVideoRef.current;
    if (adv) {
      adv.volume = volume;
      adv.muted = isMuted;
      adv.play().catch(e => console.warn("Ad auto-play warning:", e));
    }

    const interval = setInterval(() => {
      setAdTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [adPlaying, volume, isMuted]);

  // Monitor intersection to see if the user has scrolled past the main video player
  useEffect(() => {
    // If in fullscreen, theater mode, or dismissed, don't trigger mini-player
    if (isFullscreen || isTheaterMode || isMiniDismissed) {
      setIsMiniPlayer(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the main player area is fully out of view (scrolled above viewport)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsMiniPlayer(true);
        } else {
          setIsMiniPlayer(false);
        }
      },
      { threshold: 0 }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isFullscreen, isTheaterMode, isMiniDismissed]);

  // Reset mini-player dismissed state when switching channels
  useEffect(() => {
    setIsMiniDismissed(false);
    setIsMiniPlayer(false);
  }, [channel]);

  // Handle default bottom-right positioning of mini-player on activation
  useEffect(() => {
    if (isMiniPlayer) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const playerWidth = width < 768 ? 320 : 380;
      const playerHeight = playerWidth * (9 / 16);
      setPosition({
        x: width - playerWidth - 24, // 24px off the right edge
        y: height - playerHeight - 24 // 24px off the bottom edge
      });
    }
  }, [isMiniPlayer]);

  // Pointer-based draggable overlay handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMiniPlayer) return;
    
    const target = e.target as HTMLElement;
    // Do not drag if clicked on interactive elements
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('input') || 
      target.closest('select') || 
      target.closest('.interactive-control')
    ) {
      return;
    }

    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isMiniPlayer) return;
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Bounds clamping
    const playerWidth = window.innerWidth < 768 ? 320 : 380;
    const playerHeight = playerWidth * (9 / 16);
    const maxX = window.innerWidth - playerWidth - 10;
    const maxY = window.innerHeight - playerHeight - 10;

    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY))
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const restorePlayerInstance = () => {
    setIsMiniPlayer(false);
    if (placeholderRef.current) {
      placeholderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getProxiedUrl = (targetUrl: string) => {
    const proxies = [
      '/api/proxy?url=',
      'https://corsproxy.io/?url=',
      'https://api.allorigins.win/raw?url='
    ];
    const prefix = proxies[proxyIndex % proxies.length];
    return `${prefix}${encodeURIComponent(targetUrl)}`;
  };
  
  const retryCountRef = useRef<number>(0);
  
  // Custom HUD feedback for hotkeys
  const [hudFeedback, setHudFeedback] = useState<{ icon: string; text: string } | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stats for Nerds
  const [stats, setStats] = useState<PlaybackStats>({
    resolution: '0x0',
    codec: 'Unknown',
    bufferLength: 0,
    droppedFrames: 0,
    connectionSpeed: 'Good'
  });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 2500);
  };

  const triggerHud = (icon: string, text: string) => {
    setHudFeedback({ icon, text });
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => setHudFeedback(null), 850);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside target text inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          onToggleTheater();
          triggerHud('📺', isTheaterMode ? 'Standard Mode' : 'Theater Mode');
          break;
        case 's':
          e.preventDefault();
          setShowStats(prev => !prev);
          triggerHud('📊', !showStats ? 'Stats Enabled' : 'Stats Disabled');
          break;
        case 'p':
          e.preventDefault();
          handlePictureInPicture();
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => {
            const nv = Math.min(1, prev + 0.1);
            if (videoRef.current) {
              videoRef.current.volume = nv;
              videoRef.current.muted = nv === 0;
            }
            triggerHud('🔊', `Volume ${Math.round(nv * 100)}%`);
            return nv;
          });
          setIsMuted(false);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => {
            const nv = Math.max(0, prev - 0.1);
            if (videoRef.current) {
              videoRef.current.volume = nv;
              videoRef.current.muted = nv === 0;
            }
            triggerHud('🔉', `Volume ${Math.round(nv * 100)}%`);
            return nv;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [isPlaying, isMuted, volume, isTheaterMode, showStats, isPipActive]);

  // Reset proxy setting when loading a new channel & clear pending autoplay timers
  useEffect(() => {
    setUseStreamProxy(false);
    setProxyIndex(0);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  }, [channel]);

  // Helper to schedule autoplay of the next channel in sequence
  const scheduleAutoplayNext = () => {
    if (!autoplayNext) return;
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    triggerHud('➡️', 'Auto-play Next...');
    autoplayTimeoutRef.current = setTimeout(() => {
      onPlayNext();
    }, 4500); // 4.5 seconds fallback delay so that audience has a moment to read error or interact
  };

  // Monitor Fullscreen status
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Monitor Picture in Picture status from native video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPip = () => {
      setIsPipActive(true);
    };

    const onLeavePip = () => {
      setIsPipActive(false);
    };

    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, []);

  // Update Stats periodically
  useEffect(() => {
    const statsInterval = setInterval(() => {
      const vid = videoRef.current;
      if (!vid) return;

      let resolution = `${vid.videoWidth}x${vid.videoHeight}`;
      if (resolution === '0x0') resolution = 'Detecting...';

      let dropped = 0;
      // Extract dropped frames if API exists
      if (vid.getVideoPlaybackQuality) {
        dropped = vid.getVideoPlaybackQuality().droppedVideoFrames;
      } else if ((vid as any).webkitDroppedFrameCount) {
        dropped = (vid as any).webkitDroppedFrameCount;
      }

      // Buffer size calculation
      let bufferLen = 0;
      const buffered = vid.buffered;
      const current = vid.currentTime;
      if (buffered && buffered.length > 0) {
        for (let i = 0; i < buffered.length; i++) {
          if (current >= buffered.start(i) && current <= buffered.end(i)) {
            bufferLen = buffered.end(i) - current;
            break;
          }
        }
      }

      let speedIndicator = 'Detecting';
      if (hlsRef.current) {
        const bandwidth = hlsRef.current.bandwidthEstimate;
        if (bandwidth) {
          speedIndicator = `${(bandwidth / 1000000).toFixed(2)} Mbps`;
        }
      }

      setStats({
        resolution,
        codec: hlsRef.current ? 'HLS (AVC/H.264)' : 'Native HTML5 Player',
        bufferLength: Math.round(bufferLen * 10) / 10,
        droppedFrames: dropped,
        connectionSpeed: speedIndicator
      });
    }, 1500);

    return () => clearInterval(statsInterval);
  }, [channel]);

  // Handle HLS & direct stream setup on channel change or manual retry
  useEffect(() => {
    // If advertisement is currently playing, hold loading of main channel stream
    if (adPlaying) return;

    const video = videoRef.current;
    if (!video) return;

    // Reset playback states
    setPlaybackError(null);
    setPlaybackErrorCode(null);
    setIsBuffering(true);
    setIsPlaying(false);
    retryCountRef.current = 0;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Fully reload previous sources from browser buffers to prevent sticky frame display (fixes "wrong channel playing" issue!)
    video.pause();
    video.removeAttribute('src');
    try {
      video.load();
    } catch (e) {}

    const playStream = () => {
      video.play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(err => {
          console.warn('Playback error or user gesture constraint:', err);
          setIsPlaying(false);
          setIsBuffering(false);
        });
    };

    // Calculate active URL either direct or via CORS-Proxy
    const activeStreamUrl = useStreamProxy
      ? getProxiedUrl(channel.url)
      : channel.url;

    // Check if the source is an m3u8 file
    const isHls = channel.url.toLowerCase().includes('.m3u8') || channel.url.toLowerCase().includes('manifest');

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingMaxRetry: 4,
          levelLoadingMaxRetry: 4,
          xhrSetup: (xhr, url) => {
            if (useStreamProxy) {
              // Route all sub-manifests and video segments through the bypass proxy
              const containsProxy = url.includes('corsproxy.io') || url.includes('corsProxy.io') || url.includes('allorigins.win') || url.includes('/api/proxy');
              if (!containsProxy) {
                const proxyUrl = getProxiedUrl(url);
                xhr.open('GET', proxyUrl, true);
              }
            }
          }
        });
        hlsRef.current = hls;

        hls.loadSource(activeStreamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          playStream();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            const responseCode = data.response?.code;
            if (responseCode) {
              setPlaybackErrorCode(responseCode);
            }

            // If we haven't tried proxying yet, self-recover using proxy FIRST for all kinds of fatal loading/network/cors errors!
            if (!useStreamProxy) {
              console.warn('Recoverable HLS error. Attempting CORS proxy bypass...', data.type, data.details);
              setUseStreamProxy(true);
              triggerHud('🔌', 'Engaging CORS Proxy...');
              hls.destroy();
              return;
            }

            // If we are already using the proxy but still encounter errors, check response code or try rotating
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (responseCode === 403) {
                  console.warn('HLS stream status: HTTP 403:', data.details);
                  setPlaybackError(`HTTP Error 403 (Forbidden): यो मिडिया स्ट्रिम सर्भरले ब्लक गरेको छ। (This stream is token-secured or restricts browser requests).`);
                  setIsBuffering(false);
                  hls.destroy();
                  scheduleAutoplayNext();
                } else if (responseCode === 404) {
                  console.warn('HLS stream status: HTTP 404:', data.details);
                  setPlaybackError(`HTTP Error 404 (Not Found): यो स्ट्रिमको लिङ्क हाल सञ्चालनमा छैन। (The channel stream has expired or is offline).`);
                  setIsBuffering(false);
                  hls.destroy();
                  scheduleAutoplayNext();
                } else if (responseCode === 502) {
                  console.warn('HLS stream status: HTTP 502:', data.details);
                  setPlaybackError(`HTTP Error 502 (Bad Gateway): प्रसारण सर्भर हाल अस्थायी रूपमा बन्द छ वा जडान अस्वीकार गरियो। (Destination stream is offline or server-side CORS blocking persists).`);
                  setIsBuffering(false);
                  hls.destroy();
                  scheduleAutoplayNext();
                } else if (responseCode === 504) {
                  console.warn('HLS stream status: HTTP 504:', data.details);
                  setPlaybackError(`HTTP Error 504 (Gateway Timeout): च्यानल लोड गर्न खोज्दा जडान प्रयास मन्द भयो। (Destination server timed out receiving stream fragments).`);
                  setIsBuffering(false);
                  hls.destroy();
                  scheduleAutoplayNext();
                } else if (retryCountRef.current < 2) {
                  retryCountRef.current += 1;
                  console.warn(`Rotating to alternate proxy (Attempt ${retryCountRef.current}/2)...`);
                  setProxyIndex(prev => prev + 1);
                  triggerHud('🔌', 'Rotating Proxy...');
                  hls.destroy();
                } else {
                  console.warn('HLS stream status (Exhausted attempts):', data.type, data.details);
                  setPlaybackError(`Fatal network error: ${data.details}. (The connection timed out or is blocked by CORS origin rules).`);
                  setIsBuffering(false);
                  hls.destroy();
                  scheduleAutoplayNext();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Attempting media recovery...');
                hls.recoverMediaError();
                break;
              default:
                if (retryCountRef.current < 2) {
                  retryCountRef.current += 1;
                  console.warn(`Rotating to alternate proxy on error (Attempt ${retryCountRef.current}/2)...`);
                  setProxyIndex(prev => prev + 1);
                  triggerHud('🔌', 'Rotating Proxy...');
                  hls.destroy();
                } else {
                  console.warn('HLS stream status (Exhausted attempts):', data.type, data.details);
                  setPlaybackError(`Fatal stream loading error: ${data.details}. (Check your network or browser CORS permissions).`);
                  setIsBuffering(false);
                  hls.destroy();
                  scheduleAutoplayNext();
                }
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for native Safari HLS
        video.src = activeStreamUrl;
        const onMetadata = () => {
          playStream();
          video.removeEventListener('loadedmetadata', onMetadata);
        };
        video.addEventListener('loadedmetadata', onMetadata);
        
        const onNativeError = () => {
          if (!useStreamProxy) {
            console.log('Native HLS error, retrying with CORS proxy...');
            setUseStreamProxy(true);
            triggerHud('🔌', 'Engaging CORS Proxy...');
          } else {
            setPlaybackError('Your native player failed to stream this channel.');
            setIsBuffering(false);
            scheduleAutoplayNext();
          }
          video.removeEventListener('error', onNativeError);
        };
        video.addEventListener('error', onNativeError);
      } else {
        setPlaybackError('Your browser does not support HLS (.m3u8) streaming.');
        setIsBuffering(false);
      }
    } else {
      // Normal MP4, webm or other native streams
      video.src = activeStreamUrl;
      const onMetadata = () => {
        playStream();
        video.removeEventListener('loadedmetadata', onMetadata);
      };
      video.addEventListener('loadedmetadata', onMetadata);

      const onDirectError = () => {
        if (!useStreamProxy) {
          console.log('Native direct stream error, retrying via CORS bypass proxy...');
          setUseStreamProxy(true);
          triggerHud('🔌', 'Engaging CORS Proxy...');
        } else {
          setPlaybackError('Failed to play non-HLS direct URL stream. The video format may be unsupported.');
          setIsBuffering(false);
          scheduleAutoplayNext();
        }
        video.removeEventListener('error', onDirectError);
      };
      video.addEventListener('error', onDirectError);
    }

    // Bind state volume settings
    video.volume = volume;
    video.muted = isMuted;

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, retryKey, useStreamProxy, proxyIndex, adPlaying]);

  // Trigger handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      triggerHud('⏸️', 'Paused');
    } else {
      video.play()
        .then(() => {
          setIsPlaying(true);
          triggerHud('▶️', 'Playing');
        })
        .catch(() => {
          // Retry
          video.src = video.src;
          video.play().then(() => setIsPlaying(true));
        });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMute = !isMuted;
    video.muted = nextMute;
    setIsMuted(nextMute);
    triggerHud(nextMute ? '🔇' : '🔊', nextMute ? 'Muted' : 'Unmuted');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = nextVol;
      video.muted = nextVol === 0;
    }
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      triggerHud('⚡', `Speed ${speed}x`);
    }
  };

  const handlePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        triggerHud('📱', 'PiP Closed');
      } else if (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') {
        await video.requestPictureInPicture();
        triggerHud('📱', 'PiP Activated');
      } else if ((video as any).webkitSupportsPresentationMode && typeof (video as any).webkitSetPresentationMode === 'function') {
        // iOS Safari fallback
        const presentationMode = (video as any).webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture';
        await (video as any).webkitSetPresentationMode(presentationMode);
        triggerHud('📱', 'PiP Toggled');
      } else {
        triggerHud('⚠️', 'PiP Not Supported');
      }
    } catch (e) {
      console.error('Picture-in-Picture error:', e);
      triggerHud('⚠️', 'PiP Blocked/Failed');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(channel.url);
    setCopied(true);
    triggerHud('📋', 'URL Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => {
    setPlaybackError(null);
    setPlaybackErrorCode(null);
    setIsBuffering(true);
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div ref={placeholderRef} className="w-full aspect-video relative">
      {/* Visual Placeholder inside Grid layout when player is floating */}
      {isMiniPlayer && (
        <div className="absolute inset-0 bg-[#070707]/90 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 text-xs font-mono select-none">
          <Tv className="w-6 h-6 text-zinc-700 animate-pulse" />
          <span className="text-[11px] text-gray-400 font-sans font-semibold">स्ट्रिम मिनी-प्लेयरमा चलिरहेको छ</span>
          <button 
            onClick={restorePlayerInstance}
            className="mt-2 px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded text-[10px] border border-white/10 transition cursor-pointer font-sans"
          >
            मुख्य स्क्रीनमा फर्काउनुहोस् (Restore)
          </button>
        </div>
      )}

      {(!isMiniPlayer || !isMiniDismissed) && (
        <div 
          ref={containerRef}
          id="video-player-root"
          onMouseMove={handleMouseMove}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={isMiniPlayer ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
          className={`bg-black overflow-hidden flex items-center justify-center transition-all duration-300 ${
            isMiniPlayer 
              ? 'fixed z-[9999] w-[320px] h-[180px] md:w-[380px] md:h-[214px] shadow-2xl rounded-2xl border-2 border-white/20 select-none touch-none animate-fadeIn cursor-move' 
              : isFullscreen 
                ? 'relative w-full h-screen rounded-none border-none' 
                : 'relative w-full aspect-video rounded-xl shadow-2xl border border-white/10 group'
          }`}
        >
          <video
            ref={videoRef}
            id="html5-video-node"
            preload="auto"
            playsInline
            onClick={togglePlay}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={() => {
              if (autoplayNext) {
                triggerHud('➡️', 'Auto-play Next...');
                onPlayNext();
              }
            }}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Pre-Roll Advertisement Overlay Container */}
          {adPlaying && adConfig.enabled && activeAd && (
            <div className="absolute inset-0 bg-black z-40 flex items-center justify-center">
              <video
                ref={adVideoRef}
                src={activeAd.videoUrl}
                preload="auto"
                playsInline
                autoPlay
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onEnded={() => setAdPlaying(false)}
                onError={() => {
                  console.warn("Failed to load pre-roll video ad. Skipping advertisement...");
                  setAdPlaying(false);
                }}
              />

              {/* Advertisement Indicator and Countdown */}
              <div className="absolute bottom-16 right-4 md:right-6 bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-white/10 flex flex-col items-end gap-1.5 shadow-2xl select-none z-50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded leading-none">
                    विज्ञापन / ADVERT
                  </span>
                  <span className="text-xs font-semibold text-white font-mono">
                    {adTimeRemaining}s remaining
                  </span>
                </div>
                
                {/* Skip button styled like YouTube */}
                {activeAd.duration - adTimeRemaining >= activeAd.skipAfter ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdPlaying(false);
                    }}
                    className="flex items-center gap-1.5 bg-red-650 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-1 px-3.5 rounded border border-red-500/25 cursor-pointer shadow-lg hover:shadow-red-950/20 transition-all font-sans"
                  >
                    Skip Advertisement / विज्ञापन छोड्नुहोस्
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 font-mono">
                    You can skip ad in {activeAd.skipAfter - (activeAd.duration - adTimeRemaining)}s
                  </span>
                )}
              </div>

              {/* Small Sponsored ticker on top */}
              <div className="absolute top-4 left-4 bg-black/75 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 select-none shadow z-50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs text-gray-300 font-medium">NepalIPTV Sponsor Spot: Playback resumes in a moment</span>
              </div>
            </div>
          )}

          {/* Picture-in-Picture Active Alert Overlay */}
          {isPipActive && (
            <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 transition-all pointer-events-auto">
              <div className="p-4 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 mb-3 animate-pulse">
                <AppWindow className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">च्यानल फ्लोटिंग विन्डोमा चलिरहेको छ</h4>
              <p className="text-[11px] text-gray-400 max-w-xs mb-4 leading-relaxed">
                Picture-in-Picture सक्रिय छ। च्यानल हेर्दै अन्य कुराहरू ब्राउज गर्न सक्नुहुन्छ।
              </p>
              <button
                onClick={handlePictureInPicture}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg border border-red-500/20 transition active:scale-95 cursor-pointer shadow-lg shadow-red-950/30 font-sans"
              >
                मुख्य विन्डोमा फर्काउनुहोस् (Exit PiP)
              </button>
            </div>
          )}

          {/* HUD Warning banner for keyboard actions (just like youtube) */}
          {hudFeedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white rounded-full p-4 md:px-6 md:py-4 flex flex-col items-center justify-center gap-2 pointer-events-none animate-ping-once transition-all border border-white/10 z-50">
              <span className="text-3xl">{hudFeedback.icon}</span>
              <span className="text-xs font-mono tracking-wider uppercase font-bold text-red-500">{hudFeedback.text}</span>
            </div>
          )}

          {/* Buffering Indicator overlay */}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none z-30">
              <Loader className="w-12 h-12 text-red-650 animate-spin" />
              <span className="text-[11px] font-mono font-bold text-white tracking-widest text-center">SYNCHRONIZING AUDIO FEED...</span>
            </div>
          )}

          {/* Playback Error screen with advice and troubleshooting */}
          {playbackError && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center px-6 py-4 text-center border border-red-550/20 rounded-xl z-30 overflow-y-auto">
              <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center mb-2.5 flex-shrink-0 animate-pulse">
                <Zap className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">यो च्यानल लोडिङ हुन सकेन</h3>
              <div className="text-xs text-gray-300 max-w-sm leading-relaxed mb-4 space-y-2">
                <p className="font-mono text-[10px] bg-red-950/25 border border-red-900/40 py-2 px-3 rounded-lg text-red-300">
                  {playbackError} {playbackErrorCode ? `[HTTP ${playbackErrorCode}]` : ""}
                </p>
                {playbackErrorCode === 403 && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    🔑 यो स्ट्रिमले सुरक्षा साँचो (Security token) वा विशेष एप्लिकेसन वातावरण माग्छ। ब्राउजर सुरक्षा नीतिका कारण वेबमा ४०३ ब्लक भएको हो।
                  </p>
                )}
                {playbackErrorCode === 404 && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    📡 यो प्रसारकको सर्भर लिङ्क परिवर्तन भएको छ, डोमेनको अस्तित्व छैन, वा च्यानल हालको लागि बन्द छ। (Target DNS not found / Stream offline).
                  </p>
                )}
                {playbackErrorCode === 502 && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    🔌 च्यानलको सर्भर अफलाइन छ वा यसले जडान गर्न अनुमति दिएन (Bad Gateway/Connection Refused)।
                  </p>
                )}
                {playbackErrorCode === 504 && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    ⏳ प्रसारण सर्भरबाट समयमै प्रतिक्रिया पाउन सकिएन। च्यानल मन्द वा हाल धेरै व्यस्त छ।
                  </p>
                )}
                {!playbackErrorCode && (
                  <p className="text-[11px] text-gray-400">
                    🔒 ब्राउजरको CORS सेक्युरिटीले गर्दा बाहिरी डोमेनको सिधा मल्टिमिडिया फाइल रोकेको हुन सक्छ।
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                <div className="flex gap-2 w-full justify-center flex-wrap">
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg shadow-red-950/35 border border-red-500/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                  </button>

                  <button
                    onClick={() => {
                      setUseStreamProxy(!useStreamProxy);
                      handleRetry();
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                      useStreamProxy 
                        ? 'bg-emerald-650 hover:bg-emerald-700 text-white border-emerald-500/25' 
                        : 'bg-zinc-900 border-white/10 hover:bg-zinc-800 text-gray-300'
                    }`}
                  >
                    🔌 {useStreamProxy ? 'Disable Proxy' : 'CORS Proxy'}
                  </button>

                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-gray-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/10"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>

                  <a
                    href={`vlc://${channel.url}`}
                    title="Launch VLC Player"
                    className="px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95 border border-amber-500/20 shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Launch VLC
                  </a>
                </div>

                <div className="bg-white/5 border border-white/5 w-full p-2.5 rounded-lg text-left text-[10px] leading-relaxed text-gray-400 font-mono flex items-start gap-1.5">
                  <span className="text-red-500">ℹ️</span>
                  <div>
                    <span className="text-white font-bold block mb-0.5">बाइपास उपाय (CORS Bypasses):</span>
                    १. ब्राउजरमा <span className="text-emerald-400">"Allow CORS"</span> एक्स्टेन्सन थप्नुहोस्। <br />
                    २. माथिको <span className="text-amber-400 font-bold">Launch VLC</span> थिचेर बाहिरी प्लेयरमा चलाउनुहोस् (Recommended)।
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats for Nerds panel */}
          {showStats && !isMiniPlayer && (
            <div className="absolute top-4 left-4 bg-black/90 border border-white/15 text-emerald-400 font-mono text-[10px] p-4.5 rounded-xl max-w-xs md:max-w-sm pointer-events-auto shadow-2xl leading-relaxed z-40">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/10">
                <span className="text-white font-bold tracking-widest text-[9px]">STATS FOR NERDS</span>
                <button 
                  onClick={() => setShowStats(false)} 
                  className="text-[10px] text-gray-400 hover:text-white transition font-bold"
                >
                  [CLOSE]
                </button>
              </div>
              <div className="space-y-1.5 bg-black/60 p-3 rounded-lg border border-white/5">
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Channel ID:</span> {channel.id.substring(0, 15)}...</div>
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Stream Host:</span> {new URL(channel.url).hostname}</div>
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Resolution:</span> {stats.resolution}</div>
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Codec:</span> {stats.codec}</div>
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Buffer Size:</span> {stats.bufferLength} seconds</div>
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Frame Drops:</span> {stats.droppedFrames}</div>
                <div><span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wide">Estimate Bandwidth:</span> {stats.connectionSpeed}</div>
              </div>
              <div className="mt-2 text-[9px] text-gray-500 text-center">
                Press <kbd className="bg-white/10 text-white px-1 py-0.2 rounded font-mono font-bold">S</kbd> to toggle stats dashboard
              </div>
            </div>
          )}

          {/* Mini-player Specialized Controls Overlay */}
          {isMiniPlayer && (
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 z-[100] pointer-events-auto">
              {/* Top controls row */}
              <div className="flex items-center justify-between w-full">
                {/* Restore button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    restorePlayerInstance();
                  }}
                  title="Restore Player / रिस्टोर च्यानल"
                  className="interactive-control p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition active:scale-90 cursor-pointer"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
                
                {/* Mini channel name */}
                <span className="text-[10px] font-bold text-white truncate max-w-[140px] md:max-w-[180px] bg-black/70 px-2.5 py-0.5 rounded font-sans">
                  {channel.name}
                </span>

                {/* Dismiss button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMiniDismissed(true);
                    setIsMiniPlayer(false);
                    if (videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  title="Close Mini Player / बन्द गर्नुहोस्"
                  className="interactive-control px-2 py-1 rounded-lg bg-black/70 hover:bg-[#0f0f0f] text-white hover:text-red-500 transition active:scale-90 cursor-pointer text-xs font-bold leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Center Play/Pause button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="interactive-control p-3 rounded-full bg-red-650 text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>
              </div>

              {/* Bottom detail row */}
              <div className="flex items-center justify-between w-full text-[9px] text-gray-300 bg-black/65 px-2 py-1 rounded">
                <span className="font-semibold font-mono tracking-wide flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                  </span>
                  LIVE
                </span>
                <span className="font-mono text-gray-400">
                  {channel.group}
                </span>
              </div>
            </div>
          )}

          {/* Channel Header (visible in hover if playing, or always if paused/loading) - Hidden on MiniPlayer */}
          {!isMiniPlayer && (
            <div className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="flex items-center gap-3">
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-md bg-white p-0.5 object-contain border border-white/10" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-red-600/20 border border-red-500/30 flex items-center justify-center font-bold text-xs font-mono text-white uppercase">
                    {channel.name.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-white truncate drop-shadow">{channel.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-300 font-bold px-1.5 py-0.2 rounded bg-black/60 border border-white/10">
                      {channel.group}
                    </span>
                    {channel.country && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {channel.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pointer-events-auto flex gap-2">
                <button
                  onClick={() => setShowStats(prev => !prev)}
                  title="Toggle Stats for Nerds [S]"
                  className={`p-2 rounded-lg cursor-pointer transition ${
                    showStats ? 'bg-red-650 text-white' : 'bg-black/60 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Play/Pause Large Overlay Button on Hover - Hidden on MiniPlayer */}
          {!isMiniPlayer && (
            <div 
              onClick={togglePlay}
              className={`absolute inset-0 bg-neutral-900/10 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${
                isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
              }`}
            >
              {!isPlaying && !isBuffering && !playbackError && (
                <div className="p-4.5 rounded-full bg-red-650 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-10 h-10 fill-white ml-1" />
                </div>
              )}
            </div>
          )}

          {/* Bottom Custom Playback Bar (YouTube-Like Controls) - Hidden on MiniPlayer */}
          {!isMiniPlayer && (
            <div className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Fake tracker/seek bar just as standard in YT live videos */}
              <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden group/bar cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 right-0 bg-red-650 animate-pulse" />
              </div>

              {/* Action icons bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button 
                    onClick={togglePlay}
                    className="text-white hover:text-red-500 hover:scale-110 active:scale-95 transition p-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button 
                      onClick={toggleMute}
                      className="text-white hover:text-red-500 transition p-1 cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/vol:w-20 transition-all duration-300 origin-left scale-x-0 group-hover/vol:scale-x-100 accent-red-600 h-1 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-gray-300 select-none pb-0.5">
                      {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>

                  {/* Live Indicator */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-black/60 border border-white/5 rounded-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span className="text-[9px] font-sans font-bold tracking-wider text-white">LIVE FEED</span>
                  </div>

                  {useStreamProxy && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-600/20 border border-emerald-500/25 rounded-md animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400">PROXY ACTIVE</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback speed & general settings selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-gray-300 hover:text-white text-xs font-mono px-2 py-1 rounded hover:bg-white/5 transition cursor-pointer flex items-center gap-1 group/gearBtn"
                      title="Settings / सेटिङहरू"
                    >
                      <Settings className="w-3.5 h-3.5 text-red-550 group-hover/gearBtn:rotate-45 transition-transform duration-300" /> 
                      <span>{playbackSpeed}x</span>
                    </button>
                    
                    {showSpeedMenu && (
                      <div className="absolute right-0 bottom-full mb-2 w-56 bg-neutral-950/95 border border-white/10 rounded-xl shadow-2xl z-50 p-3 text-gray-300 text-xs flex flex-col gap-2.5 backdrop-blur-md">
                        {/* Auto-play toggle row */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-bold text-[10px] uppercase font-sans tracking-wide text-gray-400">Auto-play Next</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAutoplayNext();
                            }}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                              autoplayNext ? 'bg-red-650 justify-end' : 'bg-neutral-800 justify-start'
                            }`}
                          >
                            <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                          </button>
                        </div>

                        {/* Speed select title */}
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-[10px] uppercase font-sans tracking-wide text-gray-400">Playback Speed</span>
                          <div className="grid grid-cols-5 gap-1">
                            {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeSpeed(speed);
                                }}
                                className={`py-1 rounded text-center text-[10px] font-mono transition cursor-pointer ${
                                  playbackSpeed === speed 
                                    ? 'bg-red-650 font-bold text-white border border-red-500/25' 
                                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Picture in Picture */}
                  <button
                    onClick={handlePictureInPicture}
                    title="Mini Player (PiP) [P]"
                    className={`transition hover:scale-110 active:scale-95 cursor-pointer p-1 ${
                      isPipActive ? 'text-red-500 hover:text-red-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <AppWindow className={`w-4 h-4 ${isPipActive ? 'fill-red-500/10' : ''}`} />
                  </button>

                  {/* Theater Mode Toggle */}
                  <button
                    onClick={onToggleTheater}
                    title="Theater Mode [T]"
                    className="text-gray-305 hover:text-white transition cursor-pointer p-1 hidden md:block"
                  >
                    <Tv className={`w-4 h-4 ${isTheaterMode ? 'text-red-550' : ''}`} />
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    title="Fullscreen [F]"
                    className="text-gray-305 hover:text-white transition hover:scale-110 active:scale-95 cursor-pointer p-1"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Overlay Banner Advertisement - overlays directly inside the player container */}
          {adConfig.enabled && activeAd && activeAd.bannerUrl && !adPlaying && !isBannerAdDismissed && !isMiniPlayer && !playbackError && (
            <div 
              onClick={(e) => {
                // Prevent clicking outside / toggling play when clicking the ad container
                e.stopPropagation();
              }}
              className={`absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2 md:p-2.5 flex items-center gap-3 shadow-2xl z-40 transition-all duration-300 w-[94%] sm:w-[85%] max-w-md md:max-w-lg lg:max-w-xl animate-fadeIn ${
                showControls ? 'translate-y-0' : 'translate-y-5 md:translate-y-8'
              }`}
            >
              {/* Left Side: Thumbnail/Banner - Support playing small video clip inside in same size too! */}
              <a 
                href={activeAd.bannerLink} 
                target="_blank" 
                rel="noreferrer" 
                onClick={(e) => {
                  if (activeAd.bannerLink?.startsWith('#') || activeAd.id === 'developer-donation-campaign') {
                    e.preventDefault();
                    onOpenSupportModal?.();
                  }
                }}
                className="relative block h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border border-slate-200 group bg-slate-905 shadow-xs"
              >
                {activeAd.videoUrl ? (
                  <video 
                    src={activeAd.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    controls={false}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-115 pointer-events-none"
                  />
                ) : (
                  <img 
                    src={activeAd.bannerUrl} 
                    alt="IPTV Sponsor" 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-115"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition" />
              </a>

              {/* Middle: Content */}
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-mono bg-amber-500/15 text-amber-600 border border-amber-500/25 px-1.5 py-0.5 rounded font-black animate-pulse leading-none">
                    Sponsored Ad / प्रायोजित विज्ञापन
                  </span>
                  <p className="text-[10px] sm:text-xs text-slate-900 hover:text-red-650 font-black transition truncate max-w-[140px] sm:max-w-[180px] md:max-w-xs">
                    <a 
                      href={activeAd.bannerLink} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => {
                        if (activeAd.bannerLink?.startsWith('#') || activeAd.id === 'developer-donation-campaign') {
                          e.preventDefault();
                          onOpenSupportModal?.();
                        }
                      }}
                      className="flex items-center gap-0.5"
                    >
                      {activeAd.bannerTitle || "NepalIPTV Premium Partner"} <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                  </p>
                </div>
                <p className="text-[9.5px] sm:text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                  {activeAd.bannerText || "Explore premium high-speed local streams, dedicated hosting, and ad-free priority pipelines."}
                </p>
              </div>

              {/* Right Side: Action Link & Close */}
              <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 gap-1.5">
                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBannerAdDismissed(true);
                  }}
                  className="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 h-6 md:h-6.5 w-6 md:w-6.5 rounded-full flex items-center justify-center transition cursor-pointer font-bold text-[9px] sm:text-xs"
                  title="Close Ad / विज्ञापन हटाउनुहोस्"
                >
                  ✕
                </button>
                
                {/* Click action Button */}
                <a
                  href={activeAd.bannerLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (activeAd.bannerLink?.startsWith('#') || activeAd.id === 'developer-donation-campaign') {
                      e.preventDefault();
                      onOpenSupportModal?.();
                    }
                  }}
                  className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white font-black text-[9px] sm:text-[10px] uppercase rounded-md tracking-wider transition active:scale-95 shadow-sm"
                >
                  Learn More
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
