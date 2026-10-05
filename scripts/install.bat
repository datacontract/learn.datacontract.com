@echo off
rem Installs the Data Contract CLI, the Data Product CLI, and the Entropy Data CLI (Windows variant of install.sh).
rem Works in cmd and PowerShell. Keep the pinned versions in sync with install.sh and install.ps1.
uv tool install --force --python python3.11 "datacontract-cli[all]==1.2.3"
uv tool install --force --python python3.11 "dataproduct-cli==0.3.1"
uv tool install "entropy-data==0.3.24"
uv tool update-shell
datacontract --version
dataproduct --version
entropy-data --version
rem If 'datacontract', 'dataproduct', or 'entropy-data' is not recognized, open a new terminal and try again.
rem pre-pull the workshop database image (needs Docker running; keep in sync with docker-compose.yml)
docker pull postgres:17
