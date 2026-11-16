# Run on your PC. Asks for the n8n API key with hidden input and sends it over SSH (stdin) to
# set-n8n-api-key.sh on the VM, which writes it into ~/n8n-panel/deploy/.env and (re)starts the panel.
# The key never touches disk on the PC, argv or chat.
$ErrorActionPreference = 'Stop'
$key = "$HOME\.ssh\vm.key"   # SSH key of your VM
$vm = 'user@your-vm'
$sh = Join-Path $PSScriptRoot 'set-n8n-api-key.sh'

scp -q -i $key $sh "${vm}:~/n8n-panel/set-n8n-api-key.sh"
$secure = Read-Host 'Paste the n8n API key (hidden)' -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
$plain | ssh -i $key $vm 'bash ~/n8n-panel/set-n8n-api-key.sh'
$plain = $null
