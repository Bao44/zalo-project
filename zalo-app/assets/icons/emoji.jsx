import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg";

const Emoji = (props) => (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color="#4a90e2" fill="none" {...props}>
        <Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 14C8.91212 15.2144 10.3643 16 12 16C13.6357 16 15.0879 15.2144 16 14" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 8C15 8 14 9 14 10C14.75 9 16.25 9 17 10" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.00897 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M13.5 16L14.2348 17.3203C14.644 17.9703 15.5502 18.1929 16.2589 17.8177C16.9676 17.4424 17.2104 16.6113 16.8012 15.9614L16 15" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>

);

export default Emoji;