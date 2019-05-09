filtered_bdf = business_df.select("business_id","state")
filtered_bdf.filter("state in ('PA','NV','OH','AZ')").show()
checkin = sc.textFile("bdad_dataset/checkin.json")
checkin_df = sqlContext.read.json(checkin)

print(checkin_df.map(tuple).map(lambda l: l[1]).take(1))
print(checkin_df.select("date").map(lambda l: l.date.encode('ascii','ignore').split(",")).take(1))


print(checkin_df.select("business_id","date").map(lambda l: l.date.encode('ascii','ignore').split(",")).take(1))
from pyspark.sql.functions import explode
from pyspark.sql.functions import split
from pyspark.sql.functions import udf
from pyspark.sql.functions import date_format

@udf
def convert_to_string(col):
  return col.encode('ascii','ignore')

checkin_df = checkin_df.withColumn('String_date',convert_to_string(checkin_df.String_date))
checkin_df = checkin_df.withColumn('String_date',convert_to_string(checkin_df.String_date)).show()

checkin_df = checkin_df.withColumn("Exp_Date",explode(split(checkin_df.String_date,",")))


print(checkin_df.withColumn("Exp_Date",explode(split(checkin_df.date,","))).take(1))

print(checkin_df = checkin_df.withColumn("Exp_Date",explode(split(checkin_df.String_date,","))).show())


checkin_df.withColumn('Exp_Date',convert_to_string(checkin_df.Exp_Date)).select('Exp_Date', date_format('Exp_Date', 'u').alias('dow_number')).show()

print(checkin_df.withColumn('Exp_Date',convert_to_string(checkin_df.Exp_Date)).map(lambda l: type(l)).take(10))


checkin_df.map(lambda l: (l.business_id, l.String_date.encode('ascii','ignore'))).map(lambda l: type(l)).take(1)


checkin_df.select('Exp_Date', date_format('Exp_Date', 'u').alias('dow_number')).show()

split_col = pyspark.sql.functions.split(checkin_df['Exp_Date'], ' ')

checkin_df.withColumn('Day', split_col.getItem(0)).show()


from datetime import datetime

datetime.strptime(‘2016-08-30 18:36:57’, ‘%Y-%m-%d %H:%M:%S’).strftime(’%A’)

print(checkin_df.map(lambda l: (l[0],l[1].split(" ")[0],l[1].split(" ")[1],l[2])).take(5))




filtered_bdf = business_df.select("business_id","state")
filtered_bdf.filter("state in ('PA','NV','OH','AZ')").show()











from datetime import datetime
from pyspark.sql.functions import explode
from pyspark.sql.functions import split
from pyspark.sql.functions import udf
from pyspark.sql.functions import date_format


checkin = sc.textFile("bdad_dataset/checkin.json")
checkin_df = sqlContext.read.json(checkin)
checkin_df = checkin_df.withColumn("Exp_Date",explode(split(checkin_df.date,",")))
checkin_df= checkin_df.rdd.map(lambda l: (l.business_id, l.Exp_Date.encode('ascii','ignore').strip())).map(lambda l: (l[0],l[1],datetime.strptime(l[1], '%Y-%m-%d %H:%M:%S').strftime('%A')))
checkin_df = checkin_df.map(lambda l: (l[0],l[1].split(" ")[0],l[1].split(" ")[1],l[2])).map(lambda l: (l[0],l[1].split("-")[0],l[1].split("-")[1],l[1].split("-")[2],l[2].split(":")[0],l[2].split(":")[1],l[2].split(":")[2],l[3]))
checkin_data = checkin_df.toDF(["ID","year","month","day","hours","min","secs","DoW"])

business = sc.textFile("bdad_dataset/business.json")
business_df = sqlContext.read.json(business)	
filtered_bdf = business_df.select("business_id","state")
filtered_bdf = filtered_bdf.filter("state in ('PA','NV','OH','AZ')").select("business_id")

state_filtered_checkin = checkin_data.join(filtered_bdf,filtered_bdf["business_id"] == checkin_data["ID"])
#state_filtered_checkin.groupBy("ID","DoW","hours").count().show()
final_count = state_filtered_checkin.limit(1000).groupBy("ID","DoW","hours").count()

final_count.show()





