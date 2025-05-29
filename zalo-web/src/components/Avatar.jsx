import Avatar from "@mui/material/Avatar";
import PropTypes from "prop-types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const UserAvatar = ({ uri, height, width, sx, onClick }) => {
  return (
    <Avatar
      src={`${supabaseUrl}/storage/v1/object/public/uploads/${uri}`}
      alt="Avatar"
      sx={{
        width: width,
        height: height,
        display: "block",
        cursor: onClick ? "pointer" : "default",
        ...sx,
      }}
      onClick={onClick}
    />
  );
};
UserAvatar.propTypes = {
  uri: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sx: PropTypes.object,
  onClick: PropTypes.func,
};

export default UserAvatar;
