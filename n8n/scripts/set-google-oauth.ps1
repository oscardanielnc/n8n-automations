# Run on your PC. Asks for the Google OAuth client ID and secret (hidden input) and sends them over SSH
# (stdin) to set-google-oauth.sh on the VM. They never touch disk, argv or chat.
$ErrorActionPreference = 'Stop'
$key = "$HOME\.ssh\vm.key"   # SSH key of your VM
$vm = 'user@your-vm'
$sh = Join-Path $PSScriptRoot 'set-google-oauth.sh'

function Read-Hidden($prompt) {
  $s = Read-Host $prompt -AsSecureString
  [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}

scp -q -i $key $sh "${vm}:~/n8n/set-google-oauth.sh"
$id = Read-Hidden 'Paste the Google CLIENT ID (hidden)'
$secret = Read-Hidden 'Paste the Google CLIENT SECRET (hidden)'
"$id`n$secret" | ssh -i $key $vm 'bash ~/n8n/set-google-oauth.sh'
$id = $null; $secret = $null
