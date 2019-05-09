from nltk.stem.porter import *
import string
from pyspark.sql.functions import udf
import nltk
from nltk.stem import SnowballStemmer
from nltk.stem import WordNetLemmatizer
from pyspark.ml.feature import StopWordsRemover
from pyspark.ml.feature import Tokenizer


stemmer = SnowballStemmer('english')
wordnet_lemmatizer = WordNetLemmatizer()

@udf
def unitostr(line):
	temp = line[1:-1]
	s = ""
	for w in temp:
		w = w.strip()
		if len(w) != 1 and w != "" and w != ' ' and len(w)>2:
			s = s +" "+ w 
	return s.strip()

@udf 
def lemma(line):
	nltk.download("wordnet",download_dir=".")
	nltk.data.path.append(".")
	return [wordnet_lemmatizer.lemmatize(word,pos="v") for word in line]

@udf
def remove_punct(text):
    regex = re.compile('[' + re.escape(string.punctuation) + '0-9\\r\\t\\n]')
    nopunct = regex.sub(" ", text)  
    return nopunct

reviews = sc.textFile("bdad_dataset/review.json")
reviews_df = sqlContext.read.json(reviews)
top_count = reviews_df.groupBy("business_id").count().orderBy("count",ascending = False).limit(10).cache()


top_bid = top_count.select("business_id").collect()[4].business_id

filtered_review = reviews_df.filter(reviews_df.business_id == top_bid).cache()

filtered_review = filtered_review.withColumn("text" , remove_punct(filtered_review.text))


tokenizer = Tokenizer(inputCol="text", outputCol="words")

tokenized = tokenizer.transform(filtered_review).select("business_id","text","words")

remover = StopWordsRemover(inputCol="words", outputCol="filtered_words")
removedsw = remover.transform(tokenized)

text = removedsw.withColumn("lemma",lemma(removedsw.filtered_words))


text1 = text.withColumn("lemma",unitostr(text.lemma))


words_rdd = text1.select("business_id","lemma").rdd
words_count = words_rdd.flatMap(lambda l: l.lemma.encode("ascii","ignore").split(" ")).map(lambda x:(x,1)).reduceByKey(lambda x,y: x+y).filter(lambda x: x[1]>500)

sorted = words_count.sortBy(lambda a: a[1],ascending = False)
sqlContext.createDataFrame(sorted, ['word','count']).coalesce(1).write.csv("bdad_dataset/output/wordcloud_"+top_bid)

sorted.coalesce(1,true).saveAsTextFile("bdad_dataset/wordcloud")


from wordcloud import WordCloud
import matplotlib.pyplot as plt

counts = {'food': 6072,'good': 5815,'great': 5620,'place': 4351,'come': 4349,'service': 4320,'order': 4280,'steak': 4271,'vegas': 3922,'time': 3666,'french': 3538,'like': 3109,'just': 2936,'patio': 2922,'seat': 2917,'restaurant': 2856,'view': 2707,'get': 2646,'bellagio': 2642,'table': 2494,'really': 2487,'eat': 2486,'delicious': 2485,'wait': 2462,'sit': 2406,'nice': 2292,'dinner': 2256,'love': 2246,'strip': 2209,'try': 2171,'outside': 2168,'breakfast': 2137,'mon': 2131,'ami': 2124,'best': 2068,'bread': 2067,'gabi': 1910,'amaze': 1835,'price': 1759,'meal': 1665,'make': 1658,'egg': 1640,'say': 1634,'soup': 1622,'people': 1606,'frites': 1588,'want': 1582,'cheese': 1564,'sauce': 1555,'definitely': 1550,'enjoy': 1547,'fountains': 1504,'experience': 1499,'right': 1475,'menu': 1460,'fry': 1443,'perfect': 1386,'recommend': 1377,'watch': 1368,'didn': 1347,'little': 1325,'brunch': 1323,'think': 1313,'serve': 1312,'bite': 1304,'lunch': 1281,'wine': 1256,'excellent': 1247,'onion': 1247,'inside': 1236,'dish': 1229,'taste': 1229,'pretty': 1223,'butter': 1218,'look': 1212,'ask': 1203,'server': 1202,'cook': 1186,'don': 1182,'star': 1181,'salad': 1163,'crepe': 1126,'paris': 1106,'water': 1075,'day': 1074,'fresh': 1068,'better': 1057,'reservation': 1050,'night': 1044,'salmon': 994,'din': 991,'waiter': 988,'know': 972,'reservations': 958,'wasn': 947,'warm': 947,'filet': 939,'chicken': 914,'start': 869,'favorite': 865,'visit': 854,'las': 853,'sure': 844,'take': 834,'drink': 825,'fountain': 816,'scallop': 812,'way': 804,'special': 802,'benedict': 795,'worth': 789,'friendly': 774,'minutes': 774,'give': 754,'location': 750,'overall': 739,'toast': 734,'flavor': 734,'atmosphere': 733,'perfectly': 732,'review': 730,'sandwich': 725,'friend': 719,'tasty': 717,'spot': 713,'staff': 712,'bring': 709,'disappoint': 708,'awesome': 707,'wonderful': 706,'dessert': 691,'feel': 687,'baguette': 664,'tell': 659,'long': 656,'bad': 652,'steaks': 650,'escargot': 645,'expect': 643,'beef': 642,'outdoor': 633,'waitress': 631,'ambiance': 630,'coffee': 626,'mignon': 623,'friends': 617,'walk': 612,'end': 610,'decide': 605,'medium': 604,'trip': 601,'glass': 595,'fantastic': 593,'portion': 591,'need': 589,'attentive': 587,'party': 584,'lot': 584,'appetizer': 583,'bacon': 582,'restaurants': 579,'quality': 570,'highly': 569,'husband': 568,'free': 561,'light': 561,'thing': 560,'cream': 555,'cut': 548,'check': 546,'leave': 539,'super': 539,'bar': 536,'tender': 522,'busy': 518,'probably': 515,'seafood': 515,'street': 513,'host': 510,'quite': 509,'crispy': 509,'share': 508,'sweet': 508,'hotel': 508,'hot': 506}

