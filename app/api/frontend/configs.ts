'use server'

import { apiClient } from '../apiClient'
import { withAuth } from '../withAuth'
import { CONFIGS_DATA } from './configs.data'

export interface Configs {
  yahooAuctionFeeRate: number
  commissionRate: number
  commissionBonusRate: number
  itemType: Array<{
    key: (typeof CONFIGS_DATA.itemType)[number]['key']
    message: string
    value: number
  }>
  itemStatus: Array<{
    key: (typeof CONFIGS_DATA.itemStatus)[number]['key']
    message: string
    value: number
  }>
  auctionItemStatus: Array<{
    key: (typeof CONFIGS_DATA.auctionItemStatus)[number]['key']
    message: string
    value: number
  }>
  consignorStatus: Array<{
    message: string
    value: number
  }>
  consignorVerificationStatus: Array<{
    message: string
    value: number
  }>
  shippingInfo: string
}

interface Data extends Configs {}

type ErrorCode = never

export async function configs() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/frontend/configs', {
    method: 'GET',
    next: { tags: ['configs'] },
  })

  return res
}
