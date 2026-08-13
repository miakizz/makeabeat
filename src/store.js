import { compose, createStore } from "redux";
import { setAutoFreeze } from "immer";

import { persistStore, persistReducer } from "redux-persist";

import rootReducer from "reducers";
import initialState from "initialState";

setAutoFreeze(false);

const middleware = [];

if ("production" !== process.env.NODE_ENV && window.devToolsExtension) {
  middleware.push(window.devToolsExtension());
}

const enhancer = compose(...middleware);

export const store = createStore(rootReducer, initialState, enhancer);
export const persistor = persistStore(store);
