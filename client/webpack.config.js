//const path = require('path')

module.exports = {
    mode: 'production',
    resolve: {fallback: {
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
      "os":false,
      "timers": false,
      "fs":false,
      "child_process":false,
      "util":false,
      "url":require.resolve("url/"),
      "process":false,
      "path":false,
      "buffer":false,
      "assert": false,
      "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
    },}
}