import React from 'react'

import { Code } from './Component.client'

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className, code, language }) => {
  return (
    <section className="sp-64">
      <div className={['container-inner not-prose', className].filter(Boolean).join(' ')}>
        <Code code={code} language={language} />
      </div>
    </section>
  )
}
