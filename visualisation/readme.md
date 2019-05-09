# Visualization

This section helps with visualization tasks.

## Requirements
Mozilla Firefox is needed is so that the program can pick up the output file. Avoid running in incognito mode as local storage is used for optimization. Cross-origin requests plugin is required.

## Important

Make sure the output data for the files are present in any subdirectory of the HTML code. For example, create an output folder in the same directory as the folder and add all output files. This is due to Cross-origin request problem. 

## Data
Download the output data from dumbo and save it in any folder

## Visualising Analytic 1

For the first analytic we use the output generated by checkin.py which shows the average number of check-ins per hour per day at a particular place.

Be sure to change the path in the checkin.js file on line 34

```javascript
url: "file:///<PATH_TO_YOUR_CSV>"
```

Now open the checkin.html file for the interactive output visualization

A screenshot of output given in the screenshot folder


## Visualising Analytic 2

The word cloud feature analysis shows the most occurred word which can help the owner as well as customers to know the specialty/features/problems etc.

On line 1 in wordcloud.js add the paths to your CSVs

```javascript
var files = ["file:///<PATH_TO_YOUR_CSV1>","file:///<PATH_TO_YOUR_CSV2>","file:///<PATH_TO_YOUR_CSV3>"]
```

On line 2 in wordcloud.js write the name of the place of ID respectively.

```javascript
var map = ["<NAME_OF_PLACE1>","<NAME_OF_PLACE2>","<NAME_OF_PLACE3>"]
```
Now open the wordcloud.html file for the interactive output visualisation

A screenshot of output given in the screenshot folder


## Visualising Analytic 3

The average reviews graph shows the average reviews per month per year for the last 9 years. This can help the owner understand what changes lead to what reviews.

On line 10 in AvgReview.js add the path to your CSV

```javascript
        	url: "file:///C:/Users/patin/Desktop/bdad/projects/output/AverageReviews/part-00000-6ac33c6b-db6e-4e3a-819d-d6919fecd3f3-c000.csv",

```
Now open the AvgReview.html file for the interactive output visualization

A screenshot of output given in the screenshot folder


## Visualising Analytic 4

The 2gram feature analysis of the reviews for a restaurant can be seen in this visualization. A graph and 2 wordclouds indicating positive negative words in the review. 

On line 1 in featureanalysis.js add the path to your CSV

```javascript
var files = ["file:///<PATH_TO_YOUR_CSV1>","file:///<PATH_TO_YOUR_CSV2>","file:///<PATH_TO_YOUR_CSV3>"]
```

On line 2 in featureanalysis.js write the name of the place of ID respectively.

```javascript
var map = ["<NAME_OF_PLACE1>","<NAME_OF_PLACE2>","<NAME_OF_PLACE3>"]
```
Now open the featureanalysis.html file for the interactive output visualisation

A screenshot of output given in the screenshot folder