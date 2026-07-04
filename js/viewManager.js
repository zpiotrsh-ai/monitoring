let activeView = "pochodnia";

export function setView(name) {
  activeView = name;
}

export function getView() {
  return activeView;
}

export function isView(name) {
  return activeView === name;
}
