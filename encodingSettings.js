const encodingSettings = {
  audioBitrate: process.env.AUDIO_BITRATE || "128000", // 128kbps
  videoBitrate: process.env.VIDEO_BITRATE || "3000000", // 3mbps
  maxAudioChannels: process.env.MAX_AUDIO_CHANNELS || "2", // stereo
  maxHeight: process.env.MAX_HEIGHT || "720", // 720p
  maxWidth: process.env.MAX_WIDTH || "1280",

  // caution changing these values
  container: "mp4", // Default container format
  videoCodec: "h264", // Default video codec
  audioCodec: "aac", // Default audio codec
};

module.exports.encodingSettings = encodingSettings;
