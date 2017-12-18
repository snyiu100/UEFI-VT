# UEFI-VT
A VirusTotal-esque UEFI analysis tool

# Progress
Weekly Goal (last updated 7/12/17):
- Research on UEFI blacklist & whitelist and how to retrieve them
- Development of web interface

Tasks Done (last updated 18/12/17):
- Bare bones of environment [W1,2]
- Tested chipsec [W1,2]
- General DB structure (https://tinyurl.com/uefivtdb) [W2] - updated 18/12
- General upload function [W2]
- Completion of UI [W2]
    - Able to upload files
    - Able to read & print the uploaded file
        - Tested only with .txt files
    - Future work:
        - Add download file function
        - Ensure newlines are detected and printed
        - Change logic to upload .rom file and print .txt analysis file
- Upload function tested and working [W3]
    - Future work:
        - Reworking of printing function, newlines not registering
- Created App flow document (https://tinyurl.com/uefivtappflow) [W4]
- Created Documentation (preliminary) (https://tinyurl.com/uefivtdoc) [W4]

Future Tasks:
- analyse chipsec results (found in /misc)
- test uefi-firmware
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