'use client'

import {
  CONSIGNOR_STATUS_MAP,
  ITEM_STATUS_DATA,
  ITEM_STATUS_KEY_MAP,
  ITEM_STATUS_MAP,
  ITEM_STATUS_MESSAGE_MAP,
  ITEM_TYPE_MAP,
} from '@/app/api/frontend/GetFrontendConfigs.data'
import { Item } from '@/app/api/frontend/items/GetConsignorItem'
import { ItemChoosesCompanyDirectPurchase } from '@/app/api/frontend/items/ItemChoosesCompanyDirectPurchase'
import { ItemConsignmentReview } from '@/app/api/frontend/items/ItemConsignmentReview'
import { ItemReady } from '@/app/api/frontend/items/ItemReady'
import { ItemReturn } from '@/app/api/frontend/items/ItemReturn'
import { Button } from '@/app/catalyst-ui/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '@/app/catalyst-ui/dialog'
import { Text } from '@/app/catalyst-ui/text'
import {
  DoubleCheckPopover,
  DoubleCheckPopoverButton,
} from '@/app/components/DoubleCheckPopover'
import { DATE_TIME_FORMAT } from '@/app/static'
import { bfs, StatusFlow } from '@/app/StatusFlow'
import { User } from '@/app/UserContext'
import clsx from 'clsx'
import { format } from 'date-fns'
import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function StatusFlowUI({ item, user }: { item: Item; user: User }) {
  const statusFlowWithConsignorActions = StatusFlow.withActions('consignor', {
    AppraisedStatus: (
      <div>
        <div className='flex flex-col gap-y-3'>
          <CompanyDirectPurchaseBtn item={item} user={user} />
          <ApproveConsignmentBtn item={item} user={user} />
          <DoubleCheckPopover
            title='取消託售'
            onConfirm={async () => {
              const res = await ItemConsignmentReview(item.id, {
                action: 'reject',
              })
              if (res.error) {
                toast.error(`操作錯誤: ${res.error}`)
                return
              }
              toast.success('託售已取消')
            }}
          >
            <DoubleCheckPopoverButton
              as={Button}
              outline
              className='h-9 w-full min-w-20'
            >
              取消託售
            </DoubleCheckPopoverButton>
          </DoubleCheckPopover>
        </div>

        {user.status ===
          CONSIGNOR_STATUS_MAP.AwaitingVerificationCompletionStatus && (
          <p className='mt-1 w-32 text-center text-sm text-gray-500'>
            完成
            <Link href='/me#identity-form' className='text-indigo-600 underline'>
              身份認證
            </Link>
            後即可申請現金收購或託售
          </p>
        )}
      </div>
    ),
    ConsignmentApprovedStatus: null,
    AppraiserConfirmedStatus: (
      <>
        <DoubleCheckPopover
          title='申請物品退回'
          onConfirm={async () => {
            const res = await ItemReturn(item.id)
            if (res.error) {
              toast.error(`操作錯誤: ${res.error}`)
              return
            }
            toast.success('物品已申請退回')
          }}
        >
          <DoubleCheckPopoverButton as={Button} outline color='zinc' className='h-9'>
            申請退回
          </DoubleCheckPopoverButton>
        </DoubleCheckPopover>
        <DoubleCheckPopover
          title='申請物品上架'
          onConfirm={async () => {
            const res = await ItemReady(item.id)
            if (res.error) {
              toast.error(`操作錯誤: ${res.error}`)
              return
            }
            toast.success('物品上架申請已送出')
          }}
        >
          <DoubleCheckPopoverButton as={Button} color='indigo' className='h-9'>
            申請上架
          </DoubleCheckPopoverButton>
        </DoubleCheckPopover>
      </>
    ),
  })

  if (process.env.NODE_ENV === 'development') {
    if (
      Object.keys(statusFlowWithConsignorActions).length !== ITEM_STATUS_DATA.length
    ) {
      const missing = ITEM_STATUS_DATA.map((s) => s.key).filter(
        (s) => !Object.keys(statusFlowWithConsignorActions).includes(s),
      )
      console.error(`Steps length mismatch, missing: ${missing.join(', ')}`)
    }
  }

  const path = bfs(
    Object.values(statusFlowWithConsignorActions).map((v) => ({
      value: v.status,
      nexts: v.nexts,
    })),
    'SubmitAppraisalStatus',
    ITEM_STATUS_KEY_MAP[item.status],
    (step) =>
      StatusFlow.flow[step.value].allowTypes.some(
        (t) => ITEM_TYPE_MAP[t] === item.type,
      ),
  )

  if (!path) {
    return null
  }

  // fill reset path
  while (true) {
    const last = path[path.length - 1]
    const step = statusFlowWithConsignorActions[last]
    const happyNext = step.nexts.find((s) =>
      StatusFlow.flow[s].allowTypes.some((t) => ITEM_TYPE_MAP[t] === item.type),
    )
    if (!happyNext) break
    path.push(happyNext)
  }

  const result = path.map((status) => {
    const step = statusFlowWithConsignorActions[status]
    const active = ITEM_STATUS_MAP[step.status] === item.status
    const time = item.pastStatuses[ITEM_STATUS_MAP[step.status]]

    return (
      <StatusStep
        key={step.status}
        text={ITEM_STATUS_MESSAGE_MAP[step.status]}
        time={time ? format(time, DATE_TIME_FORMAT) : undefined}
        active={active}
      >
        {active && 'actions' in step && step.actions}
      </StatusStep>
    )
  })

  // inject fake step --------------
  // const i = result.findIndex(({ key }) => key === 'ConsignmentApprovedStatus')
  // if (i !== -1) {
  //   const active = result[i + 2].props.active
  //   result.splice(i + 1, 0, <StatusStep key='fake' text='已到貨' active={active} />)
  // }
  // -------------------------------

  return result
}

