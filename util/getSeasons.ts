export const getSeasons = async (context) => {
    const page = await context.newPage();
    const pageUrl = "https://j-archive.com/listseasons.php";
    await page.goto(pageUrl);
    const seasons = await page.$eval("#content > table > tbody", (tableBody) => {
      const data = [...tableBody.rows].map((row) => {
        const title = row.cells[0].innerText;
  
        const dates = row.cells[1].innerText.trim();
        const [
          {
            groups: { startDate, endDate },
          },
        ] = dates.matchAll(/(?<startDate>.*)( to | and )(?<endDate>.*)/g) || [{}];
  
        const url = row.querySelector("a").href;
        const [
          {
            groups: { seasonId },
          },
        ] = url.matchAll(/.*season=(?<seasonId>.*)/g);
  
        return {
          dates,
          id: seasonId,
          title,
          startDate,
          endDate,
          url,
        };
      });
      return data;
    });
  
    return seasons;
  };