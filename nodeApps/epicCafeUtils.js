var Browser = require("zombie");
var https = require("https");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function fetchEpicCafeCatalog(outputFilePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputFilePath)) {
      const browser = new Browser();
      browser.visit("https://www.epicmadrid.com/nuestrosjuegos", () => {
        var dataSource = browser
          .queryAll("iframe")
          .map(x => x.getAttribute("data-src"))
          .find(x => x.indexOf("wix-visual-data.appspot.com") >= 0);

        const [, queryString] = dataSource.split("?");
        const queryStringEntries = queryString
          .split("&")
          .map(x => x.split("="))
          .filter(([name]) => name === "compId" || name === "instance");
        const url =
          "https://wix-visual-data.appspot.com/app/file" +
          "?" +
          queryStringEntries.map(entry => entry.join("=")).join("&");
        https.get(url, res => {
          res.setEncoding("utf-8");
          res
            .pipe(fs.createWriteStream(outputFilePath))
            .on("close", () => resolve(true));
          res.on("error", error => reject(error));
        });
      });
    } else {
      resolve(false);
    }
  });
}

function parseEpicCafeCatalog(inputFilePath, outputDirectoryPath) {
  const gameEntryKeys = ["name", "coordinates", "quantity", "players", "age"];
  const catalog = [];
  const keyValuesSets = gameEntryKeys.reduce(
    (acc, key) => ({ ...acc, [key]: new Set() }),
    {}
  );
  let readLine = () => {
    readLine = gameEntryLine => {
      const gameEntryValues = [];
      let currentEntry = [];
      let isEscapingSeparators = false;
      const SEPARATOR = ",";
      const ESCAPE_CHARACTER = '"';
      for (let character of gameEntryLine) {
        if (character === ESCAPE_CHARACTER) {
          isEscapingSeparators = !isEscapingSeparators;
        } else if (character === SEPARATOR && !isEscapingSeparators) {
          gameEntryValues.push(currentEntry.join(""));
          currentEntry = [];
        } else {
          currentEntry.push(character);
        }
      }
      gameEntryValues.push(currentEntry);
      let gameEntry = { raw: gameEntryLine };
      gameEntryKeys.forEach((key, index) => {
        const value = gameEntryValues[index];
        keyValuesSets[key].add(value);
        gameEntry[key] = (() => {
          switch (key) {
            case "players": {
              const [, minString = "", , maxString = ""] =
                /(\d+)(\D*(\d*))$/.exec(value) || [];
              return {
                type:
                  minString && maxString ? "range" : minString ? "min" : value,
                min: Number(minString),
                max: Number(maxString)
              };
            }
            case "age": {
              const [min = ""] = /\d+/.exec(value) || [];
              return Number(min);
            }
            case "quantity": {
              const quantity = Number(value);
              return isNaN(quantity) ? 0 : quantity;
            }
            default:
              return value;
          }
        })();
      });
      catalog.push(gameEntry);
    };
  };
  readline
    .createInterface(fs.createReadStream(inputFilePath))
    .on("line", line => readLine(line))
    .on("close", () => {
      fs.writeFile(
        path.resolve(outputDirectoryPath, "catalog.json"),
        JSON.stringify(catalog, null, 2),
        () => null
      );
      gameEntryKeys.forEach(key =>
        fs.writeFile(
          path.resolve(outputDirectoryPath, `set_${key}.txt`),
          [...keyValuesSets[key]].join("\n"),
          () => null
        )
      );
    });
}

module.exports = {
  fetchEpicCafeCatalog,
  parseEpicCafeCatalog
};
