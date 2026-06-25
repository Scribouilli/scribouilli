//@ts-check

import { mount, unmount } from "svelte";
import store from "./store.js";
import {svelteTarget} from "./config.js";

/** @import {Component, ComponentProps} from 'svelte' */

/** @typedef {import("./store.js").ScribouilliState} ScribouilliState */
/** @typedef {(state: ScribouilliState) => any} MapStateToPropsFunction */

/** @type {Component} */
let currentComponent;
/** @type {ComponentProps<typeof currentComponent>} */
let currentProps;
/** @type {MapStateToPropsFunction} */
let currentMapStateToProps = (_) => {};

/**
 * 
 * @param {Component} newComponent 
 * @param {MapStateToPropsFunction} newMapStateToProps 
 */
export function replaceComponent(newComponent, newMapStateToProps) {
  console.log('replaceComponent newMapStateToProps', newMapStateToProps)

  if (!newMapStateToProps) {
    throw new Error("Missing _mapStateToProps in replaceComponent");
  }

  if (currentComponent) unmount(currentComponent)
  currentMapStateToProps = newMapStateToProps;
  
  const props = $state(currentMapStateToProps(store.state))
  currentProps = props;

  currentComponent = mount(newComponent, {
    target: svelteTarget,
    props: currentProps
  });

  document.documentElement.scrollTo(0, 0)
}

/**
 * 
 * @param {ScribouilliState} state 
 */
function render(state) {
  const props = currentMapStateToProps(state);
  
  if (props) {
    for(const key of Object.keys(currentProps)){
      delete currentProps[key]
    }

    Object.assign(currentProps, props)
  }

}

store.subscribe(render);