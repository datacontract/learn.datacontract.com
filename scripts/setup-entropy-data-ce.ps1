# Bootstraps the local Entropy Data (Community Edition) instance (PowerShell variant
# of setup-entropy-data-ce.sh - keep the two in sync):
# creates the user account, the organization, and an organization API key,
# and writes ENTROPY_DATA_API_KEY / ENTROPY_DATA_HOST into .env.
#
# Start the instance first: docker compose -f entropy-data-ce/docker-compose.yaml up -d
# Configuration comes from .env (see .env.example): ENTROPY_DATA_CE_EMAIL,
# ENTROPY_DATA_CE_PASSWORD, ENTROPY_DATA_CE_ORGANIZATION.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

if (Test-Path .env) {
    foreach ($line in Get-Content .env) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].TrimEnd())
        }
    }
}
$BaseUrl      = if ($env:ENTROPY_DATA_CE_HOST)         { $env:ENTROPY_DATA_CE_HOST }         else { 'http://localhost:8081' }
$Email        = if ($env:ENTROPY_DATA_CE_EMAIL)        { $env:ENTROPY_DATA_CE_EMAIL }        else { 'workshop@example.com' }
$Password     = if ($env:ENTROPY_DATA_CE_PASSWORD)     { $env:ENTROPY_DATA_CE_PASSWORD }     else { 'workshop' }
$Organization = if ($env:ENTROPY_DATA_CE_ORGANIZATION) { $env:ENTROPY_DATA_CE_ORGANIZATION } else { 'workshop' }

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Get-Csrf([string]$Html) {
    if ($Html -match 'name="_csrf" value="([^"]*)"') { return $Matches[1] }
    throw 'Could not find the CSRF token'
}

Write-Host "Creating account $Email ..."
$page = Invoke-WebRequest -UseBasicParsing -WebSession $Session "$BaseUrl/create-account"
Invoke-WebRequest -UseBasicParsing -WebSession $Session -Method Post "$BaseUrl/create-account" -Body @{
    _csrf = Get-Csrf $page.Content; ref = ''; fullName = 'Workshop'
    email = $Email; password = $Password; termsAccepted = 'v1'; _termsAccepted = 'on'
} | Out-Null

Write-Host 'Logging in ...'
$page = Invoke-WebRequest -UseBasicParsing -WebSession $Session "$BaseUrl/login"
Invoke-WebRequest -UseBasicParsing -WebSession $Session -Method Post "$BaseUrl/login" -Body @{
    _csrf = Get-Csrf $page.Content; username = $Email; password = $Password
} | Out-Null

$orgExists = $true
try { Invoke-WebRequest -UseBasicParsing -WebSession $Session "$BaseUrl/$Organization" | Out-Null }
catch { $orgExists = $false }
if ($orgExists) {
    Write-Host "Organization $Organization already exists."
} else {
    Write-Host "Creating organization $Organization ..."
    $page = Invoke-WebRequest -UseBasicParsing -WebSession $Session "$BaseUrl/welcome"
    Invoke-WebRequest -UseBasicParsing -WebSession $Session -Method Post "$BaseUrl/organizations/save" -Body @{
        _csrf = Get-Csrf $page.Content; host = $BaseUrl
        fullName = $Organization; vanityUrl = $Organization
    } | Out-Null
    try { Invoke-WebRequest -UseBasicParsing -WebSession $Session "$BaseUrl/$Organization" | Out-Null }
    catch { throw "ERROR: could not create organization '$Organization' (vanity URL reserved or taken?)" }
}

Write-Host 'Creating organization API key ...'
$page = Invoke-WebRequest -UseBasicParsing -WebSession $Session "$BaseUrl/$Organization/settings/api-keys/add"
$page = Invoke-WebRequest -UseBasicParsing -WebSession $Session -Method Post "$BaseUrl/$Organization/settings/api-keys/save" -Body @{
    _csrf = Get-Csrf $page.Content; displayName = 'workshop-cli'; scope = 'organization'
}
if ($page.Content -match 'ed_[A-Za-z0-9_-]{20,}') { $ApiKey = $Matches[0] }
else { throw 'ERROR: could not extract the API key' }

Write-Host 'Writing ENTROPY_DATA_API_KEY and ENTROPY_DATA_HOST to .env ...'
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
$lines = @(Get-Content .env | Where-Object { $_ -notmatch '^(ENTROPY_DATA_API_KEY|ENTROPY_DATA_HOST)=' })
$lines += "ENTROPY_DATA_API_KEY=$ApiKey", "ENTROPY_DATA_HOST=$BaseUrl"
# write with LF endings so the .env also works when sourced from Git Bash
[IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), ($lines -join "`n") + "`n")

Write-Host ''
Write-Host "Done. Log in at $BaseUrl with $Email / $Password (organization: $Organization)"
Write-Host 'Verify the CLI connection with: entropy-data connection test'
