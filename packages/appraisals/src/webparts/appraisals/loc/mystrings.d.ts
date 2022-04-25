declare interface IAppraisalsWebPartStrings {
    PropertyPaneDescription: string;
    BasicGroupName: string;
    DescriptionFieldLabel: string;
    DefaultFolderRoleLabel: string;
    DefaultFolderRoleDescription: string;
    FolderManagementGroupName: string;
    SupportEmailsLabel: string;
    SupportEmailsDescription: string;
    CreateFolderMailSubject: string;
    CreateFolderMailBody: string;
}

declare module 'AppraisalsWebPartStrings' {
    const strings: IAppraisalsWebPartStrings;
    export = strings;
}
