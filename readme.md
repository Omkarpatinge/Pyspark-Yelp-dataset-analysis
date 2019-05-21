# Yelp Dataset analysis

The PySpark code performs analysis on the Yelp's Business, Reviews and Check-in dataset. 3 major analytics are performed.

## Starting Spark Shell

Setup PySpark enviroment or connect to Cloudera VM with installed setup of PySpark. Start the PySpark shell as follows

```bash
pyspark2 --num-executors 20 --executor-memory 5G --driver-memory 8G --conf spark.executor.memoryOverhead=2G
```
## Preparing the data

Unzip and extract the contents of Yelp dataset and add the JSON files in the "bdad_dataset/" folder in HDFS


## Usage


Analytic 1:


Enter the contents of file AvgReviews.py in the shell



Analytic 2:


Enter the contents of file Checkin.py in the shell

Analytic 3:

Enter the contents of wordcloud.py in the shell

Analytic 4:

Enter the contents of 2gram.py in the shell

## Output

The outputs will be generated in the bdad_dataset/output/ folder. 
The outputs are taken out and visualization and remedian is performed on it. 

The script for wordcloud.py and 2gram.py(takes upto 3-4 hours to run for one place) needs to be run individually on the top places.

```python
top_bid = top_count.select("business_id").collect()[<PLACE_INDEX>].business_id
```

The <PLACE_INDEX> value ranges from 0 to 9 and generates wordcloud analysis and feature analysis for that particular place. The process isn't automated as running on 5 different places can take a lot of time.


##Visualisation

Check the visualisation readme in the visualisation folder for the details
