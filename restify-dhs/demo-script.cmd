REM
REM Get configuration information
REM

curl --insecure https://localhost:9001/config

REM
REM Get a link to the user consent login page
REM

curl --insecure https://localhost:9001/authurl

REM
REM Get redirected to the user consent login page
REM

curl --insecure --verbose https://localhost:9001/auth

REM
REM Get an application auth token
REM

curl --insecure --header "Content-Type: application/json" --data "{\"scope\":\"E911\"}" https://localhost:9001/token

REM
REM Create an E911 ID
REM

curl --insecure --header "Content-Type: application/json" --data "{\"token\":\"your-application-auth-token-here\",\"address\":{\"first_name\":\"Bruce\",\"last_name\":\"Williams\",\"house_number\":\"6385\",\"street\":\"Conleth\",\"street_suffix\":\"Circle\",\"city\":\"Dublin\",\"state\":\"OH\",\"zip\":\"43017\"}}" https://localhost:9001/e911id
