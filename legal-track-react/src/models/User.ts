import MyFolder from "./Folder";

type User = {
  userId: string;
  username: string;
  email: string;
  folders: MyFolder[];
};

export default User;