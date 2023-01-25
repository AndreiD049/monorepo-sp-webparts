# Login to the site
Connect-PnPOnline "https://katoennatie.sharepoint.com/teams/MSDS-MaterialSafetyDataSheets" -Interactive
$list = Get-PnPList -Identity "Lists/Web application form"
$contentType = Get-PnPContentType -List $list -Identity "Item"

$contentType.NewFormClientSideComponentId = "a7fdea8a-6086-4094-b22e-04981e1cdbd6";
$contentType.EditFormClientSideComponentId = "a7fdea8a-6086-4094-b22e-04981e1cdbd6";
$contentType.DisplayFormClientSideComponentId = "a7fdea8a-6086-4094-b22e-04981e1cdbd6";

$contentType.Update($false)

Invoke-PnPQuery