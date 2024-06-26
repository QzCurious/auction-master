import { z } from 'zod'
import { apiClient } from '../../apiClient'
import { throwIfInvalid } from '../../helpers/throwIfInvalid'
import { withAuth } from '../../withAuth'

export const ReqSchema = z.object({
  status: z.coerce.number().array().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
})

interface Data {
  items: Array<{
    id: number
    nickname: string
    type: number
    name: string
    description: string
    photos: Array<{
      sorted: number
      photo: string
    }>
    space: number
    minEstimatedPrice: number
    maxEstimatedPrice: number
    reservePrice: number
    expireAt: string
    status: number
    createdAt: string
    updatedAt: string
  }>
  count: number
}

type ErrorCode = never

export async function items(payload: z.input<typeof ReqSchema>) {
  'use server'
  const parsed = throwIfInvalid(payload, ReqSchema)

  const query = new URLSearchParams()

  for (const status of parsed.status ?? []) {
    query.append('status', status.toString())
  }
  parsed.sort != null && query.append('sort', parsed.sort)
  parsed.order != null && query.append('order', parsed.order)
  parsed.limit != null && query.append('limit', parsed.limit.toString())
  parsed.offset != null && query.append('offset', parsed.offset.toString())

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/frontend/items?${query}`, {
    method: 'GET',
    next: { tags: ['items'] },
  })

  return res
}