wordcloud = WordCloud(    
                          background_color='white',
                          max_words=500,
                          max_font_size=50,
                          min_font_size=5,
                          random_state=40,
                         ).fit_words(counts)
fig = plt.figure(1)
plt.imshow(wordcloud)
plt.axis('off')  #remove axis
plt.show()



@udf 
def join_list(l):
	return " ".join(l)


import string
import re


@udf
def remove_punct(text):
    regex = re.compile('[' + re.escape(string.punctuation) + '0-9\\r\\t\\n]')
    nopunct = regex.sub(" ", text)  
    return nopunct

def lemma2(line):	
	return type(line)

from pyspark.sql.functions import udf

def le(line):
	nltk.download("wordnet",download_dir=".")
	nltk.data.path.append(".")
	return [wordnet_lemmatizer.lemmatize(word) for word in line]


le2 = udf(lambda x: le(x))




removedsw = removedsw.withColumn("joined",join_list(removedsw.filtered_words))	

from pyspark.sql import functions as f

line = removedsw.select("joined").agg(f.concat_ws(" ", f.collect_list(removedsw.joined)).alias("text_val")).collect()[0].text_val







spark.udf.register("st", stem)




line = filtered_review.select("filtered_words").agg(f.concat_ws(", ", f.collect_list(filtered_review.text)).alias("text_val")).collect()[0].text_val

stemmer = SnowballStemmer('english')
wordnet_lemmatizer = WordNetLemmatizer()

line = line.lower().encode("ascii","ignore") 
split = word_tokenize(line)
filtered = []
for token in split:
    if re.search('[a-zA-Z]', token):    
        filtered.append(token)
word = [i for i in filtered if i not in stopwords.words('english')]
d = [stemmer.stem(word) for word in word] 
d = [wordnet_lemmatizer.lemmatize(word) for word in d]
	


sc.createDataFrame([(top_bid, counts)], ["B_id", "counts"]).saveAsTextFile("/output_bdad")



@udf
def process_text(line):
	line = line.lower() 
	#nltk.download("punkt")
	split = word_tokenize(line)
	filtered = []
	for token in split:
	    if re.search('[a-zA-Z]', token):    
	        filtered.append(token)
	word = [i for i in filtered if i not in stopwords.words('english')]
	d = [stemmer.stem(word) for word in word] 
	#nltk.download("wordnet")
	d = [wordnet_lemmatizer.lemmatize(word) for word in d]
	return d




filtered_review.withColumn("prcoess",process_text(filtered_review.text)).show()
from pyspark.sql.types import StringType



spark.sparkContext.parallelize(top_bid, counts)



@udf
def stem(line):
	return [stemmer.stem(word) for word in line] 

removedsw = removedsw.withColumn("stem",stem(removedsw.filtered_words))
