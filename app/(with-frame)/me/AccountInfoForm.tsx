'use client'

import { User } from '@/app/UserContext'
import { Consignor } from '@/app/api/frontend/consignor/getConsignor'
import { updateConsignor } from '@/app/api/frontend/consignor/updateConsignor'
import { updateConsignorAvatar } from '@/app/api/frontend/consignor/updateConsignorAvatar'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { forceRefreshTokenAction } from './actions'

const Schema = z.object({
  nickname: z.string().min(1),
  avatarPhoto: z.union([z.string(), z.instanceof(File)]).nullable(),
})

export default function AccountInfoForm({
  user,
  consignor,
}: {
  user: User
  consignor: Consignor
}) {
  const defaultValues = useMemo(
    () => ({
      nickname: consignor.nickname,
      avatarPhoto: user.avatar || null,
    }),
    [consignor.nickname, user.avatar],
  )
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<z.infer<typeof Schema>>({
    defaultValues,
    resolver: zodResolver(Schema),
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <div className='grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3'>
      <div>
        <h2 className='text-base font-medium leading-6 text-gray-900'>個人資訊</h2>
        {/* <p className='mt-1 text-sm leading-6 text-gray-400'>
          Use a permanent address where you can receive mail.
        </p> */}
      </div>

      <div className='md:col-span-2'>
        <form
          onSubmit={handleSubmit(async (data) => {
            if (typeof data.avatarPhoto !== 'string') {
              const formData = new FormData()
              formData.append('avatarPhoto', data.avatarPhoto ?? '')
              const res = await updateConsignorAvatar(formData)
              if (res.error) {
                toast.error(`頭像更新失敗: ${res.error}`)
                return
              }
            }

            const res = await updateConsignor({ nickname: data.nickname })
            if (res.error) {
              toast.error(`操作錯誤: ${res.error}`)
              return
            }

            await forceRefreshTokenAction()
            toast.success('更新成功')
          })}
        >
          <div className='grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6'>
            <Controller
              name='avatarPhoto'
              control={control}
              render={({ field }) => (
                <div className='flex items-center gap-x-8 sm:col-span-full'>
                  {field.value ? (
                    <div className='group relative size-24 flex-none'>
                      <label htmlFor='avatarPhoto'>
                        <Image
                          src={
                            field.value instanceof File
                              ? URL.createObjectURL(field.value)
                              : field.value
                          }
                          className='size-full rounded-lg bg-gray-800 object-cover object-center'
                          priority
                          width={96}
                          height={96}
                          alt=''
                        />
                      </label>
                      <button
                        type='button'
                        className='absolute -right-1.5 -top-1.5 bottom-auto left-auto hidden size-6 cursor-pointer rounded-full bg-red-500 p-0.5 text-white hover:bg-red-400 group-hover:block'
                        onClick={(e) => {
                          e.stopPropagation()
                          field.onChange(null)
                        }}
                      >
                        <XMarkIcon />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor='avatarPhoto'
                      className='size-24 flex-none overflow-hidden rounded-lg border'
                    >
                      <svg
                        className='size-full text-gray-300'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
                      </svg>
                    </label>
                  )}
                  <input
                    type='file'
                    className='sr-only'
                    id='avatarPhoto'
                    name='avatarPhoto'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      field.onChange(file)
                    }}
                  />

                  <div>
                    <label
                      htmlFor='avatarPhoto'
                      className='rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                    >
                      {user.avatar ? <>更換頭像</> : <>上傳頭像</>}
                    </label>
                    <p className='mt-2 text-xs leading-5 text-gray-400'>
                      支援 PNG, JPG, JPEG
                    </p>
                  </div>
                </div>
              )}
            />

            <div className='sm:col-span-full'>
              <p className='block text-sm font-medium leading-6 text-gray-900'>
                帳號
              </p>
              <div className='mt-2'>
                <p className='block text-sm font-medium leading-6 text-gray-700'>
                  {consignor.account}
                </p>
              </div>
            </div>

            <Controller
              name='nickname'
              control={control}
              render={({ field, fieldState }) => (
                <div className='sm:col-span-full'>
                  <label
                    htmlFor='nickname'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    暱稱
                  </label>
                  <div className='mt-2'>
                    <div>
                      <input
                        type='text'
                        id='nickname'
                        autoComplete='given-name'
                        className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                        {...field}
                      />
                      {fieldState.error && (
                        <p className='mt-1 text-sm text-red-600'>
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          <div className='mt-8 flex'>
            <button
              type='submit'
              className={clsx(
                'rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
                isSubmitting && 'pointer-events-none opacity-50',
              )}
            >
              {isSubmitting && (
                <span className='mr-2 inline-block size-3 animate-spin self-center rounded-full border-2 border-l-0 border-indigo-200'></span>
              )}
              送出
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
