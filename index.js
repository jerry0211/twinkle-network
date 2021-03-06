'use strict'

require('babel-register')({})
require('babel-polyfill')

const server = require('./entry/server').default
if (process.env.NODE_ENV === 'production') {
  require('greenlock-express')
    .create({
      version: 'draft-11',
      server: 'https://acme-v02.api.letsencrypt.org/directory',
      email: 'mikey1384@gmail.com',
      agreeTos: true,
      approveDomains: [
        'www.twin-kle.com',
        'twin-kle.com',
        'www.twinkle.network',
        'twinkle.network'
      ],
      app: server
    })
    .listen(80, 443)
} else {
  const http = require('http')
  const DEV_PORT = process.env.PORT

  http.createServer(server).listen(DEV_PORT, function() {
    console.log('Server listening on port:', DEV_PORT)
  })
}
