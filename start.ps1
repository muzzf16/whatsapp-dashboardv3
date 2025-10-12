Write-Host "Starting WhatsApp Dashboard Application..."

# Start the backend server in a separate PowerShell job
Write-Host "Starting backend server..."
Start-Process powershell -ArgumentList "-Command", "Set-Location '$(Get-Location)\backend'; npx nodemon src/app.ts"

# Start the frontend in a separate PowerShell job
Write-Host "Starting frontend server..."
Start-Process powershell -ArgumentList "-Command", "Set-Location '$(Get-Location)\frontend'; npm run dev"

Write-Host "Both servers started. Frontend should be available at http://localhost:3000"
Write-Host "Backend API should be available at http://localhost:5000/api"