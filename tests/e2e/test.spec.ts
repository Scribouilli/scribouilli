import { test, expect } from '@playwright/test';


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
});
