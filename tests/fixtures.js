
/** @type {import("../assets/scripts/store").ScribouilliState} */
export const fakeStateWithOneSite = {
  oAuthProvider: {
    origin: 'https://github.com',
    accessToken: '1234567890',
    name: 'github',
  },
  login: 'alice',
  email: 'alice@wonderland.io',
  origin: undefined,
  //@ts-ignore
  currentRepository: {
    repoName: 'alice.github.io',
    owner: 'alice',
    publicRepositoryURL: 'https://github.com/alice/alice.github.io.git',
    origin: 'https://github.com',
  },
  // We use the term "account" to refer to user or organization.
  reposByAccount: {
    alice: [
      {
        name: 'alice.github.io',
        owner: 'alice',
        publishedWebsiteURL: 'https://alice.github.io',
        repositoryURL: 'https://github.org/alice/alice.github.io',
      },
    ],
  },
  buildStatus: {
    setBuildingAndCheckStatusLater(){}
  }
}
