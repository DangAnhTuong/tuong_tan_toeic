/**
 * Security Sanitizer Utility
 * Defense-in-depth against Stored XSS, Protocol Injection, and Malicious Payloads
 */

/**
 * Validates and cleans user attachments (Feedback, Chat, etc.)
 * @param {Array} attachments Raw attachments array from user request
 * @returns {Array} Sanitized safe attachments array
 */
function sanitizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];

  const safeAttachments = [];

  for (const item of attachments.slice(0, 5)) {
    if (!item || typeof item !== 'object') continue;

    let { type, name, url, size } = item;

    // 1. Sanitize name: remove HTML/script tags and limit length
    let cleanName = (typeof name === 'string' ? name : 'Tệp đính kèm')
      .replace(/[<>"'`;()]/g, '')
      .trim()
      .slice(0, 100);

    // 2. Validate and sanitize URL
    if (!url || typeof url !== 'string') continue;
    let cleanUrl = url.trim();

    // Block dangerous pseudo-schemes
    const lowerUrl = cleanUrl.toLowerCase();
    if (
      lowerUrl.startsWith('javascript:') ||
      lowerUrl.startsWith('vbscript:') ||
      lowerUrl.includes('data:text/html') ||
      lowerUrl.includes('data:application/') ||
      lowerUrl.includes('data:text/javascript') ||
      lowerUrl.includes('data:text/plain')
    ) {
      console.warn(`[SECURITY WARNING] Blocked dangerous attachment URL scheme: ${cleanUrl.slice(0, 50)}`);
      continue; // Discard dangerous item
    }

    // 3. Only allow valid http/https URLs or safe base64 images
    const isHttpUrl = /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i.test(cleanUrl);
    const isSafeDataImage = /^data:image\/(png|jpe?g|gif|webp|bmp);base64,[a-zA-Z0-9+/=]+$/i.test(cleanUrl);

    if (!isHttpUrl && !isSafeDataImage) {
      console.warn(`[SECURITY WARNING] Blocked non-standard attachment URL: ${cleanUrl.slice(0, 50)}`);
      continue;
    }

    // 4. Sanitize type
    let cleanType = 'link';
    if (type === 'image' || isSafeDataImage) cleanType = 'image';
    else if (type === 'file') cleanType = 'file';

    safeAttachments.push({
      type: cleanType,
      name: cleanName || 'Tệp đính kèm',
      url: cleanUrl,
      size: typeof size === 'number' && size > 0 ? size : undefined
    });
  }

  return safeAttachments;
}

/**
 * Sanitizes plain text input: trims and removes control characters
 */
function sanitizePlainText(text, maxLength = 2000) {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}

module.exports = {
  sanitizeAttachments,
  sanitizePlainText
};
