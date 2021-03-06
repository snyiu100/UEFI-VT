# CHIPSEC: Platform Security Assessment Framework
# Copyright (c) 2017, Intel Security
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; Version 2.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# Authors:
#   Yuriy Bulygin
#   Alex Bazhaniuk
#

# """
# The module can generate a list of EFI executables from (U)EFI firmware file or
# extracted from flash ROM, and then later check firmware image in flash ROM or
# file against this list of [expected/whitelisted] executables

# Usage:
#   ``chipsec_main -m tools.uefi.whitelist [-a generate|check,<json>,<fw_image>]``
#     - ``generate``	Generates a list of EFI executable binaries from the UEFI
#                         firmware image (default)
#     - ``check``		Decodes UEFI firmware image and checks all EFI executable
#                         binaries against a specified list
#     - ``json``		JSON file with configuration of white-listed EFI
#                         executables (default = ``efilist.json``)
#     - ``fw_image``	Full file path to UEFI firmware image. If not specified,
#                         the module will dump firmware image directly from ROM
    
# Examples:

# >>> chipsec_main -m tools.uefi.whitelist

# Creates a list of EFI executable binaries in ``efilist.json`` from the firmware
# image extracted from ROM

# >>> chipsec_main -i -n -m tools.uefi.whitelist -a generate,efilist.json,uefi.rom

# Creates a list of EFI executable binaries in ``efilist.json`` from ``uefi.rom``
# firmware binary 

# >>> chipsec_main -i -n -m tools.uefi.whitelist -a check,efilist.json,uefi.rom

# Decodes ``uefi.rom`` UEFI firmware image binary and checks all EFI executables
# in it against a list defined in ``efilist.json``

# Note: ``-i`` and ``-n`` arguments can be used when specifying firmware file
# because the module doesn't depend on the platform and doesn't need kernel driver
# """
import json

from chipsec.module_common import *

import chipsec.hal.uefi
import chipsec.hal.spi
from chipsec.hal import uefi_common
from chipsec.hal import spi_uefi
from chipsec.hal import uefi_search
import MySQLdb

TAGS = [MTAG_BIOS]

DEF_FWIMAGE_FILE = 'fw.bin'
DEF_EFILIST_FILE = 'efilist.json'

# USAGE_TEXT = '''
# The module can generate a list of EFI executables from (U)EFI firmware file or
# extracted from flash ROM, and then later check firmware image in flash ROM or
# file against this list of [expected/whitelisted] executables

# Usage:

#   chipsec_main -m tools.uefi.whitelist [-a generate|check,<json>,<fw_image>]
#     - generate    Generates a list of EFI executable binaries from the UEFI
#                   firmware image (default)
#     - check       Decodes UEFI firmware image and checks all EFI executable
#                   binaries against a specified list
#     - <json>      JSON file with configuration of white-listed EFI executables
#                   (default = efilist.json)
#     - <fw_image>  Full file path to UEFI firmware image. If not specified, the
#                   module will dump firmware image directly from ROM
   
# Examples:

#   chipsec_main -m tools.uefi.whitelist
#     Creates a list of EFI executable binaries in efilist.json from the firmware
#     image extracted from ROM

#   chipsec_main -i -n -m tools.uefi.whitelist -a generate,efilist.json,uefi.rom
#     Creates a list of EFI executable binaries in efilist.json from uefi.rom
#     firmware binary 

#   chipsec_main -i -n -m tools.uefi.whitelist -a check,efilist.json,uefi.rom
#     Decodes uefi.rom UEFI firmware image binary and checks all EFI executables
#     in it against a list defined in whitelist.json

# Note: -i and -n arguments can be used when specifying firmware file because the
# module doesn't depend on the platform and doesn't need kernel driver
# '''

