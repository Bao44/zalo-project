// src/components/Avatar.jsx
import React from "react";
import { Avatar as MuiAvatar } from "@mui/material";
import { getUserImageSrc } from "../../api/image";

// Giả định theme tương tự mobile
const theme = {
  radius: {
    md: 8, // Bo góc trung bình (tương đương theme.radius.md trên mobile)
  },
  colors: {
    darkLight: "rgba(0, 0, 0, 0.2)", // Màu viền (tương đương theme.colors.darkLight)
  },
};

// Giả định hp(4.5) tương đương 36px trên web (có thể điều chỉnh)
const hp = (value) => value * 8;

const Avatar = ({
  uri,
  size = hp(4.5), // Mặc định 36px
  rounded = theme.radius.md, // Mặc định 8px
  style = {},
}) => {
  return (
    <Box>
      <MuiAvatar
        alt="avatar"
        src={getUserImageSrc(uri)} // Lấy URL ảnh
        sx={{
          width: size,
          height: size,
          borderRadius: rounded,
          border: `1px solid ${theme.colors.darkLight}`, // Viền tương tự mobile
          ...style,
        }}
      />
    </Box>
  );
};

export default Avatar;
