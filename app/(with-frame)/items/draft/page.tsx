import NotSignedInError from '@/app/NotSignedInError'
import { configs } from '@/app/api/frontend/configs'
import { items } from '@/app/api/frontend/items/items'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import Link from 'next/link'
import PreviewPhotos from '../PreviewPhotos'
import StatusTabs from '../StatusTabs'

interface PageProps {
  searchParams: {
    sort: string
    order: string
    limit: string
    offset: string
  }
}

const STATUS = 'InitStatus'

export default async function Page({ searchParams }: PageProps) {
  const configsRes = await configs()
  if (configsRes.error === '1003') {
    return <NotSignedInError />
  }
  const status = configsRes.data.itemStatus.find(
    (status) => status.key === STATUS,
  )?.value
  if (!status) {
    throw new Error('Backend bug')
  }

  const itemsRes = await items({ ...(searchParams as any), status })

  if (itemsRes.error === '1003') {
    return <NotSignedInError />
  }

  return (
    <div className='bg-white'>
      <div className='mx-auto max-w-7xl overflow-hidden px-4 pb-16 sm:px-6 lg:px-8'>
        <h1 className='text-2xl font-bold tracking-tight text-gray-900'>我的物品</h1>

        <StatusTabs status={STATUS} />

        <div className='mt-6 flex items-center justify-end'>
          <Link
            href='/items/draft/create'
            className='block text-sm font-medium text-indigo-600 hover:text-indigo-500'
          >
            新增物品
            <span aria-hidden='true'> &rarr;</span>
          </Link>
        </div>

        {itemsRes.data.items.length === 0 && (
          <p className='mt-6 text-base leading-6 text-gray-500'>沒有物品</p>
        )}

        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8'>
          {itemsRes.data.items.map((item) => {
            return (
              <article key={item.id} className='relative'>
                <Link
                  href={`/items/draft/edit/${item.id}`}
                  className='absolute right-1.5 top-1.5 z-20'
                >
                  <PencilSquareIcon
                    className='size-7 rounded-full bg-white/80 stroke-2 p-1 text-gray-400 hover:bg-white hover:text-gray-600'
                    aria-hidden='true'
                  />
                </Link>
                <PreviewPhotos photos={item.photos} />

                <h3 className='font-medium text-gray-900'>{item.name}</h3>
                <p className='font-medium text-gray-900'>
                  底價: ${item.reservePrice}
                </p>
                {!!item.expireAt && (
                  <p className='italic text-gray-500'>
                    時效: {format(item.expireAt, 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
