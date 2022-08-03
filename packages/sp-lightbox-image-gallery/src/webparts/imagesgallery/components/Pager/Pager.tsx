import { IconButton, Text } from "office-ui-fabric-react";
import * as React from "react"
import styles from '../ImagesGalleryWebPart.module.scss';

export interface IPagerProps {
    pages: number;
    currentPage: number;
    onNextPage: () => void;
    onPrevPage: () => void;
}

export const Pager: React.FC<IPagerProps> = (props) => {
  return (
    <div className={styles.pager}>
        <IconButton iconProps={{iconName: 'ChevronLeft'}} onClick={props.onPrevPage} disabled={props.currentPage === 1} />
        <Text className={styles.pagerText} variant="medium">{props.currentPage} / {props.pages}</Text>
        <IconButton iconProps={{iconName: 'ChevronRight'}} onClick={props.onNextPage} disabled={props.currentPage === props.pages} />
    </div>
  )
}
