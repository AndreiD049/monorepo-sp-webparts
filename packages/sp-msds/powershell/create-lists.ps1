# Login to the site
Connect-PnPOnline "https://devadmintools.sharepoint.com/sites/BSG" -Interactive

$customerListName = "Customers";
$customersList = Get-PnPList -Identity "Lists/$customerListName";
# Create list if not created already
if ($null -eq $customersList) {
    $customersList = New-PnPList -Title $customerListName -Template GenericList

    Add-PnPField -List $customersList -DisplayName "Name" -InternalName "Name" -Type Text -AddToDefaultView
}

$databaseListName = "Databases";
$databasesList = Get-PnPList -Identity "Lists/$databaseListName";
# Create list if not created already
if ($null -eq $databasesList) {
    $databasesList = New-PnPList -Title $databaseListName -Template GenericList

    Add-PnPField -List $databasesList -DisplayName "Sites" -InternalName "Sites" -Type Choice -AddToDefaultView -Choices "119", "CAR353", "ELC353", "FELUY", "HOUSTON363", "KALLO1548", "KALLO1998", "KNW", "LB1227", "LUITHAGEN", "LXS", "NOORD355", "NOORDSTER", "Q309", "RIGA1218", "SNIK4203", "TRAINING", "WVN136"
    Add-PnPField -List $databasesList -DisplayName "Region" -InternalName "Region" -Type Choice -AddToDefaultView -Choices "AMER", "APAC", "EMEA"
}

# Application form
$listName = "Web application form"
$newList = Get-PnPList -Identity "Lists/$listName"
$created = $false;
# Create list if not created already
if ($null -eq $newList) {
    $newList = New-PnPList -Title $listName -Template GenericList
    $created = $true;
}

