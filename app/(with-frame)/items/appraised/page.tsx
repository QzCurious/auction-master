import NotSignedInError from '@/app/NotSignedInError'
import { configs } from '@/app/api/frontend/configs'
import { items } from '@/app/api/frontend/items/items'
import ItemStatusBadge from '@/app/components/ItemStatusBadge'
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

const STATUS = 'AppraisedStatus'

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
        <StatusTabs status={STATUS} />

        {itemsRes.data.items.length === 0 && (
          <p className='mt-6 text-base leading-6 text-gray-500'>沒有物品</p>
        )}

        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8'>
          {itemsRes.data.items.map((item) => {
            return (
              <div key={item.id} className='relative'>
                <Link
                  href={`/items/edit/${item.id}`}
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}