import Avatar from "@mui/material/Avatar";
import { supabaseUrl } from "../../constants";

const UserAvatar = ({ uri, height, width }) => {
  return (
    <Avatar
      src={`${supabaseUrl}/storage/v1/object/public/uploads/${uri}`}
      alt="Avatar"
      sx={{
        width: width,
        height: height,
        marginBottom: "15px",
        display: "block",
      }}
    />
  );
};

export default UserAvatar;
