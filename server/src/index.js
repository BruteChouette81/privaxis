import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import {all} from '@libp2p/websockets/filters'
import { MemoryDatastore } from 'datastore-core'


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
console.log("test from v20")
console.log(node.status)
console.log("listenning on addresses:")
node.getMultiaddrs().forEach((addr) => {
  console.log(addr.toString())
})