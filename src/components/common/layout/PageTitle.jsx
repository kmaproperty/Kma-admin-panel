import { InputAdornment, TextField } from '@mui/material'
import { SearchIcon } from 'lucide-react'
import React from 'react'

const PageTitle = ({ title, actions, isSearch, searchValue, onSearchChange }) => {
    return (
        <div className='py-3 space-y-2'>
            <h2 className='text-lg font-semibold text-gray-600'>{title}</h2>
            <div className='flex justify-between items-center'>
                {
                    isSearch ? (<TextField
                        placeholder="Search"
                        variant="outlined"
                        size="small"
                        value={searchValue}
                        onChange={onSearchChange}
                        sx={{
                            width: 240,
                            '& .MuiOutlinedInput-root': {
                                height: 40,
                                fontSize: '14px',
                                borderRadius: '8px',
                                backgroundColor: '#f9fafb',
                                paddingRight: '6px',
                                '& fieldset': {
                                    borderColor: '#e5e7eb',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#cbd5e1',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#3b82f6',
                                    borderWidth: '1px',
                                },
                            },
                            '& input': {
                                padding: '6px 4px',
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon width={18} style={{ fontSize: 12, color: '#64748b' }} />
                                </InputAdornment>
                            ),
                        }}
                    />) : <div></div>
                }

                {
                    actions?.length &&
                    <div className='flex gap-2 text-white'>
                        {
                            actions?.map((action, index) => (
                                <button key={index} className={`px-4 flex gap-1 items-center cursor-pointer py-2  rounded-md ${action?.type === 'success' ? "bg-green-100 text-green-700" : action?.type === 'danger' ? "bg-red-100 text-red-700" : "bg-gray-800"} text-sm font-medium`} onClick={action.onClick}>
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))
                        }
                    </div>
                }
            </div>

        </div>
    )
}

export default PageTitle