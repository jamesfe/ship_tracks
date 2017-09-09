#!/bin/bash
for i in `seq 1 365`;
do
	echo $i
	node ./src/node_render.js $i
done

# Make it
# convert -delay 10 -loop 0 ./output/*.png animated.gif
