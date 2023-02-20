# Install PnP SharePoint module if not already installed
if (-not (Get-Module -Name "PnP.PowerShell" -ErrorAction SilentlyContinue)) {
    Install-Module -Name "PnP.PowerShell" -Scope CurrentUser
}

# Connect to the site and get the list
Connect-PnPOnline -Url "https://devadmintools.sharepoint.com/sites/Admin-tools/" -Interactive
$listName = "FeedbackItems"
$list = Get-PnPList -Identity $listName

$tags = Get-PnPField -List $list -Identity "Tags"

Set-PnPField -Identity $tags -Values @{ FillInChoice = $true; Choices = [string[]]@("FB:/Category", "FB:/Item") }