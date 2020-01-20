var Browser = require("zombie");
var https = require("https");

function fetchEpicCafeCatalog() {
  return new Promise((resolve, reject) => {
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
        var fileResponse = "";
        res
          .on("error", error => reject(error))
          .on("data", data => {
            fileResponse += data;
          })
          .on("end", () => {
            resolve(fileResponse);
          });
      });
    });
  });
}

module.exports = {
  fetchEpicCafeCatalog
};
