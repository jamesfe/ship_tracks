
import json

from dateutil import parser


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
        jday = start.timetuple().tm_yday
        try:
            if lines_written[jday] == 0:
                julian_files[jday].write(line.strip())
            else:
                julian_files[jday].write(',\n' + line.strip())
            lines_written[jday] += 1
        except:
            print('Failed on index: ', jday)

for item in julian_files:
    item.write(']')
    item.close()


for index, item in enumerate(lines_written):
    print('{} {}'.format(index, item))
