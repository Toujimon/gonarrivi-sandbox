const express = require("express");
const fileUtils = require("./fileUtils")
const path = require("path");

const outputDirectoryPath = path.resolve(__dirname, "output");

const getRawCatalogFilePath = version =>
  path.resolve(
    outputDirectoryPath,
    `raw_${version < 10 ? "0" : ""}${version}.txt`
  );
const getProcessedCatalogFilePath = version =>
  path.resolve(
    outputDirectoryPath,
    `catalog_${version < 10 ? "0" : ""}${version}.json`
  );
const bggMatchesFilePath = path.resolve(outputDirectoryPath, `bggMatches.json`);

const port = 4000;
const app = express();

app.get("/api/catalog/:version", (req, res) => {
  res.sendFile(getProcessedCatalogFilePath(req.params.version));
});
app.get("/*", (req, res) => {
  console.log("request received", req.url);
  res.send(`OK: ${req.path}`);
});

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
