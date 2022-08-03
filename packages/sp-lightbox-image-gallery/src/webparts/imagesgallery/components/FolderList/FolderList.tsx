import * as React from 'react';
import styles from '../ImagesGalleryWebPart.module.scss';
import { IFolderListProps } from './IFolderListProps';
import { Folder } from '../Folder/Folder';

export const FolderList: React.FC<IFolderListProps> = (props) => {
  const allFolders = props.foldersInfo.map((folder, index) => {
    return (
      <Folder
        key={index}
        folderInfo={folder}
        onClick={(folderInfo) => props.onClick(folderInfo)}
      />
    );
  });

  return <div className={styles.folderList}>{allFolders}</div>;
};
