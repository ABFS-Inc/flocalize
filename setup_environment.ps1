function Get-CondaPath {
    $condaCmd = Get-Command conda -ErrorAction SilentlyContinue
    if ($condaCmd) { 
        Write-Host "Found conda in PATH: $($condaCmd.Source)" -ForegroundColor Green
        return $condaCmd.Source 
    }
    
    $condaPaths = @(
        "$env:USERPROFILE\miniconda3\Scripts\conda.exe",
        "$env:LOCALAPPDATA\miniconda3\Scripts\conda.exe",
        "C:\miniconda3\Scripts\conda.exe",
        "C:\ProgramData\miniconda3\Scripts\conda.exe",
        "$env:PROGRAMFILES\miniconda3\Scripts\conda.exe"
    )
    
    foreach ($path in $condaPaths) {
        if (Test-Path $path) { 
            Write-Host "Found conda at: $path" -ForegroundColor Green
            $condaDir = Split-Path $path
            $env:PATH = "$condaDir;$env:PATH"
            return $path 
        }
    }
    
    Write-Host "Conda not found. Installing Miniconda..." -ForegroundColor Yellow
    try {
        $installerUrl = "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe"
        $installerPath = "$env:TEMP\Miniconda3-latest-Windows-x86_64.exe"
        $installDir = "$env:USERPROFILE\miniconda3"  
        
        if (Test-Path $installDir) {
            Write-Host "Removing existing Miniconda installation..." -ForegroundColor Yellow
            Remove-Item $installDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        Write-Host "Downloading Miniconda installer..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
        
        if (-not (Test-Path $installerPath)) {
            throw "Failed to download Miniconda installer"
        }
        
        Write-Host "Downloaded installer: $(Get-Item $installerPath | Select-Object Name, Length)" -ForegroundColor Green
        
        Write-Host "Installing Miniconda to $installDir..." -ForegroundColor Yellow
        $process = Start-Process -FilePath $installerPath -ArgumentList "/S", "/InstallationType=JustMe", "/RegisterPython=0", "/AddToPath=0", "/D=$installDir" -Wait -PassThru
        
        if ($process.ExitCode -ne 0) {
            throw "Miniconda installer failed with exit code $($process.ExitCode)"
        }
        
        Start-Sleep -Seconds 5
        
        $newCondaPath = "$installDir\Scripts\conda.exe"
        $maxWaitTime = 60
        $waitInterval = 2
        $elapsed = 0
        
        while (-not (Test-Path $newCondaPath) -and $elapsed -lt $maxWaitTime) {
            Write-Host "Waiting for conda installation to complete... ($elapsed/$maxWaitTime seconds)" -ForegroundColor Yellow
            Start-Sleep -Seconds $waitInterval
            $elapsed += $waitInterval
        }
        
        if (Test-Path $newCondaPath) {
            Write-Host "Miniconda installed successfully at: $newCondaPath" -ForegroundColor Green
            $env:PATH = "$installDir\Scripts;$installDir;$env:PATH"
            
            try {
                $condaVersion = & $newCondaPath --version
                Write-Host "Conda version: $condaVersion" -ForegroundColor Green
                return $newCondaPath
            } catch {
                throw "Conda installed but not working properly: $_"
            }
        } else {
            throw "Conda installation failed - executable not found after $maxWaitTime seconds"
        }
    } catch {
        Write-Host "Failed to install Miniconda: $_" -ForegroundColor Red
        throw "Conda installation failed"
    } finally {
        if (Test-Path $installerPath) {
            Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Setting up Flocalize environment..." -ForegroundColor Cyan

try {
    $condaExe = Get-CondaPath
} catch {
    Write-Host "Cannot proceed without conda: $_" -ForegroundColor Red
    exit 1
}

$step1Success = $false
try {
    Write-Host "Creating conda environment..." -ForegroundColor Yellow
    
    Write-Host "Removing existing environment if it exists..." -ForegroundColor Cyan
    & $condaExe env remove -n flocalize_env -y 2>$null
    
    Write-Host "Creating fresh conda environment with Python 3.12.9..." -ForegroundColor Cyan
    & $condaExe create -n flocalize_env python=3.12.9 -c conda-forge -y
    
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "Standard environment creation failed, trying with minimal packages..." -ForegroundColor Yellow
        
        & $condaExe create -n flocalize_env python=3.12.9 -y --no-deps
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Environment creation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        } else {
            Write-Host "Created minimal conda environment with Python 3.12.9" -ForegroundColor Green
            $step1Success = $true
        }
    } else {
        Write-Host "Created conda environment with Python 3.12.9" -ForegroundColor Green
        $step1Success = $true
    }
} catch {
    Write-Host "Failed to create conda environment: $_" -ForegroundColor Red
}

$step2Success = $false
if ($step1Success) {
    try {
        Write-Host "Installing uv package manager..." -ForegroundColor Yellow
        & $condaExe install -n flocalize_env -c conda-forge uv -y
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "uv installation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        } else {
            Write-Host "Installed latest uv package manager" -ForegroundColor Green
            $step2Success = $true
        }
    } catch {
        Write-Host "Failed to install uv: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping uv installation due to previous failures" -ForegroundColor Yellow
}

$step3Success = $false
if ($step2Success) {
    try {
        Write-Host "Installing AI packages..." -ForegroundColor Yellow
        
        Write-Host "Running: conda run -n flocalize_env uv pip install google-genai==1.30.0 anthropic==0.64.0 xai-sdk==1.0.1 python-dotenv==1.1.1" -ForegroundColor Cyan
        
        & $condaExe run -n flocalize_env uv pip install google-genai==1.30.0 anthropic==0.64.0 xai-sdk==1.0.1 python-dotenv==1.1.1
        
        if ($LASTEXITCODE -eq 0) { 
            Write-Host "Installed AI packages successfully" -ForegroundColor Green
            $step3Success = $true
        } else {
            Write-Host "AI packages installation failed with exit code $LASTEXITCODE" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "Failed to install AI packages: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping AI packages installation due to previous failures" -ForegroundColor Yellow
}

if ($step1Success -and $step2Success -and $step3Success) {
    Write-Host "Environment setup complete!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Environment setup completed with errors!" -ForegroundColor Red
    Write-Host "Step 1 (Conda env): $step1Success" -ForegroundColor $(if ($step1Success) { "Green" } else { "Red" })
    Write-Host "Step 2 (UV install): $step2Success" -ForegroundColor $(if ($step2Success) { "Green" } else { "Red" })
    Write-Host "Step 3 (AI packages): $step3Success" -ForegroundColor $(if ($step3Success) { "Green" } else { "Red" })
    exit 1
}
