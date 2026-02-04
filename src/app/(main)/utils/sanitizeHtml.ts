/**
 * Sanitizes HTML content to prevent XSS attacks.
 * 
 * This utility uses DOMPurify to sanitize HTML before rendering with dangerouslySetInnerHTML.
 * DOMPurify is already installed (see package.json).
 * 
 * Installation (already done):
 *   npm install dompurify @types/dompurify
 * 
 * Configuration:
 * - Allows safe HTML tags commonly used in blog posts
 * - Allows safe attributes (href, target, rel for links)
 * - Strips all script tags, event handlers, and dangerous protocols
 * 
 * Note: This function is designed for client-side use (client components).
 * For server-side rendering, you would need to use isomorphic-dompurify or jsdom.
 */

import DOMPurify from 'dompurify';

// Configuration for allowed HTML tags and attributes
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'code', 'pre',
    'div', 'span', 'hr'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitizes HTML content for safe rendering.
 * 
 * This function uses DOMPurify to remove potentially dangerous HTML/JavaScript
 * while preserving safe formatting tags commonly used in blog content.
 * 
 * @param dirty - Unsanitized HTML string (potentially from untrusted sources)
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 * 
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  // DOMPurify requires a browser environment (window object)
  // Since this is used in client components, window will always be available
  if (typeof window === 'undefined') {
    // Fallback for server-side (shouldn't happen in client components)
    // In production, return empty string or basic sanitized version
    console.warn('sanitizeHtml called in server context - DOMPurify requires browser environment');
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }
  
  // Client-side: Use DOMPurify for comprehensive sanitization
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG);
}
