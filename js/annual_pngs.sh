#!/bin/bash

# For start, step, finish (1,7,100) gets us the same day of every week till day 100
for i in `seq 1 7 100`;
do
	printf $i" "
	node ./node_render.js $i
done

# Make it into a GIF
convert -delay 10 -loop 0 ../output/2013/*.png $(date +%s).gif
convert -delay 15 -loop 0 ../output/2013/*.png $(date +%s).gif
convert -delay 20 -loop 0 ../output/2013/*.png $(date +%s).gif
# http://www.imagemagick.org/discourse-server/viewtopic.php?t=28672

mv *.gif ./gifs/

