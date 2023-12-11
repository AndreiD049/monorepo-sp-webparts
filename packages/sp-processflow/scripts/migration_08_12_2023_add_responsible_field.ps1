[CmdletBinding()]
param(
	[Parameter(Mandatory=$true)]
	[string]$SiteUrl,

	[Parameter(Mandatory=$true)]
	[string]$ListName
)

# 
# Log in
Connect-PnpOnline -Url $SiteUrl -Interactive

$List = Get-PnpList -Identity $ListName

$Field = Get-PnPField -List $List -Identity "Responsible"

if ($Field -ne $null) {
	Write-Host "Responsible field already exists in list $ListName"
	return
}

Write-Host "Adding responsible field to list $ListName"

Add-PnPField -List $List -DisplayName "Responsible" -InternalName "Responsible" -Type User -AddToDefaultView

Write-Host "Adding responsible field to list $ListName"
