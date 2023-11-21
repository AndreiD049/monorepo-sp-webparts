
$url = Read-Host -Prompt 'Enter the url of the site you want to connect to'

Connect-PnPOnline -Interactive -Url $url

