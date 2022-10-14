import prisma from "../lib/prisma";
import chunk from "lodash.chunk";

import seasons from "./seasons.json";
import episodes from "./episodes.json";
import games from "./games.json";


async function main() {
  console.log("Populating seasons table");
  const seasonTransaction = await prisma.$transaction(
    seasons.map((season) =>
      prisma.season.upsert({
        where: { id: season.seasonId },
        update: {},
        create: {
          id: season.seasonId,
          title: season.title,
          startDate: new Date(season.startDate),
          endDate: new Date(season.endDate),
        },
      })
    )
  );
  console.log({ seasonTransaction });

  console.log("\nPopulating Episodes Table");
  const chunkedEpisodes = chunk(episodes, 1000);
  chunkedEpisodes.forEach(async (chunk) => {
    const episodeTransaction = await prisma.$transaction(
      chunk.map((episode) => {
        return prisma.episode.upsert({
          where: {
            seasonId_id: {
              seasonId: episode.seasonId,
              id: episode.episodeId,
            },
          },
          update: {},
          create: {
            id: episode.episodeId,
            title: episode.title,
            airDate: new Date(episode.airDate),
            contestants: episode.contestants,
            notes: episode.notes,
            seasonId: episode.seasonId,
          },
        });
      })
    );
    console.log({ episodeTransaction });
  });

  console.log("\nPopulating Games Table");
  const filteredGameRows = games.filter((game) =>
    game.clues.flat().every((clue) => clue.prompt)
  );

  const gameRows = filteredGameRows.map((game) => {
    return prisma.game.upsert({
      where: {
        seasonId_episodeId: {
          seasonId: game.seasonId,
          episodeId: game.episodeId,
        },
      },
      update: {},
      create: {
        categories: game.categories,
        seasonId: game.seasonId,
        episodeId: game.episodeId,
      },
    });
  });

  const chunkedGameRows: any[][] = chunk(gameRows, 1000);
  chunkedGameRows.forEach(async (chunk) => {
    const gameTransaction = await prisma.$transaction(chunk);
    console.log({ gameTransaction });
  });

  const filteredCluesRows = filteredGameRows
    .map((game: { clues: any }) => game.clues)
    .flat(2);

  const cluesRows = filteredCluesRows.map((clue) => {
    return prisma.clue.upsert({
      where: {
        prompt_answer: {
          prompt: clue.prompt,
          answer: clue.answer,
        },
      },
      update: {},
      create: {
        seasonId: clue.seasonId,
        episodeId: clue.episodeId,
        prompt: clue.prompt,
        answer: clue.answer,
        category: clue.category,
        value: clue.value,
        isDailyDouble: clue.isDailyDouble,
      },
    });
  });

  const chunkedCluesRows: any[][] = chunk(cluesRows, 1000);
  chunkedCluesRows.forEach(async (chunk) => {
    const clueTransaction = await prisma.$transaction(chunk);
    console.log({ clueTransaction });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\nFinished Seeding DB");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
