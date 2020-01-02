import pm2 from 'pm2'
import moment from 'moment'
import config from '../config'

export interface ServiceStatus {
  name: string
  status: string
  uptime: string
}

const cache = {
  status: [] as ServiceStatus[]
}

function getServiceStatuses (): Promise<ServiceStatus[]> {
  return new Promise((resolve, reject) => {
    pm2.list((err, processes) => {
      if (err) return reject(err)
      const statuses = processes.map(p => ({
        name: p.name || 'N/A',
        status: (p.pm2_env || {}).status || 'N/A',
        uptime: moment((p.pm2_env || {}).pm_uptime).fromNow(true)
      }))
      return resolve(statuses)
    })
  })
}

async function update (): Promise<void> {
  cache.status = await getServiceStatuses()
}

export async function getStatuses (): Promise<ServiceStatus[]> {
  return cache.status
}

pm2.connect(err => {
  if (err) {
    console.error(err)
    process.exit(2)
  }
  setInterval(update, config.updateInterval)
})
