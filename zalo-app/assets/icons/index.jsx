import React from "react";
import { theme } from "../../constants/theme";
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
import Notification from "./Notification";
import ImageFile from "./ImageFile";
import MicroOn from "./MicroOn";
import MicroOff from "./MicroOff";
import UserAdd from "./UserAdd";
import UserGroup from "./UserGroup";
import Pin from "./Pin";
import Calendar from "./Calendar";
import Information from "./Information";
import Ztyle from "./Ztyle";
import Security from "./Security";
import Link from "./Link";
import EyeHide from "./EyeHide";
import Report from "./Report";
import Delete from "./Delete";
import LeaveGroup from "./LeaveGroup";
import UserSetting from "./UserSetting";
import Edit from "./Edit";
import Share from "./Share";
import Forward from "./Forward";
import Reply from "./Reply";
import Copy from "./Copy";
import VolumeOn from "./VolumeOn";
import Translate from "./Translate";
import VolumeOff from "./VolumeOff";
import BirthdayCake from "./BirthdayCake";
import Lock from "./Lock";
import Contact from "./Contact";
import ImageAdd from "./ImageAdd";
import UserMultiple from "./UserMultiple";
import AddGroup from "./addGroup";
import Sort from "./Sort";
import Camera from "./Camera";
import Tick from "./Tick";
import ArrowRight from "./ArrowRight";
import Cancel from "./Cancel";
import Cellular from "./Cellular";
import ArrowDown from "./ArrowDown";
import Computer from "./Computer";
import Emoji from "./emoji";
import Sent from "./Sent";
import Mail from "./Mail";
import Comment from "./Comment";
import Heart from "./Heart";
import Location from "./Location";
import Attach from "./Attach";
import Audio from "./Audio";
import BussinessCard from "./BussinessCard";
import Star from "./Star";
import CallIncoming from "./CallIncoming";
import AlarmClock from "./AlarmClock";
import Block from "./Block";
import HeartRemove from "./HeartRemove";
import Play from "./Play";
import Pause from "./Pause";
import Media from "./Media";


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
  notification : Notification,
  imageFile : ImageFile,
  microOn : MicroOn,
  microOff : MicroOff,
  userAdd : UserAdd,
  userGroup : UserGroup,
  pin : Pin,
  calendar : Calendar,
  information : Information,
  zTyle : Ztyle,
  security : Security,
  link : Link,
  lock: Lock,
  eyeHide : EyeHide,
  report : Report,
  delete : Delete,
  leaveGroup : LeaveGroup,
  userSetting : UserSetting,
  edit : Edit,
  share : Share,
  forward : Forward,
  reply : Reply,
  copy : Copy,
  volumeOn : VolumeOn,
  translate : Translate,
  volumeOff : VolumeOff,
  birthdayCake : BirthdayCake,
  contact : Contact,
  imageAdd : ImageAdd,
  userMultiple : UserMultiple,
  addGroup : AddGroup,
  sort : Sort,
  camera : Camera,
  tick : Tick,
  arrowRight : ArrowRight,
  cancel : Cancel,
  cellular : Cellular,
  arrowDown : ArrowDown,
  computer : Computer,
  emoji : Emoji,
  sent : Sent,
  mail : Mail,
  comment: Comment,
  heart: Heart,
  location : Location,
  attach : Attach,
  audio : Audio,
  bussinessCard : BussinessCard,
  star : Star,
  callInComing : CallIncoming,
  alarmClock : AlarmClock,
  block : Block,
  heartRemove: HeartRemove,
  play: Play,
  pause: Pause,
  media: Media
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
