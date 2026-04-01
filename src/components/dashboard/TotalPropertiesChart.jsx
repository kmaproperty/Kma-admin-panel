import React from "react";
import BarChart from "../common/BarChart";
import propertyData from "./PropertyData.json";


const TotalPropertiesChart = ({ data }) => {
  return (
    <BarChart
      title="Total Properties"
      subtitle="Insight into your total property portfolio distribution."
      data={data || propertyData}
      tabs={["monthly", "weekly"]}
      color="#7C3AED"
      seriesName="Properties"
      tooltipSuffix="properties"
      height={440}
    />
  );
};

export default TotalPropertiesChart;