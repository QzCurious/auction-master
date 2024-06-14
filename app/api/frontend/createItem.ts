'use server'

import { revalidateTag } from 'next/cache'
import { apiClient } from '../apiClient'
import { withAuth } from '../withAuth'

type Data = 'Success'

type ErrorCode = never

export async function createItem(formData: FormData) {
  const name = formData.get('name')
  if (typeof name !== 'string' || name === '') {
    throw new Error('name is required and should be a string')
  }
  const reservePrice = formData.get('reservePrice')
  if (typeof reservePrice !== 'string' || Number.isNaN(Number(reservePrice))) {
    throw new Error('reservePrice should be a number')
  }
  if (formData.getAll('photo').length === 0) {
    throw new Error('photo is required and should be an array of files')
  }
  if (formData.getAll('index').length !== formData.getAll('photo').length) {
    throw new Error('photo and index should have the same length')
  }

  const res = await withAuth(apiClient)<Data, ErrorCode>('/frontend/items', {
    method: 'POST',
    body: formData,
  })

  revalidateTag('items')

  return res
}