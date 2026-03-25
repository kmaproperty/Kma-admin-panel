import React from "react";
import BarChart from "../common/BarChart";
import propertyData  from "./PropertyData.json";


const TotalPropertiesChart = () => {
  return (
    <BarChart
      title="Total Properties"
      subtitle="Insight into your total property portfolio distribution."
      data={propertyData}
      tabs={["monthly", "weekly"]}
      color="#7C3AED"
      seriesName="Properties"
      tooltipSuffix="properties"
    />
  );
};

export default TotalPropertiesChart;