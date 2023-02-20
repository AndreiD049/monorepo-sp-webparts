# Install PnP SharePoint module if not already installed
if (-not (Get-Module -Name "PnP.PowerShell" -ErrorAction SilentlyContinue)) {
    Install-Module -Name "PnP.PowerShell" -Scope CurrentUser
}

# Prompt for site URL and connect interactively
$siteUrl = Read-Host "Enter site URL"
Connect-PnPOnline -Url $siteUrl -Interactive

# Prompt for list name and create it
$listName = Read-Host "Enter list name"
New-PnPList -Title $listName -Template GenericList

# Create necessary columns
Add-PnPField -List $listName -DisplayName "Fields" -InternalName "Fields" -Type Note -AddToDefaultView
$tags = Add-PnPField -List $listName -DisplayName "Tags" -InternalName "Tags" -Type MultiChoice -AddToDefaultView -Choices "FB:/Category"
Set-PnPField -Identity $tags -Values @{ FillInChoice = $true; }
Add-PnPField -List $listName -DisplayName "IsService" -InternalName "IsService" -Type Boolean -AddToDefaultView