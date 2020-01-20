var epicCafeUtils = require("./epicCafeUtils");

async function test() {
  try {
    const catalog = await epicCafeUtils.fetchEpicCafeCatalog();
    console.log("finished", catalog);
  } catch (e) {
    console.error("error", e);
  }
}

test();
