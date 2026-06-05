// ════════════════════════════════════════════════════════════════════════════
//  YtDlpPlugin.js  — DisTube v5 ExtractorPlugin using yt-dlp
//  Uses system yt-dlp binary for maximum reliability on server IPs
// ════════════════════════════════════════════════════════════════════════════

const { ExtractorPlugin, Song, Playlist } = require('distube');
const { create: createYtDlp } = require('yt-dlp-exec');
const path = require('path');
const fs   = require('fs');

// Use system yt-dlp binary if available, otherwise fall back to npm's download
const SYSTEM_YTDLP = '/usr/local/bin/yt-dlp';
const ytdlp = fs.existsSync(SYSTEM_YTDLP)
  ? createYtDlp(SYSTEM_YTDLP)
  : require('yt-dlp-exec');

const YT_REGEX       = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
const PLAYLIST_REGEX = /[?&]list=([a-zA-Z0-9_-]+)/;

class YtDlpPlugin extends ExtractorPlugin {
  constructor(options = {}) {
    super();
    this.cookiesFile = options.cookiesFile || null;
  }

  // Build yt-dlp options, injecting cookies + iOS client bypass
  #args(extra = {}) {
    const base = {
      noWarnings: true,
      // Use iOS + TV embedded clients — bypasses bot detection on server IPs
      extractorArgs: 'youtube:player_client=ios,web_creator,tv_embedded',
      ...extra,
    };
    if (this.cookiesFile && fs.existsSync(this.cookiesFile)) {
      base.cookies = this.cookiesFile;
    }
    return base;
  }

  validate(url) {
    return YT_REGEX.test(url);
  }

  async resolve(url, options) {
    const isPlaylist = PLAYLIST_REGEX.test(url) && !url.includes('watch?v=');

    if (isPlaylist) {
      const info = await ytdlp(url, this.#args({
        dumpSingleJson: true,
        flatPlaylist:   true,
      }));

      const songs = (info.entries || []).map(entry => new Song({
        plugin:         this,
        source:         'youtube',
        playFromSource: true,
        id:             entry.id,
        name:           entry.title,
        url:            entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
        thumbnail:      entry.thumbnail,
        duration:       entry.duration || 0,
        uploader:       { name: entry.uploader || entry.channel || 'Unknown' },
      }, options));

      return new Playlist({
        source:    'youtube',
        id:        info.id,
        name:      info.title,
        url:       info.webpage_url || url,
        thumbnail: info.thumbnail,
        songs,
      }, options);
    }

    const info = await ytdlp(url, this.#args({
      dumpSingleJson: true,
      noPlaylist:     true,
    }));

    return new Song({
      plugin:         this,
      source:         'youtube',
      playFromSource: true,
      id:             info.id,
      name:           info.title,
      url:            info.webpage_url || url,
      thumbnail:      info.thumbnail,
      duration:       info.duration || 0,
      uploader:       { name: info.uploader || info.channel || 'Unknown' },
      views:          info.view_count,
      likes:          info.like_count,
      ageRestricted:  (info.age_limit || 0) > 0,
    }, options);
  }

  // Returns the direct audio stream URL for DisTube/ffmpeg to play
  async getStreamURL(song) {
    const result = await ytdlp(song.url, this.#args({
      format:     'bestaudio[ext=webm]/bestaudio/best',
      getUrl:     true,
      noPlaylist: true,
    }));
    const url = (typeof result === 'string' ? result : String(result)).trim().split('\n')[0];
    if (!url) throw new Error('yt-dlp returned no stream URL');
    return url;
  }

  // Called when user types a text search query (not a URL)
  async searchSong(query, options) {
    try {
      const info = await ytdlp(`ytsearch1:${query}`, this.#args({
        dumpSingleJson: true,
        noPlaylist:     true,
      }));

      if (!info?.id) {
        console.warn(`[yt-dlp] No result for query: ${query}`);
        return null;
      }

      return new Song({
        plugin:         this,
        source:         'youtube',
        playFromSource: true,
        id:             info.id,
        name:           info.title,
        url:            info.webpage_url || `https://www.youtube.com/watch?v=${info.id}`,
        thumbnail:      info.thumbnail,
        duration:       info.duration || 0,
        uploader:       { name: info.uploader || info.channel || 'Unknown' },
        views:          info.view_count,
      }, options);
    } catch (err) {
      console.error(`[yt-dlp] searchSong error for "${query}":`, err.message);
      return null;
    }
  }
}

module.exports = { YtDlpPlugin };
