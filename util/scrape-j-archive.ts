import playwright from "playwright";
import fs from "fs/promises";
import { getSeasons } from "./getSeasons";
import { getEpisodes } from "./getEpisodes";
import { getGame } from "./getGame";
import { getClues } from "./getClues";
import games from "../prisma/games.json";

const traverse = async () => {
  const browser = await playwright.chromium.launch({
    headless: true, // set this to true
  });

  // Create a new incognito browser context
  const context = await browser.newContext();

  const seasons = await getSeasons(context);
  const seasonsJSON = JSON.stringify(seasons, null, 4);
  await fs.writeFile("prisma/seasons.json", seasonsJSON);
  console.log("Seasons JSON data is saved.");

  const episodes = await getEpisodes(context, seasons);
  const episodesJSON = JSON.stringify(episodes, null, 4);
  await fs.writeFile("prisma/episodes.json", episodesJSON);
  console.log("Episodes JSON data is saved.");

  const games = [];
  const gameErrors = [];
  for (let i = 0; i < episodes.length; i++) {
    try {
      games.push(await getGame(context, episodes[i]));
    } catch (error) {
      gameErrors.push(episodes[i]);
    }
  }

  const gamesJSON = JSON.stringify(games, null, 4);
  await fs.writeFile(`prisma/games.json`, gamesJSON);
  console.log("Games JSON data is saved.");

  const gameErrorsJSON = JSON.stringify(gameErrors, null, 4);
  fs.writeFile(`prisma/gameErrors.json`, gameErrorsJSON);
  console.log("Game Errors JSON data is saved.");

  await browser.close();
  return { games };
};

const main = async () => {
  const { games } = await traverse();
  const clues = getClues(games);
  clues.forEach(async (episodeClues, epIndex) => {
    const cluesJSON = JSON.stringify(episodeClues, null, 4);
    await fs.writeFile(`prisma/clues/clues-ep${epIndex}.json`, cluesJSON);
    console.log(`clues-ep${epIndex} JSON data is saved.`);
  });
};

main();
