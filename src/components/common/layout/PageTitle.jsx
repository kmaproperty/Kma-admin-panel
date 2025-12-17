import React from 'react'

const PageTitle = ({title, actions}) => {
  return (
    <div className='py-3 min-h-15 flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>{title}</h2>
        <div className='flex gap-2'>
            {
                actions?.map((action, index) => (
                    <button key={index} className='px-4 flex gap-1 items-center cursor-pointer py-2 text-white rounded-md bg-gray-800' onClick={action.onClick}>
                        {action.icon}
                        {action.label}
                    </button>
                ))
            }
        </div>
    </div>
  )
}

export default PageTitle