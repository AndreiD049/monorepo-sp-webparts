import { DisplayMode } from "@microsoft/sp-core-library";
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IDataService } from '../../../../models/IDataService';

export interface IImagesGalleryContainerProps {
  imageLibraryRootFolderUniqueId: string;
  rootUrl: string;
  itemsPerPage: number;
  dataService: IDataService;
  webPartTitle: string;
  displayMode: DisplayMode;
  themeVariant: IReadonlyTheme | undefined;
  updateWebPartTitle: (value: string) => void;
}
