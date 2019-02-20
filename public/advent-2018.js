// TODO: Modify to include adven 2018 resolving code
onmessage = e => {
  setTimeout(() => postMessage("yoh, dudes: " + JSON.stringify(e.data)), 1000);
};
