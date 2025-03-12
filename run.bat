@echo off
setlocal enabledelayedexpansion

echo Setting environment variables from .env file...
for /F "tokens=*" %%A in (.env) do (
    set line=%%A
    if not "!line:~0,1!"=="#" (
        for /F "tokens=1,2 delims==" %%B in ("!line!") do (
            if not "%%C"=="" (
                set %%B=%%C
                echo Set %%B
            )
        )
    )
)

echo Running backend application...
cd backend
mvnw.cmd spring-boot:run

endlocal 