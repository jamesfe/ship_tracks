# ship_tracks

A program to make pretty gifs of ship tracks from AIS geojson data.


## Rendering an individual frame

1. Make the output directory
2. Ensure you have a country file located somewhere (if you are drawing countries)
3. If hurricanes are turned on, make sure you have a hurricane file (even if empty)
4. (IMPORTANT) put the data in the daily directory
5. (MANDATORY) Set the year for which you are targeting
6. (OPTIONAL) Change any viewport settings
7. NPM Install?

```
# node render_frame.js <day_of_year>
node render_frame.js 275
```

## Running the whole year of data

1. Make sure you have the individual steps done
2. Run the annual script
