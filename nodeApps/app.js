const express = require("express");
const { getProcessedCatalogFilePath } = require("./shared");

const port = 4000;
const app = express();

app.get("/api/catalog/:version", (req, res) => {
  res.sendFile(getProcessedCatalogFilePath(req.params.version));
});
// app.get("/*", (req, res) => {
//   console.log("request received", req.url);
//   res.send(`OK: ${req.path}`);
// });

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
