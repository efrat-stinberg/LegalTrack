import MyDocument from "./Document";

type MyFolder = {
    folderId: number;
    folderName: string;
    createdDate: string;
    documents: MyDocument[]; // ודאי שזה פה
  };
  
export default MyFolder;