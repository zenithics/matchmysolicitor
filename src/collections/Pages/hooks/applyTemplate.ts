import type { CollectionBeforeChangeHook } from 'payload'

export const applyTemplate: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data?.template) return data

  try {
    const templateId = typeof data.template === 'object' ? data.template.id : data.template

    const template = await req.payload.findByID({
      collection: 'page-templates',
      id: templateId,
      depth: 2,
    })

    if (!template) return data

    if (template.hero && (!data.hero || data.hero?.type === 'none')) {
      data.hero = template.hero
    }

    if (template.layout && (!data.layout || data.layout.length === 0)) {
      const clonedLayout = JSON.parse(JSON.stringify(template.layout))
      const stripIds = (obj: Record<string, unknown>): Record<string, unknown> => {
        if (Array.isArray(obj)) {
          return obj.map((item) => stripIds(item)) as unknown as Record<string, unknown>
        }
        if (obj && typeof obj === 'object') {
          const newObj: Record<string, unknown> = {}
          for (const [key, value] of Object.entries(obj)) {
            if (key === 'id') continue
            newObj[key] = typeof value === 'object' && value !== null
              ? stripIds(value as Record<string, unknown>)
              : value
          }
          return newObj
        }
        return obj
      }
      data.layout = stripIds(clonedLayout) as typeof data.layout
    }

    data.template = null
  } catch {
    // Never block page creation
  }

  return data
}
