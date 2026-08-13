// import global styles
import "globalStyles/reset.css";
import "globalStyles/main.css";

// process.nextTick polyfill
window.process = {
  ...window.process,
  nextTick: cb => Promise.resolve().then(cb)
};

import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "store";
import AppLayout from "layouts/app";
import { KnobOverlayManager } from "components/knob/overlay";

const Sequencer = React.lazy(() => import("./sequencer"));

const App = () => {
  React.useLayoutEffect(() => {
    if ("performance" in window && "mark" in window.performance)
      performance.mark("first_layout_render");

    var loaderElement = document.getElementById("loader");
    loaderElement.addEventListener("transitionend", () => {
      loaderElement.parentNode.removeChild(loaderElement);
    });
    loaderElement.className = "loader-wrapper done";
    document.getElementById("root").className = "";
  }, []);

  return (
    <Provider store={store}>
        <KnobOverlayManager>
          <div style={{ width: "100%", height: "100%" }}>
            <React.Suspense fallback={null}>
              <Sequencer />
            </React.Suspense>
            <AppLayout />
          </div>
        </KnobOverlayManager>
    </Provider>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