class whitelist(BaseModule):

    def __init__(self):
        BaseModule.__init__(self)
        self.uefi = chipsec.hal.uefi.UEFI( self.cs )
        self.image = None
        self.efi_list = None
        self.suspect_modules = {}

    def is_supported(self):
        return True

    #
    # callbacks to uefi_search.check_match_criteria
    #
    
    def genlist_callback(self, efi_module):
        md = {}
        if type(efi_module) == spi_uefi.EFI_SECTION:
            if efi_module.MD5:        md["md5"]     = efi_module.MD5
            if efi_module.SHA1:     md["sha1"]    = efi_module.SHA1
            if efi_module.parentGuid: md["guid"]    = efi_module.parentGuid
            if efi_module.SHA256:  md["sha256"]    = efi_module.SHA256
            # if efi_module.ui_string:  md["name"]    = efi_module.ui_string
            if efi_module.Name and efi_module.Name != uefi_common.SECTION_NAMES[uefi_common.EFI_SECTION_PE32]:
                md["type"]   = efi_module.Name
            if efi_module.ui_string == None:   efi_module.ui_string = "<no_name>"
            # below is the identifier
            self.efi_list["name: %s" % efi_module.ui_string] = md

            moduleMD5 = efi_module.MD5
            moduleSHA1 = efi_module.SHA1
            moduleSHA256 = efi_module.SHA256
            moduleGUID = efi_module.parentGuid
            moduleName = efi_module.ui_string

            self.save_to_database(moduleGUID, moduleMD5, moduleName, moduleSHA1, moduleSHA256, analysisID)
        else: pass

    
    def save_to_database(self, moduleGUID, moduleMD5, moduleName, moduleSHA1, moduleSHA256, analysisID):

        #cursor.execute("""INSERT INTO module(moduleName,moduleGUID,moduleMD5,moduleSHA1,moduleSHA256,moduleUploadID) VALUES(%s, %s, %s, %s, %s, %s)""",(moduleName,moduleGUID,moduleMD5,moduleSHA1,moduleSHA256,analysisID))
        cursor.execute("""INSERT IGNORE INTO module SET moduleName = %s,moduleGUID = %s,moduleMD5 = %s,moduleSHA1 = %s,moduleSHA256 = %s,moduleUploadID = %s""",(moduleName,moduleGUID,moduleMD5,moduleSHA1,moduleSHA256,analysisID))
        db.commit()

        return None

    #
    # Generates new white-list of EFI executable binaries
    #
    def generate_efilist( self, json_pth ,analysisID):
        self.efi_list = {}
        #self.logger.log( "[*] generating a list of EFI executables from firmware image..." )
        efi_tree = spi_uefi.build_efi_model(self.uefi, self.image, None)
        matching_modules = spi_uefi.search_efi_tree(efi_tree, self.genlist_callback, spi_uefi.EFIModuleType.SECTION_EXE, True)
        #self.logger.log( "[*] creating JSON file '%s'..." % json_pth )
        # chipsec.file.write_file( "%s" % json_pth, json.dumps(self.efi_list, indent=2, sort_keys=True,separators=(',', ': ')) )
        
        ## for printing results; either direct to file or as cmd output
        # self.logger.log( "Found %d EFI executables" % len(self.efi_list) )
        # self.logger.log( "%s" %  json.dumps(self.efi_list, indent=2, sort_keys=True, separators=(',', ': ')))
        
        f = open('C:\Users\User\Desktop\UEFI-VT\UEFI-VT\public\\analysis\\temp.txt','a')
        f.write( "Found %d EFI executables \n\n" % len(self.efi_list) )
        f.write('%s' % json.dumps(self.efi_list, indent=2, sort_keys=True, separators=(',', ': ') ))
        f.close()

        return ModuleResult.PASSED

    #
    # Checks EFI executable binaries against white-list
    #
    def check_whitelist( self, json_pth ):
        self.efi_list = {}
        with open(json_pth) as data_file:    
            self.efi_whitelist = json.load(data_file)

        #self.logger.log( "[*] checking EFI executables against the list '%s'" % json_pth )

        # parse the UEFI firmware image and look for EFI modules matching white-list
        # - match only executable EFI sections (PE/COFF, TE)
        # - find all occurrences of matching EFI modules
        efi_tree = spi_uefi.build_efi_model(self.uefi, self.image, None)
        matching_modules = spi_uefi.search_efi_tree(efi_tree, self.genlist_callback, spi_uefi.EFIModuleType.SECTION_EXE, True)
        self.logger.log( "[*] found %d EFI executables in UEFI firmware image '%s'" % (len(self.efi_list),self.image_file) )

        for m in self.efi_list:
            if not (m in self.efi_whitelist):
                self.suspect_modules[m] = self.efi_list[m]
                guid = self.efi_list[m]["guid"] if 'guid' in self.efi_list[m] else '?'
                name = self.efi_list[m]["name"] if 'name' in self.efi_list[m] else '<unknown>'
                sha1 = self.efi_list[m]["sha1"] if 'sha1' in self.efi_list[m] else ''
                self.logger.log_important( "found EFI executable not in the list:\n    %s (sha256)\n    %s (sha1)\n    {%s}\n    %s" % (m,sha1,guid,name))

        if len(self.suspect_modules) > 0:
            self.logger.log_warn_check( "found %d EFI executables not in the list '%s'" % (len(self.suspect_modules),json_pth) )
            return ModuleResult.WARNING
        else:
            self.logger.log_passed_check( "all EFI executables match the list '%s'" % json_pth )
            return ModuleResult.PASSED


    # def usage(self):
    #     self.logger.log( USAGE_TEXT )


    # --------------------------------------------------------------------------
    # run( module_argv )
    # Required function: run here all tests from this module
    # --------------------------------------------------------------------------
    def run( self, module_argv ):
        #self.logger.start_test("simple white-list generation/checking for (U)EFI firmware")

        self.res = ModuleResult.SKIPPED

        global db
        global cursor

        db = MySQLdb.connect("localhost","root","p@ssw0rd","uefivt")
        cursor=db.cursor()

        op = module_argv[0] if len(module_argv) > 0 else 'generate'

        if op in ['generate','check']:

            if len(module_argv) > 1:
                json_file  = module_argv[1]
                image_file = module_argv[2]

                global analysisID
                analysisID = module_argv[3]
                #self.logger.log("[*] reading firmware from '%s'..." % image_file)
            else:
                image_file = DEF_FWIMAGE_FILE
                json_file  = DEF_EFILIST_FILE
                self.spi = chipsec.hal.spi.SPI(self.cs)
                (base,limit,freg) = self.spi.get_SPI_region(chipsec.hal.spi.BIOS)
                image_size = limit + 1 - base
                self.logger.log("[*] dumping firmware image from ROM to '%s': 0x%08X bytes at [0x%08X:0x%08X]" % (image_file,image_size,base,limit))
                self.spi.read_spi_to_file(base, image_size, image_file)

            self.image_file = image_file
            self.image = chipsec.file.read_file(image_file)
            json_pth = os.path.abspath(json_file)

            if op == 'generate':
                if os.path.exists(json_pth):
                    self.logger.error("JSON file '%s' already exists. Exiting..." % json_file)
                    self.res = ModuleResult.ERROR
                else:
                    self.res = self.generate_efilist(json_pth, analysisID)
            elif op == 'check':
                if not os.path.exists(json_pth):
                    self.logger.error("JSON file '%s' doesn't exists. Exiting..." % json_file)
                    self.res = ModuleResult.ERROR
                else:
                    self.res = self.check_whitelist(json_pth)

        elif op == 'help':
            self.logger.log('')
            #self.usage()
        else:
            self.logger.error("unrecognized command-line argument to the module")
            #self.usage()

        return self.res
