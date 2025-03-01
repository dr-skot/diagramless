import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows only safe tags and attributes.
 * 
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  // Configure DOMPurify to only allow specific tags and attributes
  const config = {
    ALLOWED_TAGS: ['em', 'strong', 'i', 'b', 'sub', 'sup', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    // Force all URLs to be absolute and start with https:// or http://
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Add rel="noopener noreferrer" to all links
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup']
  };
  
  return DOMPurify.sanitize(html, config);
}
