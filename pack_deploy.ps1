$targetZip = 'A:\frontend\tuong_tan_toeic\deploy_package.zip'
if (Test-Path $targetZip) { Remove-Item $targetZip -Force }

$tempDir = 'A:\frontend\tuong_tan_toeic\temp_deploy'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

New-Item -ItemType Directory -Path "$tempDir\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\frontend" -Force | Out-Null

Copy-Item 'A:\frontend\tuong_tan_toeic\backend\src' -Destination "$tempDir\backend\src" -Recurse
Copy-Item 'A:\frontend\tuong_tan_toeic\backend\scripts' -Destination "$tempDir\backend\scripts" -Recurse
Copy-Item 'A:\frontend\tuong_tan_toeic\backend\package.json' -Destination "$tempDir\backend\package.json"
Copy-Item 'A:\frontend\tuong_tan_toeic\backend\ecosystem.config.js' -Destination "$tempDir\backend\ecosystem.config.js"
Copy-Item 'A:\frontend\tuong_tan_toeic\frontend\dist' -Destination "$tempDir\frontend\dist" -Recurse

Compress-Archive -Path "$tempDir\*" -DestinationPath $targetZip
Remove-Item $tempDir -Recurse -Force

Write-Host "Created deploy_package.zip:"
Get-Item $targetZip | Select-Object Name, Length, LastWriteTime
