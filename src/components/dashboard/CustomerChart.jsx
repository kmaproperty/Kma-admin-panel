import React from "react";
import BarChart from "../common/BarChart";
import ChannelPartnerData from "./ChannelPartnerData.json";


const CustomerChart = ({ data }) => {
  return (
    <BarChart
      title="Customer Chart"
      subtitle="Insight into customer distribution."
      data={data || ChannelPartnerData}
      tabs={["monthly", "weekly"]}
      color="#7C3AED"
      seriesName="Customers"
      tooltipSuffix="customers"
    />
  );
};

export default CustomerChart;