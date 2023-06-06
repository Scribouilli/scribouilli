//@ts-check

import page from "page";

import welcome from "./welcome.js";
import account from './account.js';
import login from './login.js';
import createProject from "./create-project.js";
import atelierListArticles from "./atelier-list-articles.js";

page("/", welcome);
page("/account", account);
page("/login", login);
page("/create-project", createProject);
page("/atelier-list-articles", atelierListArticles)