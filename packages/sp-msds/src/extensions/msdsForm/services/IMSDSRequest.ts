export interface IMSDSRequest {
    Id: number;
    Site: string;

    Database: string;

    HasMsds: boolean;
    MSDSDate: string;
    CasNo: string;

    CustomerName: string;
    CustomerNameId?: number;

    ProductName: string;
    MaterialType: string;
    CustomsCode: string;
    FormShape: string;
    Color: string;
    PackedOperations: boolean;
    WarehouseType: string;
    DebaggingOperations: boolean;
    SiloOperations: boolean;
    MeltingPoint: string;
    Abrasive: boolean;
    Hygroscopic: boolean;
    ForbiddenMixedSites: boolean;
    DedicatedFlexiblesValves: string;
    DescriptionOnLabel: string;
    Urgency: string;
    StorageManipApproved: boolean;
    ProductType: string;
    ForbiddenForBulk: boolean;
    BulkDensity: number;
    MeasuredBulkDensity: boolean;
    ManipNotAllowed: boolean;
    ProductRemarks: string;
    SafetyRemarks: string;
    SiloRemarks: string;
    HazardousGoods: string;
    DustCategory: boolean;
    NitrogenCoverage: boolean;
    ClientRequirementsFnF: boolean;
    MOC: string;
    ExtraCheckNeeded: boolean;
    IsApprovalNeeded: boolean;

	// Added 2023-12-01 after US request
	SDSPublisher: string;
	ProductNameOnSDS: string;
	SDSVersion: string;
	DescriptionOnDriversDocument: string;
}
