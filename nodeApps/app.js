const http = require('http')
const express = require('express')
const fileUtils = require('./fileUtils')
const bggApi = require('./bggApi')
const {
  processedCatalogFilePath,
  indexedBggCatalogPath,
  epicBggJoinPath
} = require('./shared')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const cors = require('cors')
const socketIo = require('socket.io')

const port = 4000
const app = express()
const server = http.Server(app)

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-341005.okta.com/oauth2/default',
  clientId: '0oa249gcgj2McxEJn4x6',
  assertClaims: {
    aud: 'api://default'
  }
})

function verifyOktaAccessTokenBearer(headers) {
  const authHeader = headers.authorization || ''
  const [, accessToken] = authHeader.match(/Bearer (.+)/) || []

  return new Promise((resolve, reject) => {
    if (!accessToken) {
      reject(new Error())
    } else {
      const expectedAudience = 'api://default'

      return resolve(
        oktaJwtVerifier.verifyAccessToken(accessToken, expectedAudience)
      )
    }
  })
}

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 * (source: https://developer.okta.com/quickstart/#/react/nodejs/express)
 */
//let alreadyVerified = false;
function oktaAuthenticationRequired(req, res, next) {
  console.log('auth')
  return verifyOktaAccessTokenBearer(req.headers)
    .then(jwt => {
      // if (!alreadyVerified) {
      //   alreadyVerified = !alreadyVerified;
      //   console.log(jwt);
      // }
      req.jwt = jwt
      return next()
    })
    .catch(err => {
      // if (alreadyVerified) {
      //   alreadyVerified = !alreadyVerified;
      // }
      res.status(401).send(err.message)
    })
}

app.use(express.json())
app.use(cors()) // Cross-origin enabled for all sources right now

const io = socketIo(server)

io.on('connection', function(socket) {
  console.log('New connection', { id: socket.id, jwt: socket.jwt })
  io.emit('new-connection')
  socket.on('identify', ({ token }, callback) => {
    const expectedAudience = 'api://default'
    oktaJwtVerifier
      .verifyAccessToken(token, expectedAudience)
      .then(jwt => {
        // Storing the jwt on the socket!!
        socket.jwt = jwt
        console.log('Storing the JWT on the socket!!', { id: socket.id })
        return {
          message: `Returning the whole jwt right now (have to chagne it)`,
          jwt
        }
      })
      .catch(err => ({ message: `Couldn't understand a thing` }))
      .then(data => callback(data))
  })
  socket.on('check-identity', () => {
    console.log('Just to check', { id: socket.id, hasJwt: !!socket.jwt })
  })
  socket.on('disconnect', reason =>
    console.log('Lost connection', { id: socket.id, reason })
  )
})

app.get('/api/catalog', oktaAuthenticationRequired, (req, res) => {
  getAllData().then(([epicCatalog, bggCatalog, epicBggJoin]) => {
    res.send({ epicCatalog, bggCatalog, epicBggJoin })
  })
})

app.put('/api/catalog', oktaAuthenticationRequired, (req, res) => {
  console.log(`PUT catalog entry match`, req.body)
  const { id, bggMatchId } = req.body
  if (id) {
    getAllData().then(([, bggCatalog, epicBggJoin]) => {
      const epicBggJoinEntry = epicBggJoin[id]
      if (epicBggJoinEntry && (!bggMatchId || bggCatalog[bggMatchId])) {
        epicBggJoin[id].bggMatchId = bggMatchId
        fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath).then(() => {
          res.sendStatus(200)
        })
      } else {
        res.sendStatus(404)
      }
    })
  } else {
    res.sendStatus(500)
  }
})

app.delete('/api/catalog', oktaAuthenticationRequired, (req, res) => {
  console.log(`DELETE catalog entry matches`, req.body)
  const { id } = req.body
  if (id) {
    getAllData().then(([, , epicBggJoin]) => {
      const epicBggJoinEntry = epicBggJoin[id]
      if (epicBggJoinEntry) {
        epicBggJoin[id].foundBggMatches = []
        fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath).then(() => {
          res.sendStatus(200)
        })
      } else {
        res.sendStatus(404)
      }
    })
  } else {
    res.sendStatus(500)
  }
})

app.post('/api/catalog', oktaAuthenticationRequired, (req, res) => {
  console.log(`POST new catalog entry match`, req.body)
  const { id, bggMatchId } = req.body
  if (id && bggMatchId) {
    getAllData().then(([, indexedBggCatalog, epicBggJoin]) => {
      const epicBggJoinEntry = epicBggJoin[id]
      if (epicBggJoinEntry) {
        new Promise(resolve => {
          if (
            epicBggJoinEntry.bggMatchId !== bggMatchId &&
            (!epicBggJoinEntry.foundBggMatches ||
              !epicBggJoinEntry.foundBggMatches.includes(bggMatchId))
          ) {
            resolve(
              new Promise(resolve => {
                if (indexedBggCatalog[bggMatchId]) {
                  epicBggJoinEntry.foundBggMatches = (
                    epicBggJoinEntry.foundBggMatches || []
                  ).concat(bggMatchId)
                  resolve()
                } else {
                  resolve(
                    bggApi.get(bggMatchId).then(newBggGame => {
                      if (newBggGame) {
                        indexedBggCatalog[bggMatchId] = newBggGame
                        epicBggJoinEntry.foundBggMatches = (
                          epicBggJoinEntry.foundBggMatches || []
                        ).concat(bggMatchId)
                      } else {
                        throw new Error(
                          `Game with id "${bggMatchId}" not found`
                        )
                      }
                    })
                  )
                }
              }).then(() =>
                Promise.all([
                  fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath),
                  fileUtils.writeJsonToFile(
                    indexedBggCatalog,
                    indexedBggCatalogPath
                  )
                ])
              )
            )
          } else {
            resolve()
          }
        })
          .then(() => res.sendStatus(200))
          .catch(error => {
            res.status(500)
            res.send(error.message)
          })
      } else {
        res.sendStatus(404)
      }
    })
  } else {
    res.sendStatus(500)
  }
})

server.listen(port, () => {
  console.log(`Listening at port ${port}`)
})

/*-- UTILITY FUNCTIONS --*/
function getAllData() {
  return Promise.all([
    fileUtils.readJsonFromFile(processedCatalogFilePath),
    fileUtils.readJsonFromFile(indexedBggCatalogPath),
    fileUtils.readJsonFromFile(epicBggJoinPath)
  ])
}
