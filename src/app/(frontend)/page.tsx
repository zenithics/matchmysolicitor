import PageTemplate, { generateMetadata } from './[slug]/page'

// Incrementally statically rendered. Published CMS changes are pushed out
// immediately by the revalidatePath hooks on the collections; the interval is
// just a backstop. Draft-mode requests (CMS preview) still render dynamically.
export const revalidate = 600

export default PageTemplate

export { generateMetadata }
