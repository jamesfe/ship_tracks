#!/bin/bash
#for i in `seq 1 365`;
#do
#	printf $i" "
#	node ./node_render.js $i
#done

# Make it
convert -delay 10 -loop 0 ../output/2013/*.png $(date +%s).gif
convert -delay 15 -loop 0 ../output/2013/*.png $(date +%s).gif
convert -delay 20 -loop 0 ../output/2013/*.png $(date +%s).gif
# http://www.imagemagick.org/discourse-server/viewtopic.php?t=28672
