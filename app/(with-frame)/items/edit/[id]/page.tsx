import RedirectToHome from '@/app/RedirectToHome'
import {
  CONSIGNOR_STATUS_MAP,
  ITEM_STATUS_DATA,
  ITEM_STATUS_MAP,
  ITEM_TYPE_DATA,
  ITEM_TYPE_MAP,
} from '@/app/api/frontend/configs.data'
import { getItem } from '@/app/api/frontend/items/getItem'
import { getUser } from '@/app/api/helpers/getUser'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ApproveConsignmentBtn from './ApproveConsignmentBtn'
import CancelConsignmentBtn from './CancelConsignmentBtn'
import PhotoListForm from './PhotoListForm'

interface PageProps {
  params: { id: string }
}

async function Page(pageProps: PageProps) {
  return (
    <div className='mx-auto max-w-4xl px-8'>
      <Link
        className='inline-flex items-center gap-x-1 text-sm text-indigo-600 hover:text-indigo-500'
        href='/items'
      >
        <ArrowLeftIcon className='size-4 stroke-2' />
        回到物品列表
      </Link>

      <div className='mt-4'>
        <Content {...pageProps} />
      </div>
    </div>
  )
}

export default Page

async function Content({ params }: PageProps) {
  const user = await getUser()
  if (!user) {
    return <RedirectToHome />
  }

  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const item = await getItem(id)
  if (item.error === '1003') {
    return <RedirectToHome />
  }
  if (item.error === '1801') {
    notFound()
  }

  return (
    <>
      <div className='flex flex-col gap-x-10 gap-y-8 sm:flex-row'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-x-6 sm:justify-start'>
            <h1 className='text-2xl font-bold text-gray-900'>{item.data.name}</h1>
            <p className='inline-flex flex-none cursor-default items-center rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-800 ring-1 ring-inset ring-gray-500/10'>
              {
                ITEM_STATUS_DATA.find(({ value }) => value === item.data.status)
                  ?.message
              }
            </p>
          </div>

          <div className='mt-4'>
            <PhotoListForm item={item.data} />
          </div>

          <section className='mt-8 text-gray-700'>
            <h2 className='text-xl font-bold text-gray-900'>描述</h2>
            {item.data.description ? (
              <div className='mt-2'>{item.data.description}</div>
            ) : (
              <div className='mt-2'>暫無描述</div>
            )}
          </section>
        </div>

        <div className='min-w-40'>
          <section>
            <dl className='divide-y divide-gray-100'>
              <div className='py-3'>
                <dt className='text-sm font-medium leading-6 text-gray-900'>類別</dt>
                <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                  {ITEM_TYPE_DATA.find(({ value }) => value === item.data.type)
                    ?.message ?? '(待定)'}
                </dd>
              </div>
              <div className='py-3'>
                <dt className='text-sm font-medium leading-6 text-gray-900'>空間</dt>
                <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                  {item.data.space}
                </dd>
              </div>
              <div className='py-3'>
                <dt className='text-sm font-medium leading-6 text-gray-900'>
                  期望金額
                </dt>
                <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                  {item.data.reservePrice.toLocaleString()}
                </dd>
              </div>
              {item.data.type === ITEM_TYPE_MAP['AppraisableAuctionItemType'] && (
                <>
                  <div className='py-3'>
                    <dt className='text-sm font-medium leading-6 text-gray-900'>
                      最低估值
                    </dt>
                    <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                      {item.data.minEstimatedPrice.toLocaleString()}
                    </dd>
                  </div>
                  <div className='py-3'>
                    <dt className='text-sm font-medium leading-6 text-gray-900'>
                      最高估值
                    </dt>
                    <dd className='mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0'>
                      {item.data.maxEstimatedPrice.toLocaleString()}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {item.data.status === ITEM_STATUS_MAP['AppraisedStatus'] && (
            <div className='mt-4 flex flex-col gap-y-4'>
              <CancelConsignmentBtn itemId={item.data.id} />

              <div>
                <ApproveConsignmentBtn
                  itemId={item.data.id}
                  disabled={
                    user.status ===
                    CONSIGNOR_STATUS_MAP.AwaitingVerificationCompletionStatus
                  }
                />
                {user.status ===
                  CONSIGNOR_STATUS_MAP.AwaitingVerificationCompletionStatus && (
                  <p className='text-end text-sm text-gray-500'>
                    完成
                    <Link
                      href='/me#identity-form'
                      className='text-indigo-600 underline'
                    >
                      身份認證
                    </Link>
                    後即可託售
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
