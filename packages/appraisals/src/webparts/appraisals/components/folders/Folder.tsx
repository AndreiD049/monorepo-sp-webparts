import * as React from "react";
import IUserFolder from "./IFolder";

export interface IFolderProps {
    folder: IUserFolder;
}

const Folder: React.FC<IFolderProps> = (props) => {
    return (<li>{props.folder.Title} ({props.folder.Users.map((user) => user.Title).join(',')})</li>)
};

export default Folder;