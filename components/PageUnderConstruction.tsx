import { Construction } from 'lucide-react'
import React from 'react'

export default function PageUnderConstruction({pageName}: {pageName: string}) {
  return (
    <div className='h-full w-full  flex items-center justify-center'>
        <div className='flex flex-col items-center'>
        <h1 className='text-lg font-medium'>The {pageName} page is under construction 🚧</h1>
        <Construction className='ml-4' strokeWidth={1} size={100} />
        </div>
    </div>
  )
}
