import prisma from "../lib/prisma";
import seasonsJSON from "./seasons.json";
import episodesJSON from "./episodes.json";

async function main() {
  console.log("Populating seasons table");
  const seasonTransaction = await prisma.$transaction(
    seasonsJSON.map((season) =>
      prisma.season.upsert({
        where: { id: season.id },
        update: {},
        create: {
          id: season.id,
          title: season.title,
          startDate: new Date(season.startDate),
          endDate: new Date(season.endDate),
        },
      })
    )
  );
  console.log({ seasonTransaction });

  console.log("\nPopulating Episodes Table");
  episodesJSON.forEach(async (episodeList) => {
    const episodeTransaction = await prisma.$transaction(
      episodeList.map((episode) => {
        return prisma.episode.upsert({
          where: {
            seasonId_id: {
              seasonId: episode.seasonId,
              id: episode.id,
            },
          },
          update: {},
          create: {
            id: episode.id,
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
}

main()
  .then(async () => {
      await prisma.$disconnect();
      console.log('\nFinished Seeding DB')
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
