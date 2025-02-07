import * as React from "react"
import Svg, { Path } from "react-native-svg";

const ArrowRight = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color="#4a90e2" fill="none" {...props}>
    <Path d="M20.0001 11.9998L4.00012 11.9998" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15.0003 17C15.0003 17 20.0002 13.3176 20.0002 12C20.0002 10.6824 15.0002 7 15.0002 7" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default ArrowRight;
