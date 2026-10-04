#!/bin/bash
# Keep the pinned versions in sync with install.bat and install.ps1 (the Windows variants).
uv tool install --force --python python3.11 'datacontract-cli[all]==1.2.2'
uv tool install --force --python python3.11 'dataproduct-cli==0.2.0'
uv tool install 'entropy-data==0.3.13'
uv tool update-shell
which datacontract
datacontract --version
which dataproduct
dataproduct --version
which entropy-data
entropy-data --version
# pre-pull the workshop database image (needs Docker running; keep in sync with docker-compose.yml)
docker pull postgres:17
