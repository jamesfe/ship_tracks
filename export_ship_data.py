# -*- coding: utf-8 -*-

import fiona
import json

print('[\n')
with fiona.open('./data/EastCoastVesselTracklines2011.gdb/', 'r') as infile:
    for k in infile.items():
        print(json.dumps(k[1]) + ', ')
print('\n]')
