//@ts-check

import page from "page";

import welcome from "./welcome.js";
import account from './account.js';
import login from './login.js';
import createProject from "./create-project.js";
import atelierListArticles from "./atelier-list-articles.js";
import atelierListPages from "./atelier-list-pages.js";
import atelierPages from "./atelier-pages.js";
import atelierArticles from "./atelier-articles.js";
import createGithubAccount from "./create-github-account.js";

page("/", welcome);
page("/account", account);
page("/login", login);
page("/create-project", createProject);
page("/atelier-list-articles", atelierListArticles)
page("/atelier-list-pages", atelierListPages)
page("/atelier-page", atelierPages)
page("/atelier-article", atelierArticles)
page("/create-github-account", createGithubAccount)