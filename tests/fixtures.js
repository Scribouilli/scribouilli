export const fakeStateWithOneSite = {
  oAuthProvider: {
    accessToken: '1234567890',
    name: 'github',
  },
  login: 'alice',
  email: 'alice@wonderland.io',
  origin: undefined,
  currentRepository: {
    name: 'alice.github.io',
    owner: 'alice',
    publishedWebsiteURL: 'https://alice.github.io',
    repositoryURL: 'https://github.org/alice/alice.github.io',
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
}
