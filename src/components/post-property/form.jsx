import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { getActiveStep } from "../../store/postPropertyProgress";

export default function PostPropertyForm() {
const activeStep = useSelector(getActiveStep);
  const containerRef = useRef(null);


  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeStep, containerRef]);


  return (
    <div>
      {activeStep == 1 && <Step1 containerRef={containerRef}/>}
      {activeStep == 2 && <Step2 containerRef={containerRef}/>}
      {activeStep == 3 && <Step3 containerRef={containerRef}/>}
      {activeStep == 4 && <Step4 containerRef={containerRef}/>}
    </div>
  );
}
