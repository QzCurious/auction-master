'use server'

import { apiClient } from '../../apiClient'
import { withAuth } from '../../withAuth'
import { CONSIGNOR_STATUS_DATA } from '../configs.data'

export interface Consignor {
  id: number
  account: string
  password: string
  nickname: string
  name: string
  identification: string
  phone: string
  bankCode: string
  bankAccount: string
  status: (typeof CONSIGNOR_STATUS_DATA)[number]['value']
  createdAt: string
  updatedAt: string
}

interface Data extends Consignor {}

type ErrorCode = never

export async function getConsignor() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/frontend/consignor', {
    method: 'GET',
    next: { tags: ['consignor'] },
  })

  return res
}
