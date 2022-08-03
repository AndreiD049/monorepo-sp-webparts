import * as React from 'react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ImagesGalleryWebPartStrings';
import styles from '../ImagesGalleryWebPart.module.scss';

import { IImagesGalleryContainerProps } from './IImagesGalleryContainerProps';

import { isEmpty, findIndex } from '@microsoft/sp-lodash-subset';

import {
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Breadcrumb,
  IBreadcrumbItem,
  Overlay,
  ITheme,
  Separator,
} from 'office-ui-fabric-react';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';

import { ImageList } from '../ImageList/ImageList';
import { FolderList } from '../FolderList/FolderList';
import { IFolderInfo, Items } from 'sp-preset';
import { Pager } from '../Pager/Pager';

export const ImagesGalleryContainer: React.FC<IImagesGalleryContainerProps> = (
  props
) => {
  const [hasError, setHasError] = React.useState(false);
  const [areResultsLoading, setAreResultsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [folderData, setFolderData] = React.useState({
    folder: null,
    files: [],
    subFolders: [],
  });
  const [breadCrumb, setBreadCrumb] = React.useState<IFolderInfo[]>([]);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    _fetchDocumentLibraryItems(props.imageLibraryRootFolderUniqueId, true);
  }, [props]);

  React.useEffect(() => {
    if (breadCrumb.length > 0) {
      const last = breadCrumb[breadCrumb.length - 1].Name;
      const lastPage = localStorage.getItem('spGalleryPage' + last);
      console.log(lastPage);
      if (lastPage) {
        setPage(+lastPage);
      }
    }
  }, [breadCrumb]);

  const _fetchDocumentLibraryItems = async (
    uniqueFolderId: string,
    reset: boolean = false
  ): Promise<void> => {
    try {
      setAreResultsLoading(true);
      setHasError(false);
      setErrorMessage('');

      let folderData = await props.dataService.getFolderData(uniqueFolderId);

      setAreResultsLoading(false);
      setFolderData(folderData);
      setBreadCrumb((prev) =>
        _getBreadCrumbState(prev, folderData.folder, reset)
      );
      setPage(0);
    } catch (error) {
      setAreResultsLoading(false);
      setHasError(true);
      setErrorMessage(error.message);
    }
  };

  const breadCrumbData = React.useMemo(() => {
    return breadCrumb.map(
      (f) =>
        ({
          text: f.Name,
          key: f.UniqueId,
          onClick: async (ev, item) =>
            await _fetchDocumentLibraryItems(item.key),
        } as IBreadcrumbItem)
    );
  }, [breadCrumb]);

  const _getBreadCrumbState = (
    prevBreadCrumbState: IFolderInfo[],
    folder: IFolderInfo,
    reset: boolean
  ): IFolderInfo[] => {
    if (reset) {
      return [folder];
    }

    let existingItemIndex = findIndex(
      prevBreadCrumbState,
      (f) => f.UniqueId === folder.UniqueId
    );
    if (existingItemIndex > -1) {
      return prevBreadCrumbState.slice(0, existingItemIndex + 1);
    }

    return [...prevBreadCrumbState, folder];
  };

  const onPageChange = (num: number) => () => {
    setAreResultsLoading(() => {
      setTimeout(
        () =>
          setPage((page) => {
            setAreResultsLoading(false);
            const nextPage = page + num;
            localStorage.setItem('spGalleryPage' + breadCrumb[breadCrumb.length - 1].Name, nextPage.toString());
            return nextPage;
          }),
        1000
      );
      return true;
    });
  };

  const pagedItems = React.useMemo(() => {
    if (folderData.files.length < props.itemsPerPage) {
      return folderData.files;
    }
    const start = page * props.itemsPerPage;
    return folderData.files.slice(start, start + props.itemsPerPage);
  }, [page, folderData.files]);

  const { semanticColors }: IReadonlyTheme = props.themeVariant;

  let renderWebPartTitle: JSX.Element = null;
  let renderWebPartContent: JSX.Element = null;
  let renderWebPartEmptyMessage: JSX.Element = null;
  let renderOverlay: JSX.Element = null;
  let renderLightbox: JSX.Element = null;

  // Loading behavior
  if (areResultsLoading) {
    renderOverlay = (
      <React.Fragment>
        <Overlay
          isDarkThemed={false}
          theme={props.themeVariant as ITheme}
          className={styles.overlay}
        >
          <Spinner size={SpinnerSize.medium} />
        </Overlay>
      </React.Fragment>
    );
  }

  // WebPart title
  renderWebPartTitle = (
    <WebPartTitle
      displayMode={props.displayMode}
      title={props.webPartTitle}
      updateProperty={(value: string) => props.updateWebPartTitle(value)}
    />
  );

  if (isEmpty(folderData.subFolders) && isEmpty(folderData.files)) {
    renderWebPartEmptyMessage = (
      <MessageBar messageBarType={MessageBarType.info}>
        {strings.ShowBlankEditInfoMessage}
      </MessageBar>
    );
  }

  renderWebPartContent = (
    <React.Fragment>
      {renderOverlay}
      <Breadcrumb
        items={breadCrumbData}
        maxDisplayedItems={5}
        theme={props.themeVariant as ITheme}
      />
      {renderWebPartEmptyMessage}
      <FolderList
        foldersInfo={folderData.subFolders}
        onClick={async (folderInfo) =>
          await _fetchDocumentLibraryItems(folderInfo.UniqueId)
        }
      />
      {renderLightbox}
      <ImageList rootUrl={props.rootUrl} imagesInfo={pagedItems} />
      <Separator />
      <Pager
        pages={Math.ceil(folderData.files.length / props.itemsPerPage)}
        currentPage={page + 1}
        onNextPage={onPageChange(1)}
        onPrevPage={onPageChange(-1)}
      />
    </React.Fragment>
  );

  // Error Message
  if (hasError) {
    renderWebPartContent = (
      <MessageBar messageBarType={MessageBarType.error}>
        {errorMessage}
      </MessageBar>
    );
  }

  return (
    <div style={{ backgroundColor: semanticColors.bodyBackground }}>
      <div className={styles.imagesGalleryWebpart}>
        {renderWebPartTitle}
        {renderWebPartContent}
      </div>
    </div>
  );
};
