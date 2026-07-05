let activeView = "pochodnia";

export function setView(view) {
  activeView = view;
}

export function getView() {
  return activeView;
}

export function isView(view) {
  return activeView === view;
}
