import { mount, unmount } from 'svelte'
import store, { type ScribouilliState } from './store.js'
import { svelteTarget } from './config.js'

import { Component } from 'svelte'

type MapStateToPropsFunction = (state: ScribouilliState) => Record<string, any>

let currentComponent: Record<string, any>
let currentProps: Record<string, any>
let currentMapStateToProps: MapStateToPropsFunction = _ => ({})

export function replaceComponent(
  newComponent: Component,
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
    newComponent,
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