if ($created) {
    # Site
    Add-PnPField -List $newList -DisplayName "Site" -InternalName "Site" -Type Choice -AddToDefaultView -Choices "MEXICO742", "LB1227", "Q309", "RIGA1218", "SNIK4203", "Cremona", "Test1"
    # Database
    Add-PnPFieldFromXml -List $newList -FieldXml "<Field Description='Database' DisplayName='Database' Format='Dropdown' Indexed='FALSE' IsModern='TRUE' IsRelationship='FALSE' List='$($databasesList.Id)' Name='Database' ShowField='Title' Title='Database' Type='Lookup'></Field>"
    # MSDS
    Add-PnPField -List $newList -DisplayName "Do you have an (European) msds? / Not older than 2 years" -InternalName "HasMsds" -Type Boolean -AddToDefaultView
    # MSDS Date
    Add-PnPFieldFromXml -List $newList -FieldXml "<Field DisplayName='MSDS issued date' FriendlyDisplayFormat='Disabled' Format='DateOnly' IsModern='TRUE' Name='MSDSDate' Title='MSDSDate' Type='DateTime'></Field>"
    # Cas no.
    Add-PnPField -List $newList -DisplayName "MSDS Cas No." -InternalName "CasNo" -Type Text -AddToDefaultView
    # Customer
    Add-PnPFieldFromXml -List $newList -FieldXml "<Field Description='Customer name in PLATO' DisplayName='Customer name in PLATO' Format='Dropdown' Indexed='FALSE' IsModern='TRUE' IsRelationship='FALSE' List='$($customersList.Id)' Name='CustomerName' ShowField='Title' Title='Customer name in PLATO' Type='Lookup'></Field>"
    # Product
    Add-PnPField -List $newList -DisplayName "Product name to create in Plato" -InternalName "ProductName" -Type Text -AddToDefaultView
    # Material type
    Add-PnPField -List $newList -DisplayName "Material type" -InternalName "MaterialType" -Type Choice -AddToDefaultView -Choices "Finished Goods","Raw material","Packaging material"
    # Customs code
    Add-PnPField -List $newList -DisplayName "Customs code" -InternalName "CustomsCode" -Type Text -AddToDefaultView
    # Form & Shape
    Add-PnPField -List $newList -DisplayName "Form or Shape" -InternalName "FormShape" -Type Choice -AddToDefaultView -Choices "AEROSOL", "AMORPHOUS", "ANGLE-BAR", "BALES", "BAR-RND", "BAR-SQ", "BAR-VKT", "BEAD", "BEANS", "BOARD", "BOTTLE", "BRICK", "BRIQUETTE", "BUNDLE", "BUTTER", "CAKE", "CAN", "CATHODE", "CLUSTER", "COIL", "COIL01-13", "COIL14-16", "CR", "CRISTAL", "CRUMPS", "CYCLPOWDER", "CYLINDER", "DUST", "FIBERS", "FILM", "FLAKES", "FLOUR", "FLUFF", "GRANULAR", "GRANULS", "GRIT", "INGOT", "IRRELEVANT", "KEG", "LAMINATE", "LIQUID", "MASS", "MICROPEL", "NUTS", "PALLET", "PANEL", "PASTE", "PASTILLE", "PEARLS", "PELLETS", "PIECE", "PIPE", "PLATES", "POT", "POWDER", "PRILLS", "SHEET", "SLAB", "SOLID", "SOW", "STICKS", "STRAND", "TABLETS", "TBAR", "TIRE", "TRAY", "UNKNOWN", "WIREROD"
    # Color
    Add-PnPField -List $newList -DisplayName "Color" -InternalName "Color" -Type Choice -AddToDefaultView -Choices "AMBER", "AMBER-01", "BEIGE", "BLACK", "BLUE-01", "BLUE-02", "BROWN", "BROWN01", "COPPER", "CRISTAL-01", "CRISTAL-02", "CRISTAL-03", "CRISTAL-04", "CRISTAL-05", "GREEN", "GREEN-01", "GREY", "GREY-01", "GREY-02", "MIX-01", "MIX-02", "MIX-03", "MULTI", "NATURAL", "ORANGE", "PINK", "PURPLE", "RED", "SILVER", "UNKNOWN", "VIOLET", "WHITE", "YELLOW"
    # Packer operations?
    Add-PnPField -List $newList -DisplayName "PACKED OPERATIONS NEEDED?" -InternalName "PackedOperations" -Type Boolean -AddToDefaultView
    # Warehouse type
    Add-PnpField -List $newList -DisplayName "Warehouse type" -InternalName "WarehouseType" -Type Choice -AddToDefaultView -Choices "Default (non-hazardous)", "exxon", "SABIC/PP          /Polypropylene", "SABIC/PE-LD     /Low Density Polyethylene", "SABIC/PE-LLD   /Linear Low Density Polyethylene", "SABIC/PE-HD    /High Density Polyethylene", "SABIC/SPVC      /S-Polyvinyl Chloride", "SABIC/EPVC      /E-Polyvinyl Chloride", "SABIC/PS          /Polystyrene", "SABIC/PET        /PET (BC)", "Dangerous goods", "SABIC/PC          /Polycarbonate", "SABIC/Polyacetal", "SABIC/FATTY ACID", "SABIC/POE        /PolyOlefin Elastomers", "SABIC/PPL        /PPL Middle East", "Borlink material cross-linked material", "Customs Suspension", "DOW WAREHOUSE", "DOW WAREHOUSE HEAT", "SILAN PRODUCT VTMS ENBEDDED", "SILAN OILED PRODUCT HDTMS", "SILAN OLD PRODUCTS TO CHECK", "Stick potential", "Unknown silan material - to check MSDS/Manufacturer"

    # Debagging operations?
    Add-PnPField -List $newList -DisplayName "DEBAGGING OPERATIONS NEEDED?" -InternalName "DebaggingOperations" -Type Boolean -AddToDefaultView

    # Silo operations?
    Add-PnPField -List $newList -DisplayName "SILO OPERATION NEEDED?" -InternalName "SiloOperations" -Type Boolean -AddToDefaultView

    # Melting point
    Add-PnPField -List $newList -DisplayName "Melting point? °C" -InternalName "MeltingPoint" -Type Number -AddToDefaultView
    # Abrasive
    Add-PnPField -List $newList -DisplayName "Abrasive? Filled with short glass fiber" -InternalName "Abrasive" -Type Boolean -AddToDefaultView
    # Hygroscopic
    Add-PnPField -List $newList -DisplayName "Hygroscopic? Tending to absorb moisture, water from air." -InternalName "Hygroscopic" -Type Boolean -AddToDefaultView

    # Forbidden mixed production site
    Add-PnPField -List $newList -DisplayName "Forbidden mixed production site in silo" -InternalName "ForbiddenMixedSites" -Type Boolean -AddToDefaultView

    # Dedicatet flexibles/valve
    Add-PnPField -List $newList -DisplayName "Dedicated Flexible(s)? Rotary Valve(s)" -InternalName "DedicatedFlexiblesValves" -Type Text -AddToDefaultView

    # Description on label
    Add-PnPField -List $newList -DisplayName "Description on label" -InternalName "DescriptionOnLabel" -Type Text -AddToDefaultView
    # Urgency
    Add-PnPField -List $newList -DisplayName "Urgency" -InternalName "Urgency" -Type Choice -AddToDefaultView -Choices "Low", "Medium", "High"
    # Storage and manip allowed
    Add-PnPField -List $newList -DisplayName "Storage and manipulation of the product allowed" -InternalName "StorageManipApproved" -Type Boolean -AddToDefaultView
    # Product type
    Add-PnPField -List $newList -DisplayName "Product type" -InternalName "ProductType" -Type Choice -AddToDefaultView -Choices "AA", "ABC", "ABS", "A-COPOL", "ADDITIVE", "AGRI-INT", "AIR", "AL", "ALLERGENS", "ALMONDNUTS", "ANTIOX", "ANTIOX P", "ANTIOX PP", "ANTIOX T", "AR", "ARABIC GUM", "AROM", "ASA", "BEER", "BENTONIET", "BIO", "BIOCIDE", "BOEHMITE", "BOX", "BR", "BRICK", "BRO-INT", "BUILDER", "CA", "CACO3", "CAFO", "CAPROP", "CAR", "CARBOHYDRA", "CARTON", "CASHEWNUTS", "CASULFAAT", "CB", "CELLULOSE", "CEMENT", "CIDER", "CL", "CLAY", "CLINOP", "COCOA", "COFFEE", "COIL", "COMPONENTS", "COMPOUND", "COPOL", "COPOL-PE", "COPOL-PP", "COSM-INT", "COTTON", "CRATE", "CT", "CUC", "CURATIVE", "DBD", "DDDA", "DEXTROSE", "DOP", "E/AA", "E/MA", "EBA", "EEA", "EGG", "ELEC-EQUIP", "ELECTRONIC", "ELINSTMAT", "EMULGATOR", "ENZYMES", "EPDMRUBBER", "EPVC", "ESTER", "EVA", "FA", "FABRIC", "FAC", "FEED", "FERT", "FISH", "FLA-RET", "FLA-RET-PH", "FLEX", "FLUORELAS", "FLUORFLUID", "FLUORLIDIS", "FLUORPOL", "FLUORPOLCO", "FLUORPOLDI", "FOOD", "FS", "FUNG", "FURNITURE", "GALACTOMAN", "GARMENTS", "GLASS", "GLYCERINE", "GREASE", "GROUNDNUTS", "HALS", "HAZCHEM", "HAZELNUTS", "HEC", "HERB", "HOMO", "HP", "HYDRRESIN", "IB-COPOL", "IIR", "INDCHEM", "INDINSTMIX", "INSECT", "INSTAL-MAT", "INT", "IONEXCH", "IR", "JUICE", "LB", "LCP", "LEATHER", "LINEN", "LYSINE", "MACHINEPAR", "MADEXTROSE", "MCP", "MECH-EQUIP", "MECINSTMAT", "MELAMINE", "METAL", "METHIONINE", "MGCA", "MILK", "MINERAL", "MOTOROIL", "MS", "MSTARCH", "MUSTARD", "NA", "NBR", "NONHAZCHEM", "NUTMEG", "NUTS", "OIL", "ORG COFFEE", "ORGPIGM", "PA", "PAC", "PALLET", "PAPER", "PB", "PBT", "PC", "PC-ABS", "PCC", "PC-MD", "PDLA", "PE", "PEANUTS", "PEG", "PE-HD", "PE-HD-GR", "PE-HD-IDEA", "PE-HD-UTEC", "PE-HOMO", "PEI", "PE-LD", "PE-LD-GR", "PE-LLD", "PE-LLD-GR", "PE-LMD", "PE-MD", "PEMTL", "PER", "PES", "PE-SILANE", "PET", "PE-TH", "PE-UHMV", "PE-ULD", "PHAR", "PHAR-INT", "PIB", "PIPE", "PK", "PL", "PLA", "PLATE", "PLUCHE", "PMMA", "POE", "POLY", "POLYBLEND", "POLYMER", "POLYOL", "POM", "PP", "PPC", "PPG", "PPO", "PPS", "PROTEIN", "PS", "PSU", "PTA", "PUR", "PVA", "PVAC", "PVB", "PVC", "RAISINS", "RICE", "ROLL", "ROPE", "RUBBER", "SA", "SALICACID", "SALT", "SAN", "SAS", "SB", "SBC", "SBS", "SEAFOOD", "SEBS", "SEEDS", "SELHERB", "SEPIOLITE", "SESAME", "SHEABUTTER", "SHN", "SIC", "SILANE", "SILICA", "SILICAGEL", "SILICONE", "SIZE", "SMA", "SOIL", "SOLARPANEL", "SOLVENT", "SOY", "SPICES", "SPVC", "SS", "STARCH", "STEEL", "STERILIZER", "STF", "STL", "SUEDE", "SUGAR", "SULFACID", "SULPHITES", "SUPPORTMAT", "SUSP", "SYNTHRESIN", "TANK", "TECNODISP", "TEMP", "TERPO", "THERMOPLAS", "TH-PUR", "THREOTRYPT", "TIO2", "TOBACCO", "TOTHERB", "TPC-ET", "TUBE", "WAX", "WHEAT", "WOOD", "YEAST", "YOOHOO", "ZINC"
    # Forbidden for bulk
    Add-PnPField -List $newList -DisplayName "Forbidden for bulk" -InternalName "ForbiddenForBulk" -Type Boolean -AddToDefaultView
    # Bulk density
    Add-PnPField -List $newList -DisplayName "Bulk density Plato" -InternalName "BulkDensity" -Type Number -AddToDefaultView
    # Measured bulk density
    Add-PnPField -List $newList -DisplayName "Measured bulk density" -InternalName "MeasuredBulkDensity" -Type Boolean -AddToDefaultView
    # Manipulation not allowed
    Add-PnPField -List $newList -DisplayName "Manipulation (change) not allowed" -InternalName "ManipNotAllowed" -Type Boolean -AddToDefaultView
    # Product remarks
    Add-PnPField -List $newList -DisplayName "Product remarks" -InternalName "ProductRemarks" -Type Text -AddToDefaultView
    # Safety remarks
    Add-PnPField -List $newList -DisplayName "SAFETY REMARKS (Printed on each order)" -InternalName "SafetyRemarks" -Type Text -AddToDefaultView
    # Remarks silo
    Add-PnPField -List $newList -DisplayName "REMARKS SILO operations" -InternalName "SiloRemarks" -Type Text -AddToDefaultView
    # Hazardous goods
    Add-PnPField -List $newList -DisplayName "HAZARDOUS GOODS products code" -InternalName "HazardousGoods" -Type Choice -AddToDefaultView -Choices "ALIMET", "ALIMET LIQUID", "ETHOXYQUIN", "FR6012", "GHS", "GHS07", "GHS08", "MELAMINE", "MERA", "MHA", "MHA LQD", "NEXT ENHANCE 150", "PRO-STABIL AP 80 L", "SANTOQUIN LIQUID", "SANTOQUIN POWDER"
    # Dust category
    Add-PnPField -List $newList -DisplayName "Dust category" -InternalName "DustCategory" -Type Boolean -AddToDefaultView
    # Nitrogen coverage
    Add-PnPField -List $newList -DisplayName "Nitrogen coverage" -InternalName "NitrogenCoverage" -Type Boolean -AddToDefaultView
    # Client requirements on F&F
    Add-PnPField -List $newList -DisplayName "Client requirements on food and feed (GMP) regulations" -InternalName "ClientRequirementsFnF" -Type Boolean -AddToDefaultView
    # MOC
    Add-PnPField -List $newList -DisplayName "MOC Management of change" -InternalName "MOC" -Type Text -AddToDefaultView
    # Extra check needed
    Add-PnPField -List $newList -DisplayName "Extra check needed by quality in Plato ? Approver product will activate PM in Plato!" -InternalName "ExtraCheckNeeded" -Type Boolean -AddToDefaultView
    # 
    Add-PnPField -List $newList -DisplayName "IsApprovalNeeded" -InternalName "IsApprovalNeeded" -Type Boolean
}

