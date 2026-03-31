import React from "react";
import BarChart from "../common/BarChart";
import ChannelPartnerData from "./ChannelPartnerData.json";


const ChannelPartnerChart = ({ data }) => {
  return (
    <BarChart
      title="Channel Partner"
      subtitle="Insight into channel partner distribution."
      data={data || ChannelPartnerData}
      tabs={["monthly", "weekly"]}
      color="#7C3AED"
      seriesName="Channel Partners"
      tooltipSuffix="partners"
    />
  );
};

export default ChannelPartnerChart;