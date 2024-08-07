import { BonusLog, GetBonusLogs } from '@/app/api/frontend/bonuses/GetBonusLogs'
import { GetConsignorBonusBalance } from '@/app/api/frontend/bonuses/GetConsignorBonusBalance'
import { BONUS_ACTION, WALLET_ACTION } from '@/app/api/frontend/static-configs.data'
import { GetConsignorWalletBalance } from '@/app/api/frontend/wallets/GetConsignorWalletBalance'
import { GetWalletLogs, WalletLog } from '@/app/api/frontend/wallets/GetWalletLogs'
import { Button } from '@/app/catalyst-ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/catalyst-ui/table'
import AutoRefreshPage from '@/app/components/AutoRefreshPage'
import { SearchParamsPagination } from '@/app/components/SearchParamsPagination'
import RedirectToHome from '@/app/RedirectToHome'
import {
  DATE_TIME_FORMAT,
  PAGE,
  PaginationSchema,
  PaginationSearchParams,
  ROWS_PER_PAGE,
} from '@/app/static'
import { FileDashed } from '@phosphor-icons/react/dist/ssr/FileDashed'
import clsx from 'clsx'
import { format } from 'date-fns'
import Link from 'next/link'
import * as R from 'remeda'
import { z } from 'zod'
import DateRangeFilter from './DateRangeFilter'

const querySchema = z.intersection(
  z.object({
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
  }),
  z.preprocess(
    z.object({ type: z.enum(['balance', 'bonus']).default('balance') }).parse,
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('balance'),
        action: z
          .preprocess(
            (v) => (typeof v === 'string' ? [v] : v),
            z.coerce
              .number()
              .array()
              .transform(
                R.filter(
                  R.isIncludedIn(WALLET_ACTION.data.map((item) => item.value)),
                ),
              ),
          )
          .default([]),
      }),
      z.object({
        type: z.literal('bonus'),
        action: z
          .preprocess(
            (v) => (typeof v === 'string' ? [v] : v),
            z.coerce
              .number()
              .array()
              .transform(
                R.filter(R.isIncludedIn(BONUS_ACTION.data.map((item) => item.value))),
              ),
          )
          .default([]),
      }),
    ]),
  ),
)

interface PageProps {
  searchParams: PaginationSearchParams & z.output<typeof querySchema>
}

export default async function Page({ searchParams }: PageProps) {
  const query = querySchema.parse(searchParams)
  const pagination = PaginationSchema.parse(searchParams)

  const [balanceRes, walletLogsRes, bonusRes, bonusLogsRes] = await Promise.all([
    GetConsignorWalletBalance(),
    query.type === 'balance'
      ? GetWalletLogs({
          startAt: query.start,
          endAt: query.end,
          limit: pagination[ROWS_PER_PAGE],
          offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
        })
      : null,
    GetConsignorBonusBalance(),
    query.type === 'bonus'
      ? GetBonusLogs({
          startAt: query.start,
          endAt: query.end,
          limit: pagination[ROWS_PER_PAGE],
          offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
        })
      : null,
  ])

  if (
    balanceRes.error === '1003' ||
    walletLogsRes?.error === '1003' ||
    bonusRes.error === '1003' ||
    bonusLogsRes?.error === '1003'
  ) {
    return <RedirectToHome />
  }

  return (
    <AutoRefreshPage ms={10_000}>
      <div className='mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
        <h1 className='sr-only'>帳戶紀錄</h1>

        <div className='flex gap-x-4'>
          <Link
            href='?type=balance'
            className={clsx(
              'w-full min-w-40 rounded border border-b-4 px-4 py-2 sm:w-auto',
              query.type === 'balance' && 'border-b-indigo-500',
            )}
          >
            <h2 className=''>大師幣</h2>
            <p className='text-2xl'>{balanceRes.data.toLocaleString()}</p>
          </Link>

          <Link
            href='?type=bonus'
            className={clsx(
              'w-full min-w-40 rounded border border-b-4 px-4 py-2 sm:w-auto',
              query.type === 'bonus' && 'border-b-indigo-500',
            )}
          >
            <h2 className=''>紅利</h2>
            <p className='text-2xl'>{bonusRes.data.toLocaleString()}</p>
          </Link>
        </div>

        <div className='mt-8 flex justify-between gap-x-8'>
          <h2 className='text-2xl'>
            {query.type === 'balance' ? '大師幣紀錄' : '紅利紀錄'}
          </h2>
          {query.type === 'balance' && (
            <Button type='button' outline>
              我要提款
            </Button>
          )}
        </div>

        <div>
          {/* {query.type === 'balance' && <AuctionFilter selected={query.action} />} */}
          <DateRangeFilter start={query.start} end={query.end} />
        </div>

        <div className='mt-4'>
          {walletLogsRes && (
            <WalletLogsTable
              rows={walletLogsRes.data.walletLogs}
              count={walletLogsRes.data.count}
            />
          )}
          {bonusLogsRes && (
            <BonusLogsTable
              rows={bonusLogsRes.data.bonusLogs}
              count={bonusLogsRes.data.count}
            />
          )}
        </div>
      </div>
    </AutoRefreshPage>
  )
}

