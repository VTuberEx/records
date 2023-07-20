@echo off

chcp 65001
@REM set ELECTRON_NO_ATTACH_CONSOLE=true
set ELECTRON_ENABLE_LOGGING=false
A:\test\ELECTRON\electron.exe --trace-warnings --unhandled-rejections=strict "./app/main"
