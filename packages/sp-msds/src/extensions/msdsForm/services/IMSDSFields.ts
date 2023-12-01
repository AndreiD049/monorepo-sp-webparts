type FieldChoices = "Hidden" | "Disabled";

export interface IMSDSFields {
    Id: number;
    Site: string;

    Database: FieldChoices;
    HasMsds: FieldChoices;
    MSDSDate: FieldChoices;
    CasNo: FieldChoices;
    CustomerName: FieldChoices;
    ProductName: FieldChoices;
    MaterialType: FieldChoices;
    CustomsCode: FieldChoices;
    FormShape: FieldChoices;
    Color: FieldChoices;
    PackedOperations: FieldChoices;
    WarehouseType: FieldChoices;
    DebaggingOperations: FieldChoices;
    SiloOperations: FieldChoices;
    MeltingPoint: FieldChoices;
    Abrasive: FieldChoices;
    Hygroscopic: FieldChoices;
    ForbiddenMixedSites: FieldChoices;
    DedicatedFlexiblesValves: FieldChoices;
    DescriptionOnLabel: FieldChoices;
    Urgency: FieldChoices;
    StorageManipApproved: FieldChoices;
    ProductType: FieldChoices;
    ForbiddenForBulk: FieldChoices;
    BulkDensity: FieldChoices;
    MeasuredBulkDensity: FieldChoices;
    ManipNotAllowed: FieldChoices;
    ProductRemarks: FieldChoices;
    SafetyRemarks: FieldChoices;
    SiloRemarks: FieldChoices;
    HazardousGoods: FieldChoices;
    DustCategory: FieldChoices;
    NitrogenCoverage: FieldChoices;
    ClientRequirementsFnF: FieldChoices;
    MOC: FieldChoices;
    ExtraCheckNeeded: FieldChoices;

	// Added 2023-12-01 after US request
	SDSPublisher: FieldChoices;
	ProductNameOnSDS: FieldChoices;
	SDSVersion: FieldChoices;
	DescriptionOnDriversDocument: FieldChoices;
}
