// ════════════════════════════════════════════════════════════════════════════
//  YtDlpPlugin.js  — DisTube v5 ExtractorPlugin using yt-dlp
//  Bypasses YouTube bot detection that blocks ytdl-core on server IPs
// ════════════════════════════════════════════════════════════════════════════

const { ExtractorPlugin, Song, Playlist } = require('distube');
const ytdlp = require('yt-dlp-exec');
const path  = require('path');
const fs    = require('fs');

const YT_REGEX      = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
const PLAYLIST_REGEX = /[?&]list=([a-zA-Z0-9_-]+)/;

class YtDlpPlugin extends ExtractorPlugin {
  constructor(options = {}) {
    super();
    this.cookiesFile = options.cookiesFile || null;
  }

  // Build yt-dlp args, optionally injecting cookies file
  #args(extra = {}) {
    const base = { noWarnings: true, noCallHome: true, ...extra };
    if (this.cookiesFile && fs.existsSync(this.cookiesFile)) {
      base.cookies = this.cookiesFile;
    }
    return base;
  }

  // Returns true for any YouTube URL
  validate(url) {
    return YT_REGEX.test(url);
  }

  // Resolve a YouTube URL into a Song or Playlist
  async resolve(url, options) {
    const isPlaylist = PLAYLIST_REGEX.test(url) && !url.includes('watch?v=');

    if (isPlaylist) {
      const info = await ytdlp(url, this.#args({
        dumpSingleJson: true,
        flatPlaylist:   true,
        noWarnings:     true,
      }));

      const songs = (info.entries || []).map(entry => new Song({
        plugin:          this,
        source:          'youtube',
        playFromSource:  true,
        id:              entry.id,
        name:            entry.title,
        url:             entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
        thumbnail:       entry.thumbnail,
        duration:        entry.duration || 0,
        uploader:        { name: entry.uploader || entry.channel || 'Unknown' },
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

    // Single video
    const info = await ytdlp(url, this.#args({
      dumpSingleJson: true,
      noPlaylist:     true,
    }));

    return new Song({
      plugin:          this,
      source:          'youtube',
      playFromSource:  true,
      id:              info.id,
      name:            info.title,
      url:             info.webpage_url || url,
      thumbnail:       info.thumbnail,
      duration:        info.duration || 0,
      uploader:        { name: info.uploader || info.channel || 'Unknown' },
      views:           info.view_count,
      likes:           info.like_count,
      ageRestricted:   (info.age_limit || 0) > 0,
    }, options);
  }

  // Called by DisTube when it needs the audio stream URL
  async getStreamURL(song) {
    const result = await ytdlp(song.url, this.#args({
      format:     'bestaudio[ext=webm]/bestaudio/best',
      getUrl:     true,
      noPlaylist: true,
      noWarnings: true,
    }));
    // yt-dlp-exec returns a string when getUrl is true
    return (typeof result === 'string' ? result : String(result)).trim().split('\n')[0];
  }

  // Called when user types a search query (not a URL)
  async searchSong(query, options) {
    try {
      const info = await ytdlp(`ytsearch1:${query}`, this.#args({
        dumpSingleJson: true,
        noPlaylist:     true,
        noWarnings:     true,
      }));

      if (!info?.id) return null;

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
    } catch {
      return null;
    }
  }
}

module.exports = { YtDlpPlugin };
