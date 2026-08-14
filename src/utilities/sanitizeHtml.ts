/**
 * Basic HTML sanitiser — strips dangerous tags/attributes while
 * keeping common formatting elements used in Payload rich text.
 */

const ALLOWED_TAGS = new Set([
  'a', 'b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img',
  'blockquote', 'code', 'pre', 'hr', 'table', 'thead', 'tbody',
  'tr', 'td', 'th', 'figure', 'figcaption', 'sup', 'sub', 'small',
])

const ALLOWED_ATTRS = new Set([
  'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
  'class', 'style', 'id', 'title',
])

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Strip script/style tags and their content
  let clean = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|button)[^>]*>[\s\S]*?<\/\1>/gi, '')
  // Remove self-closing versions
  clean = clean.replace(/<(script|style|iframe|object|embed|form|input|textarea|button)[^>]*\/?>/gi, '')
  // Remove event handlers
  clean = clean.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  // Remove javascript: urls
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')

  return clean
}
