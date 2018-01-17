# UEFI-VT
A VirusTotal-esque UEFI analysis tool

# Progress
Weekly Goal (last updated 7/12/17):
- Research on UEFI blacklist & whitelist and how to retrieve them
- Development of web interface

Tasks Done (last updated 02/01/18):
- Bare bones of environment [W1,2]
- Tested chipsec [W1,2]
- General DB structure (https://tinyurl.com/uefivtdb) [W2] - updated 29/12
- General upload function [W2]
- Completion of UI [W2]
    - Able to upload files
    - Able to read & print the uploaded file
        - Tested only with .txt files
        - Updated to upload with .rom files [W5]
            - Need to work on only allowing .rom uploads
- Upload function tested and working [W3]
    - Future work:
        - Reworking of printing function, newlines not registering
- Created App flow document (https://tinyurl.com/uefivtappflow) [W4]
- Created Documentation (preliminary) (https://tinyurl.com/uefivtdoc) [W4]
- Added download function [W5]
- Created Future Work document (https://tinyurl.com/uefivtfuture) [W8]

Future Tasks:
- analyse chipsec results (found in /misc)
- save files & data into DB
- print analysed results
- download results

# Notes 
Last updated 15/12/17
- Analysis results to show:
    - Blacklisted (if any)
    - Unidentified (if any)
- MySQL to be used
- Analysis results are located in /misc
- Progress on analysis will be updated in the analysisProgress file in /misc