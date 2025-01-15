import React from "react";
import Message from "./Message";
import Timeline from "./Timeline";
import Discovery from "./Discovery";
import Profile from "./Profile";
import Setting from "./Setting";
import Search from "./Search";
import QRCode from "./QRcode";
import Add from "./Add";
import ArrowLeft from "./ArrowLeft";
import CallVideoOn from "./CallVideoOn";
import CallVideoOff from "./CallVideoOff";
import MoreHorizontal from "./MoreHorizontal";
import Menu from "./Menu";
import Wallet from "./Wallet";
import Cloud from "./Cloud";
import Phone from "./Phone";
import { theme } from "../../constants/theme";

const icons = {
  add: Add,
  arrowLeft: ArrowLeft,
  callVideoOn: CallVideoOn,
  callVideoOff: CallVideoOff,
  cloud: Cloud,
  discovery: Discovery,
  menu: Menu,
  message: Message,
  moreHorizontal: MoreHorizontal,
  phone: Phone,
  profile: Profile,
  qrCode: QRCode,
  search: Search,
  setting: Setting,
  timeLine: Timeline,
  wallet: Wallet,
};

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strokeWidth={props.strokeWidth || 1.9}
      color={theme.colors.textLight}
      {...props}
    />
  );
};

export default Icon;
