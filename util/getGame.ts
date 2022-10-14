export const getGame = async (context, episode) => {
    const { seasonId, episodeId, url } = episode;
  
    let gamePage = await context.newPage();
  
    await gamePage.goto(url);
    await gamePage.waitForLoadState();
  
    const gameData = await gamePage.$eval(
      "#jeopardy_round > table.round",
      (tableBody, { seasonId, episodeId }) => {
        return [...tableBody.rows].reduce((acc, row, index) => {
          if (index === 0) {
            const categories = [...row.querySelectorAll(".category")].map(
              (category) => category.textContent.trim()
            );
            acc.categories = categories;
            acc.seasonId = seasonId;
            acc.episodeId = episodeId;
            acc.clues = [[], [], [], [], [], []];
            return acc;
          }
  
          const clues = [...row.querySelectorAll(".clue")].map((clue, index) => {
            if (!clue.hasChildNodes()) {
              return {};
            }
            const prompt = clue.querySelector(".clue_text")?.textContent;
            if (!prompt) {
              return {};
            }
  
            const value = clue.querySelector(".clue_value")?.textContent;
            const dailyDoubleValue = clue.querySelector(
              ".clue_value_daily_double"
            )?.textContent;
            const [
              {
                groups: { answerHTML },
              },
            ] = clue
              .querySelector("table > tbody > tr > td > div")
              .getAttribute("onmouseover")
              .matchAll(/(?<answerHTML><em.*>.*<\/em>)/g) || [{}];
  
            const answerElement = document.createElement("div");
            answerElement.innerHTML = answerHTML;
  
            const answer = answerElement.textContent;
  
            return {
              seasonId,
              episodeId,
              category: acc.categories[index],
              prompt,
              value: value || dailyDoubleValue,
              answer,
              isDailyDouble: dailyDoubleValue ? true : false,
            };
          });
  
          acc.clues[0].push(clues[0]);
          acc.clues[1].push(clues[1]);
          acc.clues[2].push(clues[2]);
          acc.clues[3].push(clues[3]);
          acc.clues[4].push(clues[4]);
          acc.clues[5].push(clues[5]);
          return acc;
        }, {});
      },
      { seasonId, episodeId }
    );
    gamePage.close();
    return gameData;
  };