import { Channel } from '../types';

export function parseM3U(content: string): Channel[] {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Extract tvg-id
      const tvgIdMatch = line.match(/tvg-id="([^"]+)"/i);
      if (tvgIdMatch) {
        currentChannel.tvgId = tvgIdMatch[1];
      }

      // Extract tvg-logo or logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i) || line.match(/logo="([^"]+)"/i);
      if (logoMatch) {
        currentChannel.logo = logoMatch[1];
      }

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]+)"/i) || line.match(/group="([^"]+)"/i);
      if (groupMatch) {
        currentChannel.group = groupMatch[1];
      } else {
        currentChannel.group = 'General';
      }

      // Extract channel name: everything after the last comma of that line
      const lastCommaIdx = line.lastIndexOf(',');
      if (lastCommaIdx !== -1) {
        currentChannel.name = line.substring(lastCommaIdx + 1).trim();
      } else {
        const tvgNameMatch = line.match(/tvg-name="([^"]+)"/i);
        currentChannel.name = tvgNameMatch ? tvgNameMatch[1] : 'Unknown';
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentChannel) {
        currentChannel.url = line;
        currentChannel.id = encodeURIComponent(line); // Ensure unique ID using url
        
        if (!currentChannel.name) {
          currentChannel.name = 'Channel ' + (channels.length + 1);
        }
        
        channels.push(currentChannel as Channel);
        currentChannel = null;
      }
    }
  }

  return channels;
}
