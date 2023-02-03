$site = Read-Host -Prompt "Enter site (ex. 'https://contoso.sharepoint.com/teams/admin')"
$site -match "https:\/\/.*\.sharepoint\.com\/(sites|teams)\/.*"
if ($Matches.Count -eq 0) {
    throw "Incorrect site format"
}

Connect-PnPOnline $site -Interactive

$listName = Read-Host -Prompt "Enter list name"

$list = New-PnPList -Title $listName -Template GenericList

$title = Get-PnPField -List $list -Identity "Title"
Set-PnPField -Identity $title -Values @{
    Required = $false
}

# Add fields
Add-PnPField -List $list -DisplayName "User" -InternalName "User" -Type User -AddToDefaultView -Required

Add-PnPField -List $list -DisplayName "Manual" -InternalName "Manual" -Type Text -AddToDefaultView
