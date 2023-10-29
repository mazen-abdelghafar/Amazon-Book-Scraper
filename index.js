const axios = require("axios");
const cheerio = require("cheerio");

const fetchBooks = async (pageNum) => {
  try {
    const response = await axios.get(
      `https://www.amazon.com/s?k=personal+transformation+books&page=${pageNum}&crid=FTM2435CGVRP&qid=1698569245&sprefix=personal+transformation+books%2Caps%2C378&ref=sr_pg_2`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "axios 0.21.1",
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
    console.log("ERRORRRRRRS");
    throw error;
  }
};

let books = [];
for (let i = 1; i < 4; i++) {
  fetchBooks(i)
    .then((data) => {
      const foundTitle = data.filter(
        (title) => title === "Affirm Yourself: An Affirmation Coloring Book"
      );
      if (foundTitle[0] !== undefined) {
        console.log("Found Title", foundTitle[0]);
        console.log("Page Number", i);
        console.log("Ranking", data.indexOf(foundTitle[0]));
        // books.push({
        //   title: `Book Title ${foundTitle[0]}`,
        //   pageNum: `Page number ${i}`,
        //   ranking: `Ranking ${data.indexOf(foundTitle[0])}`,
        // });
        // console.log("books", books);
      }
    })
    .catch((err) => console.log("err", err));
}
