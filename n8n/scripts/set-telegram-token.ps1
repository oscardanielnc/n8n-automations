# Run on your PC. Asks for the Telegram token with hidden input and sends it over SSH
# (stdin) to set-telegram-token.sh on the VM. The token never touches disk, argv or chat.
$ErrorActionPreference = 'Stop'
$key = "$HOME\.ssh\vm.key"   # SSH key of your VM
$vm = 'user@your-vm'
$sh = Join-Path $PSScriptRoot 'set-telegram-token.sh'

scp -q -i $key $sh "${vm}:~/n8n/set-telegram-token.sh"
$secure = Read-Host 'Paste the NEW Telegram token (hidden)' -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
$plain | ssh -i $key $vm 'bash ~/n8n/set-telegram-token.sh'
$plain = $null
