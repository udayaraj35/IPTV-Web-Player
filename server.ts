import express from "express";
import path from "path";
import { URL } from "url";
import { createServer as createViteServer } from "vite";

// Global URL and Stream Rewriter for robust M3U8 reverse-proxying.
// This parses `.m3u8` files and updates all internal segment, playlist, and key URIs
// to be fetched through our server proxy.
function rewriteM3U8(content: string, playlistUrl: string): string {
  const lines = content.split("\n");
  const rewrittenLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Line containing a media segment, key-file, or sub-playlist URL (not a commend or tag)
    if (!trimmed.startsWith("#")) {
      try {
        const absoluteUrl = new URL(trimmed, playlistUrl).href;
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      } catch (e) {
        return line;
      }
    }

    // Line containing URI attribute like #EXT-X-KEY:METHOD=AES-128,URI="segment.key"
    if (trimmed.startsWith("#") && trimmed.includes("URI=")) {
      return trimmed.replace(/URI="([^"]+)"/g, (match, uriValue) => {
        try {
          const absoluteUrl = new URL(uriValue, playlistUrl).href;
          return `URI="/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
        } catch (e) {
          return match;
        }
      });
    }

    return line;
  });

  return rewrittenLines.join("\n");
}

async function startServer() {
  const app = express();
  app.use(express.json()); // Support JSON parsing
  const PORT = 3000;

  // Global Full-Stack State for Telemetry & Custom Ad Control
  let totalVisits = 3842; // Base visits seed
  const activeSessions = new Map<string, { lastSeen: number, activeChannel: any }>();
  
  let globalAdConfig = {
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

  let globalSupportConfig = {
    enabled: true,
    title: "Support NepalIPTV (सहयोग र डोनेशन)",
    description: "हाम्रो सेवालाई सधैं निःशुल्क र सुचारु राख्नको लागि तपाईंको सानो सहयोग बहुमूल्य हुनेछ। (Your support helps keep our service free and uninterrupted.)",
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
    cryptoQr: ""
  };

  // Custom proxy route to bypass CORS, Referer, and User-Agent blocks (HTTP 403 Forbidden fixes)
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send("Parameter 'url' is required.");
    }

    try {
      // Spoof headers to mimic standard IPTV and media player clients
      const headers: Record<string, string> = {
        "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
      };

      const response = await fetch(targetUrl, {
        headers,
        redirect: "follow",
      });

      if (!response.ok) {
        return res
          .status(response.status)
          .send(`Streaming server error: ${response.status} ${response.statusText}`);
      }

      // Add standard headers to facilitate browser playability
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");

      const contentType = response.headers.get("content-type") || "";
      const isPlaylist =
        contentType.includes("mpegurl") ||
        contentType.includes("mpegURL") ||
        contentType.includes("application/x-mpegURL") ||
        targetUrl.toLowerCase().includes(".m3u8") ||
        targetUrl.toLowerCase().includes("manifest");

      if (isPlaylist) {
        const text = await response.text();
        const rewritten = rewriteM3U8(text, targetUrl);
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        return res.send(rewritten);
      } else {
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
          res.setHeader("Content-Length", contentLength);
        }

        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error("Custom backend proxy server error for URL:", targetUrl, err);
      
      const errorMsg = err.message || "";
      const isDnsError = err.code === "ENOTFOUND" || errorMsg.includes("ENOTFOUND") || errorMsg.includes("getaddrinfo") || errorMsg.includes("dns");
      const isTimeout = err.code === "ETIMEDOUT" || errorMsg.includes("timeout") || errorMsg.includes("Timeout");
      const isRefused = err.code === "ECONNREFUSED" || errorMsg.includes("refused");

      // Add CORS headers even in error responses to make sure browser receives the status correctly
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");

      if (isDnsError) {
        return res.status(404).send(`DNS_ERROR: यो च्यानलको सर्भर ठेगाना (Domain) फेला परेन। (Domain DNS address not found or offline).`);
      }
      if (isTimeout) {
        return res.status(504).send(`TIMEOUT_ERROR: च्यानल जडान प्रयास समय समाप्त भयो। (Gateway Timeout - Destination server is slow or down).`);
      }
      if (isRefused) {
        return res.status(502).send(`CONNECTION_REFUSED: च्यानलको सर्भरले जडान अस्वीकार गर्‍यो। (Connection refused by destination stream server).`);
      }

      return res.status(502).send(`STREAM_OFFLINE_ERR: यो मिडिया च्यानल हाल अफलाइन वा बन्द छ। Details: ${errorMsg}`);
    }
  });

  // Support health probing
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", proxyEnabled: true });
  });

  // TELEMETRY API: Keep alive session heartbeat
  app.post("/api/stats/ping", (req, res) => {
    const { sessionId, activeChannel } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    
    // Increment totalVisits if this is a brand new session
    if (!activeSessions.has(sessionId)) {
      totalVisits += 1;
    }

    activeSessions.set(sessionId, {
      lastSeen: Date.now(),
      activeChannel: activeChannel || null
    });

    res.json({ success: true });
  });

  // TELEMETRY API: Get aggregated dashboard stats
  app.get("/api/stats", (req, res) => {
    // Evict old sessions (older than 20 seconds)
    const cutoff = Date.now() - 20000;
    for (const [sid, sess] of activeSessions.entries()) {
      if (sess.lastSeen < cutoff) {
        activeSessions.delete(sid);
      }
    }

    // Keep active watchers
    const realWatchersCount: Record<string, { name: string, logo: string | null, count: number }> = {};
    let realActivePlayers = 0;

    for (const [sid, sess] of activeSessions.entries()) {
      if (sess.activeChannel) {
        realActivePlayers += 1;
        const ch = sess.activeChannel;
        if (!realWatchersCount[ch.id]) {
          realWatchersCount[ch.id] = { name: ch.name, logo: ch.logo, count: 0 };
        }
        realWatchersCount[ch.id].count += 1;
      }
    }

    // Seeded channels for realistic, vibrant, responsive telemetry
    const simulatedChannelSeeds = [
      { id: "seed_1", name: "Kantipur TV (कान्तिपुर HD)", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Kantipur_Television_Logo_2016.png", base: 14 },
      { id: "seed_2", name: "AP1 HD Television", logo: "http://ap1.tv/wp-content/uploads/2017/04/AP1-Logo-Final-small.png", base: 9 },
      { id: "seed_3", name: "Himalaya TV HD", logo: "https://himalayatv.com/images/htv_logo.png", base: 7 },
      { id: "seed_4", name: "Nepal Television (NTV)", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Nepal_Television_Logo.png", base: 12 },
      { id: "seed_5", name: "Image Channel", logo: "https://www.imagechannels.com/wp-content/themes/imagechannel/images/logo.png", base: 4 }
    ];

    const channelsWatching: any[] = [];
    let simulatedTotalActiveCount = 0;

    // First, push real-time viewer counts
    Object.keys(realWatchersCount).forEach(id => {
      channelsWatching.push({
        id,
        name: realWatchersCount[id].name,
        logo: realWatchersCount[id].logo,
        viewers: realWatchersCount[id].count,
        isReal: true
      });
      simulatedTotalActiveCount += realWatchersCount[id].count;
    });

    // Then, augment with simulated seed channels with gentle fluctuating viewer density
    simulatedChannelSeeds.forEach(seed => {
      // gentle fluctuation +/- 3 viewers
      const diff = Math.floor(Math.random() * 7) - 3;
      const viewers = Math.max(1, seed.base + diff);
      simulatedTotalActiveCount += viewers;

      const existingIdx = channelsWatching.findIndex(item => item.name === seed.name);
      if (existingIdx !== -1) {
        channelsWatching[existingIdx].viewers += viewers;
      } else {
        channelsWatching.push({
          id: seed.id,
          name: seed.name,
          logo: seed.logo,
          viewers: viewers,
          isReal: false
        });
      }
    });

    // Sort descending by viewer numbers
    channelsWatching.sort((a, b) => b.viewers - a.viewers);

    // Calculate aggregated totals with smooth, organic floating visitor rates
    const minVisitsRandomRange = 25 + Math.floor(Math.sin(Date.now() / 60000) * 8);
    const activeVisitsCount = Math.max(activeSessions.size, activeSessions.size + minVisitsRandomRange);

    res.json({
      totalVisits: totalVisits,
      activeVisits: activeVisitsCount,
      activePlaybacks: realActivePlayers + Math.floor(simulatedTotalActiveCount * 0.8),
      channelsWatching
    });
  });

  // MONETIZATION API: Retrieve global ad configurations
  app.get("/api/ads", (req, res) => {
    res.json(globalAdConfig);
  });

  // MONETIZATION API: Update ads globally from the Admin Panel
  app.post("/api/ads", (req, res) => {
    globalAdConfig = { ...globalAdConfig, ...req.body };
    res.json({ success: true, adConfig: globalAdConfig });
  });

  // DEVELOPER SUPPORT API: Retrieve global support & donation configurations
  app.get("/api/support", (req, res) => {
    res.json(globalSupportConfig);
  });

  // DEVELOPER SUPPORT API: Update support details globally from Admin Panel Support Tab
  app.post("/api/support", (req, res) => {
    globalSupportConfig = { ...globalSupportConfig, ...req.body };
    res.json({ success: true, supportConfig: globalSupportConfig });
  });

  // Setup Vite development server or static asset bundle delivery
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK INFRASTRUCTURE] Live at http://0.0.0.0:${PORT}`);
  });
}

startServer();
