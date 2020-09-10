$env:NODE_ENV = 'development'

yarn.cmd build:win

concurrently.ps1 "tsc -w -p src" "nodemon --inspect --config .\nodemon.json"