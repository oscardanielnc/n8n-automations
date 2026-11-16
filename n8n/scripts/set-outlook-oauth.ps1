# Run on your PC. Opens the Entra "Certificates & secrets" page, asks for the new client secret VALUE
# (hidden input) and sends it over SSH (stdin) to set-outlook-oauth.sh on the VM. Never touches disk, argv or chat.
$ErrorActionPreference = 'Stop'
$key = "$HOME\.ssh\vm.key"   # SSH key of your VM
$vm = 'user@your-vm'
$sh = Join-Path $PSScriptRoot 'set-outlook-oauth.sh'
$appId = '00000000-0000-0000-0000-000000000000'

Start-Process "https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Credentials/appId/$appId"
Write-Host "1) In the page that opened: 'New client secret' -> 24 months -> Add -> copy the VALUE column."

$s = Read-Host '2) Paste the secret VALUE here (hidden)' -AsSecureString
$secret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))

scp -q -i $key $sh "${vm}:~/n8n/set-outlook-oauth.sh"
$secret | ssh -i $key $vm 'bash ~/n8n/set-outlook-oauth.sh'
$secret = $null
if ($LASTEXITCODE -eq 0) {
  Start-Process 'https://n8n.example.com/home/credentials'
  Write-Host "3) In n8n open 'Outlook' -> 'Connect my account' -> sign in with your Outlook account -> Accept."
}
