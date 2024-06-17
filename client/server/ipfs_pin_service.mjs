//node js app to host a custom ipfs listener/ pin service
import { WebSocketServer  } from 'ws'

/*import { noise } from '@chainsafe/libp2p-noise'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import {all} from '@libp2p/websockets/filters'
import { MemoryDatastore } from 'datastore-core'
import { createLibp2p } from 'libp2p'*/

/*const noise = require("@chainsafe/libp2p-noise")
const identify = require('@libp2p/identify')
const webSockets = require('@libp2p/websockets')
const filters = require('@libp2p/websockets/filters')
const MemoryDatastore = require('datastore-core')
const libp2p = require('libp2p')*/

const server = new WebSocketServer ({
  port: 8080
});

let sockets = [];
console.log("Hosting websocket server at port: 8080 : " + server)
server.on('connection', function(socket) {
    console.log("Connection:")
    sockets.push(socket);

    // When you receive a message, send that message to every socket.
    socket.on('message', function(msg) {
        sockets.forEach(s => s.send(msg));
    });

    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
    });
});


async function test() {
    const datastore = new MemoryDatastore()
    const node = await createLibp2p({ //Websocket(ws://cpltechnologies.com/websocketserver)
        datastore,
        addresses: {
        listen: ['/ip4/127.0.0.1/tcp/8080/ws']
        },
        transports: [
        webSockets( {
            filter: all
        }) //{ filter: filters.all}
        ],
        connectionEncryption: [
        noise()
        ],
        services: {
        identify: identify({protocolPrefix: 'ipfs'})
        }
        
    })

    node.start()
    console.log(node.status)

}


