import * as React from "react"
import Svg, { Path } from "react-native-svg";

const Tick = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color="#4a90e2" fill="none" {...props}>
    <Path d="M5 14L8.5 17.5L19 6.5" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default Tick;