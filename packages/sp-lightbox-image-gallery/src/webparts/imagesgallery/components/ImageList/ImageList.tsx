import * as React from 'react';
import styles from './../ImagesGalleryWebPart.module.scss';
import { IImageListProps } from './IImageListProps';
import Image from '../Image/Image';
import { LightgalleryProvider } from 'react-lightgallery';
import 'lightgallery.js/dist/css/lightgallery.css';

export const ImageList: React.FC<IImageListProps> = (props) => {
  const allImages = props.imagesInfo.map((image, index) => {
    return <Image key={image.UniqueId} imageInfo={image} rootUrl={props.rootUrl} />;
  });

  return (
    <LightgalleryProvider
      lightgallerySettings={{
        counter: false,
        thumbnail: false,
        download: false,
        loop: false,
      }}
    >
      <div className={styles.imageList}>
        {allImages}
      </div>
    </LightgalleryProvider>
  );
};
