$dir = Join-Path (Get-Location) "docs/email-templates/files"

$logoBlock = @"
<img src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg" width="108" alt="MJG" style="display:block;margin:0 auto 10px;width:108px;max-width:108px;height:auto;border:0;outline:none;text-decoration:none;">
      <span style="font-family:'Fraunces', Georgia, 'Times New Roman', serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#16243d;font-weight:600;">Michael&nbsp;J.&nbsp;Gauthier</span>
"@

$pattern = '<span style="font-family:''Fraunces'', Georgia, ''Times New Roman'', serif;font-size:13px;letter-spacing:0\.34em;text-transform:uppercase;color:#16243d;font-weight:600;">Michael&nbsp;J\.\&nbsp;Gauthier</span>'
$fallbackPattern = '<span style="font-family:''Fraunces'', Georgia, ''Times New Roman'', serif;font-size:13px;letter-spacing:0\.34em;text-transform:uppercase;color:#16243d;font-weight:600;">Michael&nbsp;J\.&nbsp;Gauthier</span>'

Get-ChildItem -Path $dir -Filter "*.html" | ForEach-Object {
  $content = Get-Content -LiteralPath $_.FullName -Raw
  if ($content -match "MJG_Logo_Black-1\.svg") {
    Write-Host "Skipped $($_.Name), logo already present"
    return
  }

  $updated = [regex]::Replace($content, $pattern, $logoBlock, 1)
  if ($updated -eq $content) {
    $updated = [regex]::Replace($content, $fallbackPattern, $logoBlock, 1)
  }

  if ($updated -eq $content) {
    Write-Host "No header match found in $($_.Name)"
    return
  }

  Set-Content -LiteralPath $_.FullName -Value $updated -NoNewline -Encoding UTF8
  Write-Host "Updated $($_.Name)"
}
