import React from "react";
import BarChart from "../common/BarChart";
import ChannelPartnerData  from "./ChannelPartnerData.json";


const ChannelPartnerChart = () => {
  return (
    <BarChart
      title="Channel Partner"
      subtitle="Insight into channel partner distribution."
      data={ChannelPartnerData}
      tabs={["monthly", "weekly"]}
      color="#7C3AED"
      seriesName="Properties"
      tooltipSuffix="properties"
    />
  );
};

export default ChannelPartnerChart;