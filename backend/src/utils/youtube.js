/**
 * Converts a standard, mobile, shorts, or shortened YouTube link to its embed URL.
 * If the link is already an embed URL, it returns it.
 * @param {string} url - The pasted YouTube URL
 * @returns {string} The formatted embed URL
 */
const getEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // If already in embed format
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Regular expression to extract the video ID from standard YouTube links
  // Covers: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/... etc.
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // If no match but seems like a video ID (11 chars)
  if (url.trim().length === 11) {
    return `https://www.youtube.com/embed/${url.trim()}`;
  }

  return url; // fallback
};

module.exports = {
  getEmbedUrl,
};
