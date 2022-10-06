import prisma from "../../lib/prisma";

export default async function handle(req, res) {
  // Returns a list of seasons
  const seasons = await prisma.season.findMany({
    include: {
      episodes: true,
    },
  });
  res.json(seasons);
}
