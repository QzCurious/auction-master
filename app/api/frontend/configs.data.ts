import { mapToObj } from 'remeda'

export const CONFIGS_DATA = {
  yahooAuctionFeeRate: 0.1,
  commissionRate: 0.2,
  commissionBonusRate: 0.05,
  lineURL: 'https://lin.ee/YgTRcyc',
  itemType: [
    {
      key: 'AppraisableAuctionItemType',
      message: '可估價競標物品',
      value: 1,
    },
    {
      key: 'NonAppraisableAuctionItemType',
      message: '不可估價競標物品',
      value: 2,
    },
    {
      key: 'FixedPriceItemType',
      message: '定價物品',
      value: 3,
    },
  ],
  itemStatus: [
    {
      key: 'SubmitAppraisalStatus',
      message: '已提交估價',
      value: 1,
    },
    {
      key: 'AppraisalFailureStatus',
      message: '估價失敗',
      value: 2,
    },
    {
      key: 'AppraisedStatus',
      message: '已估價',
      value: 3,
    },
    {
      key: 'ConsignmentApprovedStatus',
      message: '同意託售',
      value: 11,
    },
    {
      key: 'ConsignmentCanceledStatus',
      message: '取消託售',
      value: 12,
    },
    {
      key: 'WarehouseReturnPendingStatus',
      message: '準備退回',
      value: 21,
    },
    {
      key: 'WarehouseReturningStatus',
      message: '退貨準備中',
      value: 22,
    },
    {
      key: 'WarehouseArrivalStatus',
      message: '倉管已確認',
      value: 23,
    },
    {
      key: 'DetailsFullyCompletedStatus',
      message: '客服已確認',
      value: 24,
    },
    {
      key: 'ReadyStatus',
      message: '準備上架',
      value: 25,
    },
    {
      key: 'BiddingStatus',
      message: '競標中',
      value: 26,
    },
    {
      key: 'SoldStatus',
      message: '已售出',
      value: 31,
    },
    {
      key: 'ReturnedStatus',
      message: '退回',
      value: 32,
    },
    {
      key: 'CompanyRepurchasedStatus',
      message: '被公司買回',
      value: 33,
    },
  ],
  auctionItemStatus: [
    {
      key: 'InitStatus',
      message: '初始化',
      value: 1,
    },
    {
      key: 'StopBiddingStatus',
      message: '停止出價',
      value: 2,
    },
    {
      key: 'HighestBiddedStatus',
      message: '系統出價最高者',
      value: 3,
    },
    {
      key: 'NotHighestBiddedStatus',
      message: '系統已出價但未最高者',
      value: 4,
    },
    {
      key: 'ClosedStatus',
      message: '結標',
      value: 11,
    },
    {
      key: 'SoldStatus',
      message: '售出',
      value: 21,
    },
    {
      key: 'CanceledStatus',
      message: '手動取消',
      value: 22,
    },
  ],
  consignorStatus: [
    {
      key: 'EnabledStatus',
      message: '啟用',
      value: 1,
    },
    {
      key: 'AwaitingVerificationCompletionStatus',
      message: '身份尚未驗證',
      value: 11,
    },
    {
      key: 'DisabledStatus',
      message: '禁用',
      value: 99,
    },
  ],
  consignorVerificationStatus: [
    {
      key: 'AwaitingVerificationCompletionStatus',
      message: '尚未審核',
      value: 11,
    },
    {
      key: 'VerificationSuccessfulStatus',
      message: '驗證成功',
      value: 12,
    },
    {
      key: 'VerificationFailedStatus',
      message: '驗證失敗',
      value: 13,
    },
  ],
  shippingInfo: '',
} as const

export const ITEM_TYPE_DATA = CONFIGS_DATA.itemType
export const ITEM_TYPE_MAP = mapToObj(ITEM_TYPE_DATA, ({ key, value }) => [
  key,
  value,
])

export const ITEM_STATUS_DATA = CONFIGS_DATA.itemStatus
export const ITEM_STATUS_MAP = mapToObj(ITEM_STATUS_DATA, ({ key, value }) => [
  key,
  value,
])
export const ITEM_STATUS_MESSAGE_MAP = mapToObj(
  ITEM_STATUS_DATA,
  ({ key, message }) => [key, message],
)
export const ITEM_STATUS_KEY_MAP = mapToObj(ITEM_STATUS_DATA, ({ key, value }) => [
  value,
  key,
])

export const AUCTION_ITEM_STATUS_DATA = CONFIGS_DATA.auctionItemStatus

export const CONSIGNOR_STATUS_DATA = CONFIGS_DATA.consignorStatus
export const CONSIGNOR_STATUS_MAP = mapToObj(
  CONSIGNOR_STATUS_DATA,
  ({ key, value }) => [key, value],
)

export const CONSIGNOR_VERIFICATION_STATUS_DATA =
  CONFIGS_DATA.consignorVerificationStatus
export const SHIPPING_INFO = CONFIGS_DATA.shippingInfo
