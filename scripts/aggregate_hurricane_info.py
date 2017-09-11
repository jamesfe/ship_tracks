# -*- coding: utf-8 -*-

import json
import os


def try_int_or(val):
    try:
        return int(val)
    except ValueError:
        return -1


def try_float_or(val):
    try:
        return float(val)
    except ValueError:
        return -1


def parse_date(dval):
    d = dval.split('/')
    day = int(d[1])
    month = int(d[0])
    return {
        'day': day,
        'month': month
    }


def load_hurricane_file(tgt):
    cline = -1
    name = ""
    ret_vals = []
    with open(tgt, 'r') as infile:
        for line in infile:
            cline += 1
            if cline == 0:
                continue
            if cline == 1:
                name = line.strip()
            if cline == 2:
                continue
            if cline > 2:
                line = line.replace('  ', ' ')
                line = line.replace('  ', ' ')
                line = line.replace('  ', ' ')
                data = line.strip().split(' ')
                dobj = {}
                dobj['name'] = name
                dobj['lat'] = try_float_or(data[1])
                dobj['lon'] = try_float_or(data[2])
                dobj.update(parse_date(data[3]))
                dobj['speed'] = try_int_or(data[4])

                ret_vals.append(dobj)
    return ret_vals


def make_into_geojson(item):
    ret_vals = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [item['lon'], item['lat']]
        },
        "properties": {
            "name": item['name'],
            "day": item['day'],
            "month": item['month'],
            "windspeed": item['speed']
        }
    }
    return ret_vals


def main():
    hdir = './data/hurricanes/'
    thing = {
        "features": [],
        "geocoding": {
            "creation_date": "2016-10-12",
            "generator": {
                "author": {
                    "name": "Mapzen"
                },
                "package": "fences-builder",
                "version": "0.1.2"
            },
            "license": "ODbL (see http://www.openstreetmap.org/copyright)"
        },
        "type": "FeatureCollection"
    }
    for f in os.listdir(hdir):
        i = load_hurricane_file(os.path.join(hdir, f))
        for item in i:
            thing['features'].append(make_into_geojson(item))
    print(json.dumps(thing))


main()
