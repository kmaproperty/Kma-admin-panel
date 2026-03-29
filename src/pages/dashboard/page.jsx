import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import PageTitle from '../../components/common/layout/PageTitle';
import { FormControl, MenuItem, Select } from '@mui/material';
import { Building, Building2, CircleUserRound, MonitorCheck, ShieldCheck, ShieldQuestionMark } from "lucide-react";
import { channelPartnerStats, customerStats, ownerStats, propertyStats } from './dummyData.jsx';
import TotalPropertiesChart from '../../components/dashboard/TotalPropertiesChart.jsx';
import ChannelPartnerChart from '../../components/dashboard/ChannelPartnerChart.jsx';
import OwnerChart from '../../components/dashboard/OwnerChart.jsx';
import CustomerChart from '../../components/dashboard/CustomerChart.jsx';
import { fetchDashboardStats } from '../../services/dashboardService.js';

const iconStyle = "w-9 h-9 text-[#604AE3]";

const buildStatsFromApi = (data) => {
  if (!data) return null;

  return {
    property: [
      { title: 'Properties For Rent', count: data.properties.forRent, icon: <Building2 className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Properties For Sale', count: data.properties.forSale, icon: <Building className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Active Properties', count: data.properties.active, icon: <MonitorCheck className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Pending Properties', count: data.properties.pending, icon: <ShieldQuestionMark className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Verified Properties', count: data.properties.verified, icon: <ShieldCheck className={iconStyle} strokeWidth={1.5} /> },
    ],
    channelPartner: [
      { title: 'Total Partners', count: data.channelPartners.total, icon: <CircleUserRound className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Active Partners', count: data.channelPartners.active, icon: <MonitorCheck className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Verified Partners', count: data.channelPartners.verified, icon: <ShieldQuestionMark className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Partners with KYC verification', count: data.channelPartners.kycCompleted, icon: <ShieldCheck className={iconStyle} strokeWidth={1.5} /> },
    ],
    owner: [
      { title: 'Total Owners', count: data.owners.total, icon: <CircleUserRound className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Active Owners', count: data.owners.active, icon: <MonitorCheck className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Pending Owners', count: data.owners.pending, icon: <ShieldQuestionMark className={iconStyle} strokeWidth={1.5} /> },
    ],
    customer: [
      { title: 'Total Customer', count: data.customers.total, icon: <CircleUserRound className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Active Customer', count: data.customers.active, icon: <MonitorCheck className={iconStyle} strokeWidth={1.5} /> },
      { title: 'Pending Customer', count: data.customers.pending, icon: <ShieldQuestionMark className={iconStyle} strokeWidth={1.5} /> },
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

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const liveStatsMap = buildStatsFromApi(apiData);
  const stats = (liveStatsMap && !isError) ? liveStatsMap[showAnalyticsOf] : dummyStatsMap[showAnalyticsOf];

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