function StatusStep({
  text,
  time,
  children,
  active,
}: {
  text: string
  time?: string
  children?: React.ReactNode
  active: boolean
}) {
  return (
    <div
      className={clsx(
        'relative flex items-start gap-x-4 pb-5 sm:gap-x-3 sm:pb-4',
        '[&[data-active]~[data-status-step]]:[--color:theme(colors.zinc.400)]',
        '[&[data-active]~[data-status-step]]:[--tail-color:theme(colors.zinc.400)]',
        '[&[data-active]]:[--tail-color:theme(colors.zinc.400)]',
        '[&:last-of-type_[data-tail]]:hidden',
        '[&[data-active]~[data-status-step]_[data-time]]:hidden',
      )}
      data-status-step
      data-active={active ? true : undefined}
    >
      <div
        data-tail
        className='absolute left-1 right-0 top-3 h-full w-0.5 bg-[--tail-color,theme(colors.indigo.600)]'
      />
      <div className='relative flex h-6 items-center'>
        <div className='size-2.5 rounded-full bg-[--color,theme(colors.indigo.600)]' />
      </div>
      <div className='flex grow flex-col gap-y-2'>
        <Text className={clsx(active && '!text-zinc-950')}>{text}</Text>
        {time && (
          <Text
            className={clsx('-mt-2 sm:-mt-3', active && '!text-zinc-950')}
            data-time
          >
            {time}
          </Text>
        )}
        {children && <div className='flex gap-x-4'>{children}</div>}
      </div>
    </div>
  )
}

