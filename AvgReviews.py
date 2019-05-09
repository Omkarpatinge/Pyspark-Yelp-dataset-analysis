from pyspark.sql.functions import expr
from pyspark.sql.functions import split

reviews = sc.textFile("bdad_dataset/review.json")
reviews_df = sqlContext.read.json(reviews)
reviews_df = reviews_df.select("business_id","date","stars")
split_col = split(reviews_df['date'], ' ')
reviews_df = reviews_df.withColumn('date', split_col.getItem(0))
split_col = split(reviews_df['date'], '-')
reviews_df = reviews_df.withColumn('year', split_col.getItem(0))
reviews_df = reviews_df.withColumn('month', split_col.getItem(1))

avg_review = reviews_df.groupBy("business_id","year","month").avg("stars").withColumnRenamed("avg(stars)","avg_stars")

avg_review = avg_review.withColumn("avg_stars", expr("round(avg_stars, 2)"))
avg_review = avg_review.cache()

count_reviews = reviews_df.groupBy("business_id","year","month").count()
count_reviews = count_reviews.withColumnRenamed("business_id","business_id_1").withColumnRenamed("year","year_1").withColumnRenamed("month","month_1")
count_reviews = count_reviews.cache()

final_review_df = count_reviews.join(avg_review, (count_reviews.business_id_1 == avg_review.business_id) & (count_reviews.year_1 == avg_review.year) & (count_reviews.month_1 == avg_review.month)).select("business_id","year","month","avg_stars","count")
final_review_df.coalesce(1).write.csv('bdad_dataset/output/AverageReviews')
