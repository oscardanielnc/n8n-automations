# Run on your PC. Asks for the OpenRouter API key (hidden input) and sends it over SSH (stdin)
# to set-openrouter-key.sh on the VM. The key never touches disk, argv or chat.
$ErrorActionPreference = 'Stop'
$key = "$HOME\.ssh\vm.key"   # SSH key of your VM
$vm = 'user@your-vm'
$sh = Join-Path $PSScriptRoot 'set-openrouter-key.sh'

scp -q -i $key $sh "${vm}:~/n8n/set-openrouter-key.sh"
$s = Read-Host 'Paste the OpenRouter API key (hidden)' -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
$plain | ssh -i $key $vm 'bash ~/n8n/set-openrouter-key.sh'
$plain = $null
