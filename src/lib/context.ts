import { createContext } from 'svelte';
import type { MinimalGitRepository, ScribouilliBackendProvider } from './providers';
import type ScribouilliGitRepo from './atelier/repo.svelte';
import type { User } from './user';

export const [getProvider, setProvider] = createContext<ScribouilliBackendProvider>();
export const [getCurrentRepo, setCurrentRepo] = createContext<ScribouilliGitRepo>();
export const [getRepos, setRepos] = createContext<MinimalGitRepository[]>();
export const [getUser, setUser] = createContext<User>();

export const context = {
  getProvider,
  setProvider,
  getCurrentRepo,
  setCurrentRepo,
  getRepos,
  setRepos,
  getUser,
  setUser,
}
