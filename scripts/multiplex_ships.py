"""
A quick script that will multiplex lines from an input file into a number of output files.
For example here, we see the start and end time for a ship: we want to put each segment into the day-of-year file
for which it belongs.  So if a voyage lasts three days, the whole segment goes to all three days.  Luckily, most
voyages are broken up into one day segments (avg length 21 hrs.)
"""


import json

from dateutil import parser


def strip_line(line):
    try:
        data = json.loads(line)
        del data['properties']
    except:
        print('did not work')
    return json.dumps(data).strip()


def return_good_path(val):
    return './data/2011daily/{}.json'.format(val)


julian_files = [open(return_good_path('misc'), 'w')]

for k in range(1, 366):
    julian_files.append(open(return_good_path(k), 'w'))
    julian_files[k].write('[\n')

lines_written = [0] * len(julian_files)

with open('./data/ship_lines_2011.json', 'r') as infile:
    for line in infile:
        data = json.loads(line)
        prop = data['properties']
        start = parser.parse(prop['trackStartTime'])
        end = parser.parse(prop['trackEndTime'])
        start_day = start.timetuple().tm_yday
        end_day = end.timetuple().tm_yday
        for jday in range(start_day, end_day + 1):
            try:
                if lines_written[jday] == 0:
                    # julian_files[jday].write(line.strip())
                    julian_files[jday].write(strip_line(line))
                else:
                    #julian_files[jday].write(',\n' + line.strip())
                    julian_files[jday].write(',\n' + strip_line(line))
                lines_written[jday] += 1
            except:
                print('Failed on index: ', jday)

for item in julian_files:
    item.write(']')
    item.close()


for index, item in enumerate(lines_written):
    print('{} {}'.format(index, item))
