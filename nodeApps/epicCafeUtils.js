const Browser = require('zombie')
const https = require('https')

function fetchEpicCafeCatalog() {
  return new Promise((resolve, reject) => {
    const browser = new Browser()
    browser.visit('https://www.epicmadrid.com/nuestrosjuegos', () => {
      var dataSource = browser
        .queryAll('iframe')
        .map(x => x.getAttribute('data-src'))
        .find(x => x.indexOf('wix-visual-data.appspot.com') >= 0)

      const [, queryString] = dataSource.split('?')
      const queryStringEntries = queryString
        .split('&')
        .map(x => x.split('='))
        .filter(([name]) => name === 'compId' || name === 'instance')
      const url =
        'https://wix-visual-data.appspot.com/app/file' +
        '?' +
        queryStringEntries.map(entry => entry.join('=')).join('&')
      https.get(url, res => {
        let catalogText = ''
        res.setEncoding('utf-8')
        res
          .on('data', data => {
            catalogText += data
          })
          .on('end', () => resolve(catalogText))
          .on('error', error => reject(error))
      })
    })
  })
}

function processEpicCafeCatalog(catalogText) {
  const gameEntryKeys = ['name', 'coordinates', 'quantity', 'players', 'age']
  const catalog = []
  const keyValuesSets = gameEntryKeys.reduce(
    (acc, key) => ({ ...acc, [key]: new Set() }),
    {}
  )
  const [, ...gameEntriesLines] = catalogText.split('\n')
  return new Promise(resolve => {
    gameEntriesLines.forEach(gameEntryLine => {
      gameEntryLine = gameEntryLine.trim()
      const gameEntryValues = []
      let currentEntry = []
      let isEscapingSeparators = false
      const SEPARATOR = ','
      const ESCAPE_CHARACTER = '"'
      for (let character of gameEntryLine) {
        if (character === ESCAPE_CHARACTER) {
          isEscapingSeparators = !isEscapingSeparators
        } else if (character === SEPARATOR && !isEscapingSeparators) {
          gameEntryValues.push(currentEntry.join(''))
          currentEntry = []
        } else {
          currentEntry.push(character)
        }
      }
      gameEntryValues.push(currentEntry.join(''))
      let gameEntry = { raw: gameEntryLine }
      gameEntryKeys.forEach((key, index) => {
        const value = gameEntryValues[index]
        keyValuesSets[key].add(value)
        gameEntry[key] = (() => {
          switch (key) {
            case 'players': {
              const [, minString = '', , maxString = ''] =
                /(\d+)(\D*(\d*))$/.exec(value) || []
              return {
                type:
                  minString && maxString ? 'range' : minString ? 'min' : value,
                min: Number(minString),
                max: Number(maxString)
              }
            }
            case 'age': {
              const [min = ''] = /\d+/.exec(value) || []
              return Number(min)
            }
            case 'quantity': {
              const quantity = Number(value)
              return isNaN(quantity) ? 0 : quantity
            }
            default:
              return value
          }
        })()
      })
      gameEntry.id = gameEntry.raw
      gameEntry.idType = 'epic'
      catalog.push(gameEntry)
    })
    resolve([catalog, keyValuesSets])
  })
}

module.exports = {
  fetchEpicCafeCatalog,
  processEpicCafeCatalog
}
