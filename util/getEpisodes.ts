export const getEpisodes = async (context, seasons) => {
    const episodes = seasons.map(async ({ seasonId, url }) => {
      let episodePage = await context.newPage();
      await episodePage.goto(url);
      await episodePage.waitForLoadState();
  
      const episodeData = await episodePage.$eval(
        "#content > table > tbody",
        (tableBody, { seasonId }) => {
          const data = [...tableBody.rows].map((row) => {
            const title = row.cells[0].textContent.trim();
            let [
              {
                groups: { episodeId, airDate },
              },
            ] = title.matchAll(
              /.*#(?<episodeId>.*),\s*(aired|taped)\s*(?<airDate>.*)/g
            ) || [{}];
  
            const contestants = row.cells[1].textContent
              .trim()
              .split(/\s*vs.\s*/g);
            const notes = row.cells[2].textContent.trim();
  
            const url = row.querySelector("a").href;
  
            if (seasonId === "trebekpilots") {
              if (episodeId === "1") {
                episodeId = "pilot1";
              }
              if (episodeId === "2") {
                episodeId = "pilot2";
              }
            }
  
            return {
              seasonId,
              id: episodeId,
              title,
              airDate,
              contestants,
              notes,
              url,
            };
          });
          return data;
        },
        { seasonId }
      );
  
      return episodeData;
    });
  
    return (await Promise.all(episodes)).flat();
};