#############################################################

# Application form customizations
$listName = "Application form fields"
$newList = Get-PnPList -Identity "Lists/$listName"
$created = $false;
# Create list if not created already
if ($null -eq $newList) {
    $newList = New-PnPList -Title $listName -Template GenericList
    $created = $true;
}

if ($created) {
    # Site
    Add-PnPField -List $newList -DisplayName "Site" -InternalName "Site" -Type Choice -AddToDefaultView -Choices "MEXICO742", "LB1227", "Q309", "RIGA1218", "SNIK4203", "Cremona", "Test1"
    # Database
    Add-PnPField -List $newList -DisplayName "Database" -InternalName "Database" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # MSDS
    Add-PnPField -List $newList -DisplayName "Do you have an (European) msds? / Not older than 2 years" -InternalName "HasMsds" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # MSDS Date
    Add-PnPField -List $newList -DisplayName "MSDS issued date" -InternalName "MSDSDate" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Cas no.
    Add-PnPField -List $newList -DisplayName "MSDS Cas No." -InternalName "CasNo" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Customer
    Add-PnPField -List $newList -DisplayName "Customer name in PLATO" -InternalName "CustomerName" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Product
    Add-PnPField -List $newList -DisplayName "Product name to create in Plato" -InternalName "ProductName" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Material type
    Add-PnPField -List $newList -DisplayName "Material type" -InternalName "MaterialType" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Customs code
    Add-PnPField -List $newList -DisplayName "Customs code" -InternalName "CustomsCode" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Form & Shape
    Add-PnPField -List $newList -DisplayName "Form or Shape" -InternalName "FormShape" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Color
    Add-PnPField -List $newList -DisplayName "Color" -InternalName "Color" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Packer operations?
    Add-PnPField -List $newList -DisplayName "PACKED OPERATIONS NEEDED?" -InternalName "PackedOperations" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Warehouse type
    Add-PnPField -List $newList -DisplayName "Warehouse type" -InternalName "WarehouseType" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"

    # Debagging operations?
    Add-PnPField -List $newList -DisplayName "DEBAGGING OPERATIONS NEEDED?" -InternalName "DebaggingOperations" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"

    # Silo operations?
    Add-PnPField -List $newList -DisplayName "SILO OPERATION NEEDED?" -InternalName "SiloOperations" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"

    # Melting point
    Add-PnPField -List $newList -DisplayName "Melting point? °C" -InternalName "MeltingPoint" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Abrasive
    Add-PnPField -List $newList -DisplayName "Abrasive? Filled with short glass fiber" -InternalName "Abrasive" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Hygroscopic
    Add-PnPField -List $newList -DisplayName "Hygroscopic? Tending to absorb moisture, water from air." -InternalName "Hygroscopic" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"

    # Forbidden mixed production site
    Add-PnPField -List $newList -DisplayName "Forbidden mixed production site in silo" -InternalName "ForbiddenMixedSites" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"

    # Dedicatet flexibles/valve
    Add-PnPField -List $newList -DisplayName "Dedicated Flexible(s)? Rotary Valve(s)" -InternalName "DedicatedFlexiblesValves" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"

    # Description on label
    Add-PnPField -List $newList -DisplayName "Description on label" -InternalName "DescriptionOnLabel" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Urgency
    Add-PnPField -List $newList -DisplayName "Urgency" -InternalName "Urgency" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Storage and manip allowed
    Add-PnPField -List $newList -DisplayName "Storage and manipulation of the product allowed" -InternalName "StorageManipApproved" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Product type
    Add-PnPField -List $newList -DisplayName "Product type" -InternalName "ProductType" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Forbidden for bulk
    Add-PnPField -List $newList -DisplayName "Forbidden for bulk" -InternalName "ForbiddenForBulk" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Bulk density
    Add-PnPField -List $newList -DisplayName "Bulk density Plato" -InternalName "BulkDensity" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Measured bulk density
    Add-PnPField -List $newList -DisplayName "Measured bulk density" -InternalName "MeasuredBulkDensity" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Manipulation not allowedBulkDensity
    Add-PnPField -List $newList -DisplayName "Manipulation (change) not allowed" -InternalName "ManipNotAllowed" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Product remarks
    Add-PnPField -List $newList -DisplayName "Product remarks" -InternalName "ProductRemarks" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Safety remarks
    Add-PnPField -List $newList -DisplayName "SAFETY REMARKS (Printed on each order)" -InternalName "SafetyRemarks" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Remarks silo
    Add-PnPField -List $newList -DisplayName "REMARKS SILO operations" -InternalName "SiloRemarks" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Hazardous goods
    Add-PnPField -List $newList -DisplayName "HAZARDOUS GOODS products code" -InternalName "HazardousGoods" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Dust category
    Add-PnPField -List $newList -DisplayName "Dust category" -InternalName "DustCategory" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Nitrogen coverage
    Add-PnPField -List $newList -DisplayName "Nitrogen coverage" -InternalName "NitrogenCoverage" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Client requirements on F&F
    Add-PnPField -List $newList -DisplayName "Client requirements on food and feed (GMP) regulations" -InternalName "ClientRequirementsFnF" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # MOC
    Add-PnPField -List $newList -DisplayName "MOC Management of change" -InternalName "MOC" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
    # Extra check needed
    Add-PnPField -List $newList -DisplayName "Extra check needed by quality in Plato ? Approver product will activate PM in Plato!" -InternalName "ExtraCheckNeeded" -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
}
Write-Host "All done"
