# -*- coding: utf-8 -*-

import fiona
import json


def print_with_delim(delim=''):
    tgt = './data/EastCoastVesselTracklines2013/EastCoastVesselTracklines2013.gdb/'
    #with fiona.open('./data/EastCoastVesselTracklines2011.gdb/', 'r') as infile:
    with fiona.open(tgt, 'r') as infile:
        for k in infile.items():
            print(json.dumps(k[1]) + delim)


def export_as_one_json():
    print('[\n')
    print_with_delim(',')
    print(']')


def main():
    print_with_delim()


main()
