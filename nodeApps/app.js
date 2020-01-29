const express = require("express");
const fileUtils = require("./fileUtils");
const {
  processedCatalogFilePath,
  indexedBggCatalogPath,
  epicBggJoinPath
} = require("./shared");

const port = 4000;
const app = express();

app.get("/api/catalog", (req, res) => {
  Promise.all([
    fileUtils.readJsonFromFile(processedCatalogFilePath),
    fileUtils.readJsonFromFile(indexedBggCatalogPath),
    fileUtils.readJsonFromFile(epicBggJoinPath)
  ]).then(([epicCatalog, bggCatalog, epicBggJoin]) => {
    res.send({ epicCatalog, bggCatalog, epicBggJoin });
  });
});
// app.get("/*", (req, res) => {
//   console.log("request received", req.url);
//   res.send(`OK: ${req.path}`);
// });

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
