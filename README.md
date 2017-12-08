# UEFI-VT
A VirusTotal-esque UEFI analysis tool

# Progress
Weekly Goal (last updated 7/12/17):
- Research on UEFI blacklist & whitelist and how to retrieve them
- Development of web interface

Tasks Done (last updated 8/12/17):
- Bare bones of environment [W1,2]
- Tested chipsec [W1,2]
- General DB structure (https://tinyurl.com/uefivtdb) [W2]
- General upload function [W2]
- Completed upload function, works well [W2]
    - Able to upload files (tested with .txt files)
    - Able to read the uploaded file
    - WIP: CSS Styling of page

Future Tasks:
- analyse chipsec results (found in /misc)
- test uefi-firmware
- save files & data into DB
- print analysed results
- download results

# Notes
-  Analysis results to show:
    - Blacklisted (if any)
    - Unidentified (if any)
- MongoDB to be used

Last updated: 8/12/17