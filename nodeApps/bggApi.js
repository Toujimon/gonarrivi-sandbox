const https = require("https");
const { URL } = require("url");
const xmlParser = require("xml2js");

const baseURl = "https://www.boardgamegeek.com/xmlapi";

function search(name) {
  const apiUrl = new URL(`${baseURl}/search`);
  apiUrl.searchParams.append("search", name);
  return new Promise((resolve, reject) => {
    https.get(apiUrl, res => {
      res.setEncoding("utf-8");
      let responseData = "";
      res.on("data", data => {
        responseData += data;
      });
      res.on("error", err => reject(err));
      res.on("end", () =>
        resolve(
          xmlParser.parseStringPromise(responseData).then(parsedData =>
            parsedData.boardgames.boardgame.map(boardgame => ({
              id: boardgame["$"].objectid,
              name: boardgame.name[0],
              yearpublished: boardgame.yearpublished[0]
            }))
          )
        )
      );
    });
  });
}

module.exports = { search };
