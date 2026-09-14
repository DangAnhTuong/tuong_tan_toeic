$targetZip = 'A:\frontend\tuong_tan_toeic\deploy_patch.zip'
if (Test-Path $targetZip) { Remove-Item $targetZip -Force }

$tempDir = 'A:\frontend\tuong_tan_toeic\patch_bundle'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

New-Item -ItemType Directory -Path "$tempDir\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\frontend\dist" -Force | Out-Null

# 1. Full Backend src (models, controllers, routes, utils, app, server, etc.)
Copy-Item 'A:\frontend\tuong_tan_toeic\backend\src' -Destination "$tempDir\backend\src" -Recurse

# 2. Frontend Production Dist (assets, index.html, sw.js, manifest.json, favicons, excluding heavy videos already on VPS)
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\index.html' -Destination "$tempDir\frontend\dist\index.html"
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\sw.js' -Destination "$tempDir\frontend\dist\sw.js"
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\manifest.json' -Destination "$tempDir\frontend\dist\manifest.json"
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\robots.txt' -Destination "$tempDir\frontend\dist\robots.txt" -ErrorAction SilentlyContinue
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\sitemap.xml' -Destination "$tempDir\frontend\dist\sitemap.xml" -ErrorAction SilentlyContinue
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\favicon.ico' -Destination "$tempDir\frontend\dist\favicon.ico" -ErrorAction SilentlyContinue
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\favicon.svg' -Destination "$tempDir\frontend\dist\favicon.svg" -ErrorAction SilentlyContinue
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\og-banner.jpg' -Destination "$tempDir\frontend\dist\og-banner.jpg" -ErrorAction SilentlyContinue
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist\assets' -Destination "$tempDir\frontend\dist\assets" -Recurse

Set-Location -Path $tempDir
tar -a -cf "$targetZip" backend frontend
Set-Location -Path 'A:\frontend\tuong_tan_toeic'

Remove-Item $tempDir -Recurse -Force

Write-Host "Created deploy_patch.zip successfully:"
Get-Item $targetZip | Select-Object Name, Length, LastWriteTime

