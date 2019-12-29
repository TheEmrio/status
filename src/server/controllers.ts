import { RequestHandler } from 'express'
import { getStatuses } from '../status'

export const getStatus: RequestHandler = async function (_req, res) {
  const statuses = await getStatuses()
  res.render('main', { statuses })
}
