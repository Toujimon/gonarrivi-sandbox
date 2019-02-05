onmessage = e => {
  setTimeout(() => postMessage("yoh, dudes: " + JSON.stringify(e.data)), 1000);
};
