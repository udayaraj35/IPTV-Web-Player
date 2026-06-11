export interface Channel {
  id: string; // generated hash or url
  name: string;
  logo: string | null;
  url: string;
  group: string; // Category or region
  country?: string;
  language?: string;
  tvgId?: string;
  tvgName?: string;
}

export interface Playlist {
  name: string;
  url: string;
  isCustom: boolean;
  channelCount: number;
}

export interface PlaybackStats {
  resolution: string;
  codec: string;
  bufferLength: number;
  droppedFrames: number;
  connectionSpeed: string; // estimated or mock
}

export interface AdItem {
  id: string;
  videoUrl: string;
  duration: number;
  skipAfter: number;
  bannerUrl: string;
  bannerLink: string;
  bannerTitle: string;
  bannerText: string;
}

export interface AdConfig {
  enabled: boolean;
  videoUrl: string;
  duration: number;
  skipAfter: number;
  bannerUrl: string;
  bannerLink: string;
  bannerTitle?: string;
  bannerText?: string;
  ads?: AdItem[];
}

export interface EsewaKhaltiAccount {
  id: string;
  type: 'esewa' | 'khalti';
  number: string;
  name: string;
  qr?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branch?: string;
  accountNo: string;
  accountName: string;
  qr?: string;
}

export interface CryptoWallet {
  id: string;
  coin: string; // "USDT", "USDC", "BTC", "ETH", "SOL" etc.
  address: string;
  qr?: string;
}

export interface SupportConfig {
  enabled: boolean;
  title: string;
  description: string;
  paypalUrl?: string;
  coffeeUrl?: string;
  esewaNumber: string;
  esewaName: string;
  esewaQr: string;
  khaltiNumber: string;
  khaltiName: string;
  khaltiQr: string;
  ipsBankName: string;
  ipsBranch: string;
  ipsAccountNo: string;
  ipsAccountName: string;
  ipsQr: string;
  usdtAddress: string;
  usdcAddress: string;
  btcAddress: string;
  ethAddress: string;
  solAddress: string;
  cryptoQr: string;
  esewaKhaltiList?: EsewaKhaltiAccount[];
  ipsBankList?: BankAccount[];
  cryptoList?: CryptoWallet[];
}


