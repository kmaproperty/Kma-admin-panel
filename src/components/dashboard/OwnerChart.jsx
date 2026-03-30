import React from "react";
import BarChart from "../common/BarChart";
import ChannelPartnerData from "./ChannelPartnerData.json";


const OwnerChart = ({ data }) => {
  return (
    <BarChart
      title="Owner Chart"
      subtitle="Insight into Owner distribution."
      data={data || ChannelPartnerData}
      tabs={["monthly", "weekly"]}
      color="#7C3AED"
      seriesName="Owners"
      tooltipSuffix="owners"
    />
  );
};

export default OwnerChart;