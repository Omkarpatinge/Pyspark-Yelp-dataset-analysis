from datetime import datetime
from pyspark.sql.functions import explode
from pyspark.sql.functions import split
from pyspark.sql.functions import udf
from pyspark.sql.functions import date_format


checkin = sc.textFile("bdad_dataset/checkin.json")
checkin_df1 = sqlContext.read.json(checkin)


business = sc.textFile("bdad_dataset/business.json")
business_df = sqlContext.read.json(business)	
filtered_bdf = business_df.select("business_id","state")
filtered_bdf = filtered_bdf.filter("state in ('AZ','NV')").select("business_id").withColumnRenamed("business_id", "ID")

state_filtered_checkin = checkin_df1.join(filtered_bdf,filtered_bdf["ID"] == checkin_df1["business_id"]).select("business_id","date")

checkin_df = state_filtered_checkin.withColumn("Exp_Date",explode(split(state_filtered_checkin.date,",")))
checkin_df= checkin_df.rdd.map(lambda l: (l.business_id, l.Exp_Date.encode('ascii','ignore').strip())).map(lambda l: (l[0],l[1],datetime.strptime(l[1], '%Y-%m-%d %H:%M:%S').strftime('%A')))
checkin_df = checkin_df.map(lambda l: (l[0],l[1].split(" ")[0],l[1].split(" ")[1],l[2])).map(lambda l: (l[0],l[1].split("-")[0],l[1].split("-")[1],l[1].split("-")[2],l[2].split(":")[0],l[2].split(":")[1],l[2].split(":")[2],l[3]))
checkin_data = checkin_df.toDF(["ID","year","month","day","hours","min","secs","DoW"])

checkin_data.groupBy("ID","DoW","hours").count().show()

final_count = checkin_data.groupBy("ID","DoW","hours").count()
final_count.coalesce(1).write.csv("bdad_dataset/output/checkinCounts")