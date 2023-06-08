//@ts-check

import "./routes/main.js";
import store from "./store.js";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
} from "./config.js";

// @ts-ignore
window.Buffer = buffer.Buffer;

// Store access_token in browser
const url = new URL(location.href);
if (url.searchParams.has(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)) {
  url.searchParams.delete(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER);
  history.replaceState(undefined, "", url);

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, store.state.accessToken);
}