function ApproveConsignmentBtn({ item, user }: { item: Item; user: User }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        color='indigo'
        className='h-9 min-w-20'
        onClick={() => setOpen(true)}
        disabled={
          user.status === CONSIGNOR_STATUS_MAP.AwaitingVerificationCompletionStatus
        }
      >
        託售
      </Button>
      <Dialog open={open} onClose={() => {}}>
        <DialogTitle>收費相關說明規章</DialogTitle>

        <DialogBody>
          <p>本公司收費方式</p>
          <p>我們目前收費詳細如下</p>
          <ol className='mt-4 list-inside list-decimal space-y-4 leading-snug'>
            <li>
              手續費 30%
              <br />
              我們將協助您
              <br />
              將商品送到日本雅虎競拍
              <br />
              收取的手續費為成交價的30%
              <br />
              此價格也包含日本雅虎平台會產生的費用
              <br />
              以及我們公司合理的利潤
              <br />
              所以此價格已經包含所有協助拍賣上架的服務
              <br />
              所有款項匯回台灣時 撥款到您戶頭內的日幣兌換台幣之
              <br />
              日幣匯率計算將採用台灣銀行當日的牌告現金匯率
              <br />
            </li>
            <li>
              寄倉費
              <br />
              每個物品會有一定的單位數
              <br />
              若您的商品上架到日本雅虎競拍後
              <br />
              在未產生得標者的情況下
              <br />
              我們就會酌收寄倉費
              <br />
              寄倉費的部分是一個單位30日100台幣
              <br />
              寄倉計算起始日由委售品在日本競標結束後隔日開始計算
              <br />
            </li>
            <li>
              若商品最後結標價格您不滿意需要取消時
              <br />
              那麼 我們將會跟您收取平台的手續費 <br />
              注意 商品結標價的10%是平台的手續費
              <br />
            </li>
            <li>
              若商品上架的途中需要停止
              <br />
              那麼我們將會收取雅虎的競標停止手續費550日幣
            </li>
          </ol>
        </DialogBody>

        <DialogActions>
          <Button outline onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            color='indigo'
            onClick={async () => {
              const res = await ItemConsignmentReview(item.id, { action: 'approve' })
              if (res.error) {
                toast.error(`操作錯誤: ${res.error}`)
                return
              }
              toast.success('已申請託售')
              setOpen(false)
            }}
          >
            確認託售
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function CompanyDirectPurchaseBtn({ item, user }: { item: Item; user: User }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        color='sky'
        className='h-9 min-w-20'
        onClick={() => setOpen(true)}
        disabled={
          user.status === CONSIGNOR_STATUS_MAP.AwaitingVerificationCompletionStatus
        }
      >
        現金收購
      </Button>
      <Dialog open={open} onClose={() => {}}>
        <DialogTitle>收費相關說明規章</DialogTitle>

        <DialogBody>
          <p>本公司收費方式</p>
          <p>我們目前收費詳細如下</p>
          <ol className='mt-4 list-inside list-decimal space-y-4 leading-snug'>
            <li>
              手續費 30%
              <br />
              我們將協助您
              <br />
              將商品送到日本雅虎競拍
              <br />
              收取的手續費為成交價的30%
              <br />
              此價格也包含日本雅虎平台會產生的費用
              <br />
              以及我們公司合理的利潤
              <br />
              所以此價格已經包含所有協助拍賣上架的服務
              <br />
              所有款項匯回台灣時 撥款到您戶頭內的日幣兌換台幣之
              <br />
              日幣匯率計算將採用台灣銀行當日的牌告現金匯率
              <br />
            </li>
            <li>
              寄倉費
              <br />
              每個物品會有一定的單位數
              <br />
              若您的商品上架到日本雅虎競拍後
              <br />
              在未產生得標者的情況下
              <br />
              我們就會酌收寄倉費
              <br />
              寄倉費的部分是一個單位30日100台幣
              <br />
              寄倉計算起始日由委售品在日本競標結束後隔日開始計算
              <br />
            </li>
            <li>
              若商品最後結標價格您不滿意需要取消時
              <br />
              那麼 我們將會跟您收取平台的手續費 <br />
              注意 商品結標價的10%是平台的手續費
              <br />
            </li>
            <li>
              若商品上架的途中需要停止
              <br />
              那麼我們將會收取雅虎的競標停止手續費550日幣
            </li>
          </ol>
        </DialogBody>

        <DialogActions>
          <Button outline onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            color='indigo'
            onClick={async () => {
              const res = await ItemChoosesCompanyDirectPurchase(item.id)
              if (res.error) {
                toast.error(`操作錯誤: ${res.error}`)
                return
              }
              toast.success('已申請現金收購')
              setOpen(false)
            }}
          >
            現金收購
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
