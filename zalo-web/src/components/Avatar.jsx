import Avatar from "@mui/material/Avatar";
import { supabaseUrl } from "../../constants";
import PropTypes from "prop-types";

const UserAvatar = ({ uri, height, width }) => {
  return (
    <Avatar
      src={`${supabaseUrl}/storage/v1/object/public/uploads/${uri}`}
      alt="Avatar"
      sx={{
        width: width,
        height: height,
        display: "block",
      }}
    />
  );
};
UserAvatar.propTypes = {
  uri: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default UserAvatar;
