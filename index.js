const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/generateResult", async (req, res) => {
  const categories = [
    { catName: "aps", categoryName: "All", pageCount: 4 },
    { catName: "stripbooks-intl-ship", categoryName: "Books", pageCount: 4 },
    { catName: "digital-text", categoryName: "Kindle Store", pageCount: 4 },
  ];

  const searchTerm = "Super Vision: An Eye-Opening Approach to Getting Unstuck";
  const books = [];

  const statusElement = (message) => {
    // Send the status message to the client
    res.write(`Found in category: ${message}\n`);
  };
  (async () => {
    for (const { catName, categoryName, pageCount } of categories) {
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        // Send the category and page status
        statusElement(`${categoryName} Page: ${pageNum}`);

        const data = await fetchBooks(catName, pageNum);
        const foundTitleIndex = data.findIndex((title) => title === searchTerm);
        if (foundTitleIndex !== -1) {
          const ranking = foundTitleIndex + 1;
          books.push({
            title: searchTerm,
            pageNum,
            ranking,
            category: categoryName,
          });
        }
      }
    }

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Books");

    // ...

    // Save the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send the Excel file as a response
    res.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.set("Content-Disposition", "attachment; filename=book_results.xlsx");
    res.end(buffer); // Ensure the response is correctly terminated
  })();
});

const fetchBooks = async (catName, pageNum) => {
  const categoryLink1 = catName === "aps" ? "" : `&i=${catName}`;
  const categoryLink2 = catName === "aps" ? "" : `%2C${catName}`;

  try {
    const response = await axios.get(
      `https://www.amazon.com/s?k=personal+transformation+books${categoryLink1}&page=${pageNum}&sprefix=personal+transformation+books${categoryLink2}%2C530`,
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
          Pragma: "no-cache",
          "Cache-Control": "max-age=0",
          Vary: "Content-Type,X-Amazon-Wtm-Tag-SP-Search-Secured-Port-Enabled,Accept-Encoding,User-Agent",
        },
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);

    const books = [];
    $(
      "div.sg-col-20-of-24.s-result-item.s-asin.sg-col-0-of-12.sg-col-16-of-20.sg-col.s-widget-spacing-small.sg-col-12-of-16"
    ).each((_idx, el) => {
      const book = $(el);
      const title = book
        .find("span.a-size-medium.a-color-base.a-text-normal")
        .text();
      books.push(title);
    });

    return books;
  } catch (error) {
    console.error("Error in fetchBooks:", error);
    throw error;
  }
};

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
