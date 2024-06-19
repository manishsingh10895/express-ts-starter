if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

import * as http from 'http'
import config from './config'
import { Socket } from './socket'
import app from './server'

const server = http.createServer(app());

const socket = new Socket(server)

console.log("Server");

const _server = server.listen(process.env.PORT || config.PORT);

_server.on('error', (e: Error) => {
  console.log('Error starting server' + e)
})

_server.on('listening', () => {
  {
    console.log(
      `Server started on port ${config.PORT} on env ${process.env.NODE_ENV ||
      'dev'} using DB ${config.DB_URL}`,
    )
  }
})

_server.timeout = 30 * 1000;

export default {
  server,
  socket,
}


process.on('unhandledRejection', (err) => {
  console.log(err);
});