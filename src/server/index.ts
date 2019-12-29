import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import moment from 'moment'
import chalk from 'chalk'
import debug from 'debug'
import routes from './routes'
import config from '../config'
const log = debug('status:server')

export class Server {
  private server = express()
  constructor () {
    // disabling etag disables express' built-in cache system
    // this.server.disable('etag')
    this.server.set('env', process.env.NODE_ENV || 'development')
    this.server.set('port', config.port)
    this.server.set('hostname', config.hostname)
    this.server.set('views', config.paths.views)
    this.server.set('view engine', config.viewEngine)
    this.server.use(bodyParser.json())
    this.server.use(bodyParser.urlencoded({ extended: true }))

    // log management
    if (config.log === 'self') {
      morgan.token('protocol', req => req.secure || req.get('x-forwarded-proto') || req.protocol === 'https' ? chalk.green('HTTPS') : chalk.gray('HTTP'))
      morgan.token('date', () => moment().format('DD-MM-YYYY HH:mm:ss'))
      morgan.token('status', (_, res) => chalk[res.statusCode >= 500 ? 'bgRed' : res.statusCode >= 400 ? 'yellow' : res.statusCode >= 300 ? 'cyan' : res.statusCode >= 200 ? 'green' : 'white'](res.statusCode.toString()))
      this.server.use(morgan(`[:date] ${chalk.red(':remote-addr')} - ${chalk.bold(':method')} ${chalk.blue(':url')} using :protocol/:http-version -> :status in :response-time ms (agent: ${chalk.magenta('":user-agent"')}, from: ${chalk.yellow('":referrer"')})`))
    } else {
      require(config.log)(this.server, config.name)
    }

    log('Setting up routes...')
    this.server.use(routes)
  }

  start () {
    const port = process.env.NODE_ENV === 'production' ? this.server.get('port') : 80
    this.server.listen(port, () => {
      log('Server listening on port %o', port)
    })
  }
}
