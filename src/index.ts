import debug from 'debug'
import { Server } from './server'
const log = debug('status:root')

function start () {
  log('Booting up...')
  const server = new Server()
  server.start()
}

start()
