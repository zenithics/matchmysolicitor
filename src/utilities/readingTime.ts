const WORDS_PER_MINUTE = 200

function extractTextFromLexical(node: any): string {
  if (!node) return ''

  if (typeof node.text === 'string') return node.text

  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexical).join(' ')
  }

  if (node.root) {
    return extractTextFromLexical(node.root)
  }

  return ''
}

export function getReadingTime(content: any): number {
  if (!content) return 0

  const text = extractTextFromLexical(content)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}
