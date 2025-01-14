import React from 'react'
import Message from './Message'
import Timeline from './Timeline'
import Discovery from './Discovery'
import Profile from './Profile'
import Setting from './Setting'
import Search from './Search'
import QRCode from './QRcode'
import Add from './Add'
import ArrowLeft from './ArrowLeft'
import CallVideoOn from './CallVideoOn'
import CallVideoOff from './CallVideoOff'
import MoreHorizontal from './MoreHorizontal'
import Menu from './Menu'
import Wallet from './Wallet'
import Cloud from './Cloud'


const icons = {
  message: Message,
  timeLine: Timeline,
  discovery : Discovery,
  profile : Profile,
  setting : Setting,
  search : Search,
  qrCode : QRCode,
  add : Add,
  arrowLeft : ArrowLeft,
  callVideoOn : CallVideoOn,
  callVideoOff : CallVideoOff,
  moreHorizontal : MoreHorizontal,
  menu : Menu,
  wallet : Wallet,
  cloud : Cloud,
}

const Icon = ({name, ...props}) => {
    const IconComponent = icons[name];
  return (
    <IconComponent
        height={props.size || 24}
        width={props.size || 24}
        strokeWidth={props.strokeWidth || 1.9}
        color={theme.colors.textLight}
        {...props}
    />
  )
}

export default Icon;
