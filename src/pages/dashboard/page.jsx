import React, { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../components/common/layout/PageTitle';
import { FormControl, MenuItem, Select } from '@mui/material';
import { channelPartnerStats, customerStats, ownerStats, propertyStats } from './dummyData.jsx';
import TotalPropertiesChart from '../../components/dashboard/TotalPropertiesChart.jsx';
import ChannelPartnerChart from '../../components/dashboard/ChannelPartnerChart.jsx';
import OwnerChart from '../../components/dashboard/OwnerChart.jsx';
import CustomerChart from '../../components/dashboard/CustomerChart.jsx';

const Dashbaord = () => {
  const [showAnalyticsOf, setShowAnalyticsOf] = useState('property');
  const [stats, setStats] = useState([]);

  const options = [
    { value: 'property', label: 'Property' },
    { value: 'channelPartner', label: 'Channel Partner' },
    { value: 'owner', label: 'Owner' },
    { value: 'customer', label: 'Customer' },
  ];

  useEffect(() => {
    setStats(showAnalyticsOf === 'property' ? propertyStats : showAnalyticsOf === 'channelPartner' ? channelPartnerStats : showAnalyticsOf === 'owner' ? ownerStats : customerStats)
  }, [showAnalyticsOf])

  return (
    <div className="pl-6 py-3 pb-8 flex justify-start gap-3 flex-col ">
      <div className="flex justify-between items-center">
        <PageTitle title="Analytics" />
        <FormControl sx={{ m: 1, minWidth: 140 }}>
          <Select
            inputId={"showAnalyticsOf"}
            placeholder={"Select analytics"}
            value={showAnalyticsOf}
            onChange={(e) => setShowAnalyticsOf(e.target.value)}
            sx={{
              fontSize: '14px',
              color: "#4a5565",
              fontWeight: 600,
              fontFamily: 'Figtree,sans-serif',
              "& .MuiSelect-select": {
                padding: "8px 32px 8px 14px",
                // background: '#E7E6FF'
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ccc"
              }
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div>
        <div className="flex gap-5">
          {
            stats.map((stat) => (
              <div className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
                <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50 mb-2">
                  {stat.icon}
                </div>
                <div className="text-right w-full">
                  <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div>
        {
          showAnalyticsOf === 'property' ? <TotalPropertiesChart/>
          : showAnalyticsOf === 'channelPartner' ? <ChannelPartnerChart/>
          : showAnalyticsOf === 'owner' ? <OwnerChart/>
          : <CustomerChart/>
        }
      </div>
    </div>
  )
}

export default Dashbaord