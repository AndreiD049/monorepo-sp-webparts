# Login to the site
Connect-PnPOnline "https://katoennatie.sharepoint.com/teams/MSDS-MaterialSafetyDataSheets" -Interactive
$list = Get-PnPList -Identity "Lists/Web application form"
$contentType = Get-PnPContentType -List $list -Identity "Item"

$contentType.NewFormClientSideComponentId = "a7fdea8a-6086-4094-b22e-04981e1cdbd6";
$contentType.NewFormClientSideComponentProperties = '{ "approverListName": "Contact person Petrochemicals" }';
$contentType.EditFormClientSideComponentId = "a7fdea8a-6086-4094-b22e-04981e1cdbd6";
$contentType.EditFormClientSideComponentProperties = '{ "approverListName": "Contact person Petrochemicals" }'
$contentType.DisplayFormClientSideComponentId = "a7fdea8a-6086-4094-b22e-04981e1cdbd6";
$contentType.DisplayFormClientSideComponentProperties = '{ "approverListName": "Contact person Petrochemicals" }'

$contentType.Update($false)

Invoke-PnPQuery