copy /Y ..\sys\amd64\chipsec_hlpr.sys 
SignTool sign /s ChipsecCertStore  /a /t http://timestamp.verisign.com/scripts/timestamp.dll   chipsec_hlpr.sys

