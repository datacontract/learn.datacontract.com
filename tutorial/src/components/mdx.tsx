import { Callout } from './Callout'
import { CodeBlock } from './CodeBlock'
import { Goals } from './Goals'
import { Os, OsTabs } from './OsTabs'
import { Quiz } from './Quiz'
import { ScenarioDiagram } from './ScenarioDiagram'
import { Screenshot } from './Screenshot'
import { Solution } from './Solution'
import { Step } from './Step'
import { Terminal } from './Terminal'

// components available in every MDX chapter without importing them
export const mdxComponents = {
  pre: CodeBlock,
  img: Screenshot,
  a: (props: React.ComponentProps<'a'>) => {
    const external = props.href?.startsWith('http')
    return <a {...props} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} />
  },
  Callout,
  Goals,
  Os,
  OsTabs,
  Quiz,
  ScenarioDiagram,
  Solution,
  Step,
  Terminal,
}
