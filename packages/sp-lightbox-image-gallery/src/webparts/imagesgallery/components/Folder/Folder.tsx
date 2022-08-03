import * as React from 'react';
import { IFolderProps } from './IFolderProps';
import styles from '../ImagesGalleryWebPart.module.scss';

const _foldericonright: any = require('./icons/folderIconRight.svg');
const _foldericonleft: any = require('./icons/folderIconLeft.svg');

export const Folder: React.FC<IFolderProps> = (props) => {
  return (
      <div title={props.folderInfo.Name} className={styles.folderTile} onClick={(e) => props.onClick(props.folderInfo)}>
        <div className={styles.folderTileContent}>
          <div className={styles.folderIcon}>
            <i aria-hidden="true">
              <img src={_foldericonleft} />
            </i>
            <div className={styles.folderPaper}></div>
            <i aria-hidden="true" className={styles.folderFront}>
              <img src={_foldericonright} />
            </i>
            <span className={styles.folderCount}>{props.folderInfo.ItemCount}</span>
          </div>
          <span className={styles.folderTileNamePlate}>
            <span className={styles.folderTileName}>
                <div className={styles.folderTileNameText}>{props.folderInfo.Name}</div>
            </span>
          </span>
        </div>
      </div>
  )
}
