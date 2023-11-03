const axios = require("axios");
const cheerio = require("cheerio");

const fetchBooks = async (catName, pageNum) => {
  try {
    const categoryLink1 = catName === "aps" ? "" : `&i=${catName}`;
    const categoryLink2 = catName === "aps" ? "" : `%2C${catName}`;

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
    console.log("ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
    throw error;
  }
};

let books = [];

// fetchBooks("stripbooks-intl-ship", 2).then((books) => console.log(books));

let category = ["aps", "stripbooks-intl-ship", "digital-text"];
// let category2 = {
//   all: "aps",
//   books: "stripbooks-intl-ship",
//   "kindle-store": "digital-text",
// };

for (let j = 0; j < category.length; j++) {
  for (let i = 1; i < 4; i++) {
    fetchBooks(category[j], i)
      .then((data) => {
        const foundTitle = data.filter(
          (title) =>
            title === "Super Vision: An Eye-Opening Approach to Getting Unstuck"
        );
        if (foundTitle[0] !== undefined) {
          // console.log("Found Title", foundTitle[0]);
          // console.log("Page Number", i);
          // console.log("Ranking", data.indexOf(foundTitle[0]) + 1);
          books.push({
            title: `${foundTitle[0]}`,
            pageNum: `${i}`,
            ranking: `${data.indexOf(foundTitle[0]) + 1}`,
            category: `${category[j]}`,
          });
          console.log("books", books);
        }
      })
      // .then(() => console.log("books", books))
      .catch((err) => console.log("err", err));
  }
}
