[CmdletBinding()]
param(
	[Parameter(Mandatory=$true)]
	[string]$SiteUrl,
	[Parameter(Mandatory=$true)]
	[string]$ListName,
	[Parameter(Mandatory=$true)]
	[string]$CsvPath
)


# Login to the site
Connect-PnPOnline $SiteUrl -Interactive

# Get the list
$list = Get-PnPList -Identity "Customers"

$customersList = Get-PnPList -Identity "Lists/$ListName";

# Read the CSV file with 3 columns (Code, Name, Database)
$customers = Import-Csv -Path $CsvPath

# Create the customers in the list using batch, 100 customers per batch, round up
$pages = [math]::Ceiling($customers.Count / 100)

for ($i = 0; $i -lt $pages; $i++) {
	$batch = New-PnPBatch
	$customersToCreate = $customers | Select-Object -Skip ($i * 100) -First 100
	foreach ($customer in $customersToCreate) {
		$item = Add-PnPListItem -List $customersList -Values @{"Title" = $customer.Code; "Name" = $customer.Name; "Database" = $customer.Database} -Batch $batch
	}
	Invoke-PnPBatch -Batch $batch
}

