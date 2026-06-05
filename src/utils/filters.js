/**
 * Audio filter definitions for DisTube customFilters.
 * Each entry: { name: display name, filter: ffmpeg filter string }
 */
const FILTERS = {
  bassboost:   { name: '🎸 Bass Boost',    filter: 'bass=g=20,dynaudnorm=f=200' },
  '8d':        { name: '🎧 8D Audio',      filter: 'apulsator=hz=0.08' },
  vaporwave:   { name: '🌊 Vaporwave',     filter: 'aresample=48000,asetrate=48000*0.8' },
  nightcore:   { name: '⚡ Nightcore',     filter: 'aresample=48000,asetrate=48000*1.25' },
  phaser:      { name: '🌀 Phaser',        filter: 'aphaser=in_gain=0.4' },
  tremolo:     { name: '💫 Tremolo',       filter: 'tremolo' },
  vibrato:     { name: '🎻 Vibrato',       filter: 'vibrato=f=6.5' },
  reverse:     { name: '⏪ Reverse',       filter: 'areverse' },
  treble:      { name: '🎼 Treble Boost',  filter: 'treble=g=5' },
  normalizer:  { name: '📊 Normalizer',    filter: 'dynaudnorm=f=200' },
  surrounding: { name: '🌐 Surrounding',   filter: 'surround' },
  pulsator:    { name: '💓 Pulsator',      filter: 'apulsator=hz=1' },
  karaoke:     { name: '🎤 Karaoke',       filter: 'stereotools=mlev=0.1' },
  flanger:     { name: '🔊 Flanger',       filter: 'flanger' },
  echo:        { name: '🗣️ Echo',          filter: 'aecho=0.8:0.9:1000:0.3' },
  daycore:     { name: '☀️ Daycore',       filter: 'aresample=48000,asetrate=48000*0.75' },
  earrape:     { name: '💥 Earrape',       filter: 'channelsplit,sidechaingate=level_in=64' },
  lofi:        { name: '📻 Lo-Fi',         filter: 'lowpass=f=300,volume=0.75,aecho=0.8:0.88:60:0.4' },
};

// Flat map of filterName -> ffmpeg string (for DisTube customFilters option)
const CUSTOM_FILTERS = Object.fromEntries(
  Object.entries(FILTERS).map(([key, val]) => [key, val.filter])
);

module.exports = { FILTERS, CUSTOM_FILTERS };
