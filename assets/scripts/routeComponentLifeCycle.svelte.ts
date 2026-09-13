import { mount, unmount } from 'svelte'
import store, { type ScribouilliState } from './store.ts'
import { svelteTarget } from './config.ts'

import { Component } from 'svelte'

type MapStateToPropsFunction = (state: ScribouilliState) => Record<string, any>

let currentComponent: Record<string, any>
let currentProps: Record<string, any> = {}
let currentMapStateToProps: MapStateToPropsFunction = _ => ({})

export function replaceComponent<P extends Record<string, any>>(
  newComponent: Component<P>,
  newMapStateToProps: MapStateToPropsFunction,
) {
  console.log('replaceComponent newMapStateToProps', newMapStateToProps)

  if (!newMapStateToProps) {
    throw new Error('Missing _mapStateToProps in replaceComponent')
  }

  if (currentComponent) unmount(currentComponent)
  currentMapStateToProps = newMapStateToProps

  const props = $state(currentMapStateToProps(store.state))
  currentProps = props

  currentComponent = mount<Record<string, any>, Record<string, any>>(
    // Astuce pour faire la conversion de Component<P> vers
    // Component<Record<string, any>>: On fait oublier le type à TypeScript en
    // faisant une première conversion vers unknown, puis on le passe dans le
    // type qu'on veut vraiment.
    //
    // Sans ça, il râle parce que rien ne garanti que P soit strictement égal à
    // Record<string, any>.
    newComponent as unknown as Component<Record<string, any>>,
    {
      target: svelteTarget,
      props: currentProps,
    },
  )

  document.documentElement.scrollTo(0, 0)
}

function render(state: ScribouilliState) {
  const props = currentMapStateToProps(state)

  if (props) {
    for (const key of Object.keys(currentProps)) {
      delete currentProps[key]
    }

    Object.assign(currentProps, props)
  }
}

store.subscribe(render)
