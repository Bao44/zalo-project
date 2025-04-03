
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import RenderImageMessage from "./RenderImageMessage";
import ViewFile from "./ViewFile";

const MessageItem = React.memo(({ item, index, messages, user, conversation, formatTime }) => {
    if (item?.senderId?._id === user?.id) {
      return (
        <TouchableOpacity
          onLongPress={() => console.log("OnLongPress")}
          style={[styles.messageOfMe, index !== messages?.length - 1 && item?.senderId?._id === messages[index + 1]?.senderId?._id ? { marginTop: 5 } : {}]}
        >
          {item?.attachments?.length > 0 && <RenderImageMessage images={item?.attachments} wh={wp(70)} />}
          {item?.files?.length > 0 && <ViewFile file={item?.files[0]} />}
          {item?.content && <Text style={styles.textMessage}>{item?.content}</Text>}
          {index === 0 || (item?.senderId?._id !== messages[index - 1]?.senderId?._id) ? (
            <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
          ) : null}
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onLongPress={() => console.log("OnLongPress")} style={[styles.messageOfOther, index === messages?.length - 1 ? {} : { marginTop: 5 }]}>
          <Avatar uri={item?.senderId?.avatar} style={styles.avatar} />
          <View style={styles.boxMessageContent}>
            {conversation?.type === "private" ? null : <Text style={styles.textNameOthers}>{item?.senderId?.name}</Text>}
            {item?.attachments?.length > 0 && <RenderImageMessage images={item?.attachments} wh={wp(70)} />}
            {item?.files?.length > 0 && <ViewFile file={item?.files[0]} />}
            {item?.content && <Text style={styles.textMessage}>{item?.content}</Text>}
            {(index === messages?.length - 1 || index === 0 || item?.senderId?._id !== messages[index - 1]?.senderId?._id) ? (
              <Text style={styles.textTime}>{formatTime(item?.createdAt)}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }
  });

export default MessageItem;