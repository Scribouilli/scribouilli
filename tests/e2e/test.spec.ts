import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });

test('Je crée un minisite', async ({ page }) => {
  await page.goto('https://atelier.scribouilli.org/');

  // Page d'accueil
  await expect(page.getByRole('heading', { name: 'Créez votre petit site facilement !' })).toBeVisible();
  await page.getByRole('link', { name: "C'est parti !" }).click();

  // Connexion
  await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
  await page.getByRole('link', { name: "ScribouGit" }).click();

  // Compte
  await expect(page.getByRole('heading', { name: 'Avez-vous un compte sur git.scribouilli.org ?' })).toBeVisible();
  await page.getByRole('link', { name: "Oui, je me connecte" }).click();

  // Clés
  await expect(page.getByRole('heading', { name: /Super/i })).toBeVisible();
  await page.getByRole('link', { name: /Je me connecte/i }).click();

  // Scribougit
  await expect(page).toHaveURL('https://git.scribouilli.org/users/sign_in');
  
  // ici ça ne passe pas, peut-être que le label est en anglais
  await page.getByLabel(`Nom d'utilisateur ou adresse de courriel principale`).fill(process.env["scribougit_username"]);
  await page.getByLabel(`Mot de passe`).fill(process.env["scribougit_password"]);
  await page.getByRole('link', { name: 'Connexion' }).click();
  await expect(page).toHaveURL(/^https\:\/\/git\.scribouilli\.org\/oauth\/authorize/);
});
