//@ts-check

import store from "./store.js";

let currentComponent;
let currentMapStateToProps = (_) => {};

export function replaceComponent(newComponent, newMapStateToProps) {
  if (!newMapStateToProps) {
    throw new Error("Missing _mapStateToProps in replaceComponent");
  }

  if (currentComponent) currentComponent.$destroy();

  currentComponent = newComponent;
  currentMapStateToProps = newMapStateToProps;
}

function render(state) {
  const props = currentMapStateToProps(state);
  // @ts-ignore
  if (props) {
    currentComponent.$set(props);
  }
}

store.subscribe(render);
