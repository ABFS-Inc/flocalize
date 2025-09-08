# Enhanced error handling and execution policy
$ErrorActionPreference = "Stop"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

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

# Get conda path
$condaExe = Get-CondaPath

# Create environment
Write-Host "Creating conda environment with Python 3.12.9..." -ForegroundColor Yellow
& $condaExe env remove -n flocalize_env -y
& $condaExe create -n flocalize_env python=3.12.9 -c conda-forge -y

# Activate the environment and install packages
Write-Host "Activating environment and installing packages from requirements.txt using UV..." -ForegroundColor Yellow
& $condaExe activate flocalize_env

# Install uv
Write-Host "Installing uv package manager..." -ForegroundColor Yellow
& $condaExe install -n flocalize_env -c conda-forge uv -y

# Install packages using UV with error handling
Write-Host "Installing packages from requirements.txt using UV..." -ForegroundColor Yellow
try {
    & $condaExe run -n flocalize_env uv pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        throw "UV installation failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "Error installing packages with UV: $_" -ForegroundColor Red
    Write-Host "UV installation failed. Check the error message above." -ForegroundColor Red
    exit 1
}

Write-Host "Environment setup complete!" -ForegroundColor Green
