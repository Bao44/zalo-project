import Avatar from "@mui/material/Avatar";
import { supabaseUrl } from "../../constants";

const UserAvatar = ({ uri }) => {
  return (
    <Avatar
      src={`${supabaseUrl}/storage/v1/object/public/uploads/${uri}`}
      alt="Avatar"
      sx={{
        width: 50,
        height: 50,
        marginBottom: "15px",
        display: "block",
      }}
    />
  );
};

export default UserAvatar;
