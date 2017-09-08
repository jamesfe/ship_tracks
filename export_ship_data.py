# -*- coding: utf-8 -*-

import fiona
import json


def print_with_delim(delim=''):
    with fiona.open('./data/EastCoastVesselTracklines2011.gdb/', 'r') as infile:
        for k in infile.items():
            print(json.dumps(k[1]) + delim)


def export_as_one_json():
    print('[\n')
    print_with_delim(',')
    print(']')


def main():
    print_with_delim()


main()
