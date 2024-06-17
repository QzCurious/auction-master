'use server'

import { z } from 'zod'
import { apiClient } from '../../apiClient'
import { withAuth } from '../../withAuth'

const ReqSchema = z.object({
  status: z.coerce.number().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
})

export interface Item {
  id: number
  consignorID: number
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
  sellerID: number
  reservePrice: number
  expireAt: any
  status: number
  createdAt: string
  updatedAt: string
}

interface Data extends Item {}

/**
 * 1801: item not exist
 */
type ErrorCode = '1801'

export async function getItem(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/frontend/items/${id}`, {
    method: 'GET',
    next: { tags: ['items'] },
  })

  return res
}