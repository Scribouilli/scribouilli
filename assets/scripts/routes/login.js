// @ts-check

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import Login from "../components/screens/Login.svelte";

export default () => {
  const destination = location.origin + store.state.basePath + "/after-github-login";
  const client_id = "64ecce0b01397c2499a6";
  const redirect_url = "https://toctoctoc.dreads-unlock.fr/github-callback";
  const githubLoginHref = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,user:email&redirect_uri=${redirect_url}?destination=${destination}`;

  const login = new Login({
    target: svelteTarget,
    props: {
      href: githubLoginHref,
    },
  });

  replaceComponent(login, () => { });
}
