import React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'

const CustomPopover = ({
  anchorEl,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  children,
}) => {
  const open = Boolean(anchorEl)
  const id = open ? 'custom-popover' : undefined

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      sx={{
        '& .MuiPopover-paper': {
          borderRadius: '8px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {children || <Typography sx={{ p: 2 }}>Popover content.</Typography>}
    </Popover>
  )
}

export default CustomPopover