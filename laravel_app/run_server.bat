@echo off
echo ========================================================
echo Starting KnowledgeBot PHP + MySQL Application
echo Backend Server: http://127.0.0.1:8080
echo Chat Widget UI (Image 1): http://127.0.0.1:8080/
echo Admin Console UI (Image 2): http://127.0.0.1:8080/admin
echo ========================================================
"C:\xampp\php\php.exe" -S 127.0.0.1:8080 -t public
pause