interface WalletLogsTableProps {
  rows: WalletLog[]
  count: number
}

function WalletLogsTable({ rows, count }: WalletLogsTableProps) {
  return (
    <div>
      <Table>
        <TableHead>
          <TableRow className='text-center'>
            <TableHeader>操作</TableHeader>
            <TableHeader>異動額</TableHeader>
            <TableHeader>餘額</TableHeader>
            <TableHeader>時間</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={999} className='text-center'>
                <div className='grid place-items-center py-20'>
                  <div className='mx-auto w-fit text-zinc-400'>
                    <FileDashed className='mx-auto size-20' />
                    <p className='mt-6 text-center text-lg leading-6'>沒有資料</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
          {rows?.map((row) => (
            <TableRow key={row.id}>
              <TableCell className='text-center'>
                {WALLET_ACTION.get('value', row.action).message}
              </TableCell>
              <TableCell
                className={clsx(
                  'text-end',
                  row.netDifference < 0 ? 'text-rose-600' : 'text-emerald-500',
                )}
              >
                {row.netDifference.toLocaleString()}
              </TableCell>
              <TableCell className='text-end'>
                {(row.previousBalance + row.netDifference).toLocaleString()}
              </TableCell>
              <TableCell className='text-center'>
                {format(row.createdAt, DATE_TIME_FORMAT)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SearchParamsPagination count={count} />
    </div>
  )
}

interface BonusLogsTableProps {
  rows: BonusLog[]
  count: number
}

function BonusLogsTable({ rows, count }: BonusLogsTableProps) {
  return (
    <div>
      <Table>
        <TableHead>
          <TableRow className='text-center'>
            <TableHeader>操作</TableHeader>
            <TableHeader>異動額</TableHeader>
            <TableHeader>餘額</TableHeader>
            <TableHeader>時間</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={999} className='text-center'>
                <div className='grid place-items-center py-20'>
                  <div className='mx-auto w-fit text-zinc-400'>
                    <FileDashed className='mx-auto size-20' />
                    <p className='mt-6 text-center text-lg leading-6'>沒有資料</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
          {rows?.map((row) => (
            <TableRow key={row.id}>
              <TableCell className='text-center'>
                {BONUS_ACTION.get('value', row.action).message}
              </TableCell>
              <TableCell
                className={clsx(
                  'text-end',
                  row.netDifference < 0 ? 'text-rose-600' : 'text-emerald-500',
                )}
              >
                {row.netDifference.toLocaleString()}
              </TableCell>
              <TableCell className='text-end'>
                {(row.previousBalance + row.netDifference).toLocaleString()}
              </TableCell>
              <TableCell className='text-center'>
                {format(row.createdAt, DATE_TIME_FORMAT)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SearchParamsPagination count={count} />
    </div>
  )
}
