[CmdletBinding()]
param(
	[Parameter(Mandatory=$true)]
	[string]$SiteUrl,
	[Parameter(Mandatory=$true)]
	[string]$ApplicationFormListName,
	[Parameter(Mandatory=$true)]
	[string]$ApplicationFormFieldsListName
)
# Login to the site
Connect-PnPOnline $SiteUrl -Interactive

# Application form
$newList = Get-PnPList -Identity "Lists/$ApplicationFormListName"
Add-PnPField -List $newList -InternalName "SDSPublisher" -DisplayName "SDS Publisher" -Type Text -AddToDefaultView
Add-PnPField -List $newList -InternalName "ProductNameOnSDS" -DisplayName "Product name on SDS" -Type Text -AddToDefaultView
Add-PnPField -List $newList -InternalName "SDSVersion" -DisplayName "SDS Version" -Type Text -AddToDefaultView
Add-PnPField -List $newList -InternalName "DescriptionOnDriversDocument" -DisplayName "Description on drivers document" -Type Text -AddToDefaultView

#############################################################

# Application form customizations
$newList = Get-PnPList -Identity "Lists/$ApplicationFormFieldsListName"
Add-PnPField -List $newList -InternalName "SDSPublisher" -DisplayName "SDS Publisher"  -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
Add-PnPField -List $newList -InternalName "ProductNameOnSDS" -DisplayName "Product name on SDS"  -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
Add-PnPField -List $newList -InternalName "SDSVersion" -DisplayName "SDS Version"  -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
Add-PnPField -List $newList -InternalName "DescriptionOnDriversDocument" -DisplayName "Description on drivers document"  -Type Choice -AddToDefaultView -Choices "Hidden", "Disabled"
Write-Host "All done"
