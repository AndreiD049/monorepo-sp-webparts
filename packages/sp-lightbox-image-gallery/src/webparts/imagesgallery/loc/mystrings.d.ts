declare interface IImagesGalleryWebPartStrings {
  NumberOfColumns: string;
  ImageLibraryRootFolderUniqueId: string;
  PlaceholderIconName: string;
  PlaceholderName: string;
  PlaceholderDescription: string;
  PlaceholderButton: string;
  ShowBlankEditInfoMessage: string;
  NumberOfElementsPerPageLabel: string;
}

declare module 'ImagesGalleryWebPartStrings' {
  const strings: IImagesGalleryWebPartStrings;
  export = strings;
}
