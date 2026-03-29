import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import PageTitle from '../../components/common/layout/PageTitle';
import { FormControl, MenuItem, Select } from '@mui/material';
import { channelPartnerStats, customerStats, ownerStats, propertyStats } from './dummyData.jsx';
import TotalPropertiesChart from '../../components/dashboard/TotalPropertiesChart.jsx';
import ChannelPartnerChart from '../../components/dashboard/ChannelPartnerChart.jsx';
import OwnerChart from '../../components/dashboard/OwnerChart.jsx';
import CustomerChart from '../../components/dashboard/CustomerChart.jsx';
import { fetchDashboardStats } from '../../services/dashboardService.js';

const buildStatsFromApi = (data) => {
  if (!data) return null;

  const propIcons = propertyStats.map((s) => s.icon);
  const cpIcons = channelPartnerStats.map((s) => s.icon);
  const ownerIcons = ownerStats.map((s) => s.icon);
  const custIcons = customerStats.map((s) => s.icon);

  return {
    property: [
      { title: 'Properties For Rent', count: data.properties.forRent, icon: propIcons[0] },
      { title: 'Properties For Sale', count: data.properties.forSale, icon: propIcons[1] },
      { title: 'Active Properties', count: data.properties.active, icon: propIcons[2] },
      { title: 'Pending Properties', count: data.properties.pending, icon: propIcons[3] },
      { title: 'Verified Properties', count: data.properties.verified, icon: propIcons[4] },
    ],
    channelPartner: [
      { title: 'Total Partners', count: data.channelPartners.total, icon: cpIcons[0] },
      { title: 'Active Partners', count: data.channelPartners.active, icon: cpIcons[1] },
      { title: 'Verified Partners', count: data.channelPartners.verified, icon: cpIcons[2] },
      { title: 'Partners with KYC verification', count: data.channelPartners.kycCompleted, icon: cpIcons[3] },
    ],
    owner: [
      { title: 'Total Owners', count: data.owners.total, icon: ownerIcons[0] },
      { title: 'Active Owners', count: data.owners.active, icon: ownerIcons[1] },
      { title: 'Pending Owners', count: data.owners.pending, icon: ownerIcons[2] },
      { title: 'Verified Owners', count: data.owners.verified, icon: ownerIcons[3] },
    ],
    customer: [
      { title: 'Total Customer', count: data.customers.total, icon: custIcons[0] },
      { title: 'Active Customer', count: data.customers.active, icon: custIcons[1] },
      { title: 'Pending Customer', count: data.customers.pending, icon: custIcons[2] },
      { title: 'Verified Customer', count: data.customers.verified, icon: custIcons[3] },
    ],
  };
};

const dummyStatsMap = {
  property: propertyStats,
  channelPartner: channelPartnerStats,
  owner: ownerStats,
  customer: customerStats,
};

const Dashbaord = () => {
  const [showAnalyticsOf, setShowAnalyticsOf] = useState('property');

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  const liveStatsMap = buildStatsFromApi(apiData);
  const stats = liveStatsMap ? liveStatsMap[showAnalyticsOf] : dummyStatsMap[showAnalyticsOf];

  const options = [
    { value: 'property', label: 'Property' },
    { value: 'channelPartner', label: 'Channel Partner' },
    { value: 'owner', label: 'Owner' },
    { value: 'customer', label: 'Customer' },
  ];

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
            stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 max-w-90 flex items-center gap-2">
                <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50 mb-2">
                  {stat.icon}
                </div>
                <div className="text-right w-full">
                  <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-3xl mt-1 w-full font-bold text-gray-800">
                    {isLoading ? '...' : stat.count}
                  </p>
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
