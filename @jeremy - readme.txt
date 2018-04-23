Unzip the 2 folders, efi-stuff-master and strawberry-perl-5.24.3.1-64bit-portable

>>Sample syntax: perl nvar-dump.pl sample2\nvar-mod.vars

The project only works on the files that is a dump of the nvar section.

To run the script, go to the Strawberry-Perl folder and run portableshell.bat. You can then cd to the perl project and run the above command.

In the sample folders, the files are taken from a nvram dump using the uefi-firmware-parser tool. nvar.var is the original file, and nvar-mod.vars is the modified dump after removing StdDefaults.

nvar-dump.pl is the modified script, whereas nvar-dump-original.pl is the original perl script.