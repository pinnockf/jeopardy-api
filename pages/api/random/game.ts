import prisma from "../../../lib/prisma";

const randomPick = (values: string[]) => {
  const index = Math.floor(Math.random() * values.length);
  return values[index];
};

const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomResult = async (orderBy: string, orderDir: string, itemCount: number) => {
  let result = await prisma.episode.findMany({
    orderBy: { [orderBy]: orderDir },
    take: 1,
    skip: randomNumber(0, itemCount - 1),
    include: {
      clues: true
    }
  });
  return result;
}

export default async function handle(req, res) {

  const itemCount = await prisma.episode.count();
  const orderBy = randomPick([
    "id",
    "title",
    "airDate",
    `contestants`,
    `notes`,
    `seasonId`,
  ]);
  const orderDir = randomPick([`asc`, `desc`]);

  let result = await getRandomResult(orderBy, orderDir, itemCount);
  let [episode] = result;
  
  let numClues = episode.clues.length;
  while (numClues < 30) {
    result = await getRandomResult(orderBy, orderDir, itemCount);
    [episode] = result;
    numClues = episode.clues.length;
  } 

  res.json(episode);
}
