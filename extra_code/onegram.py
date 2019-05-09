from nltk.stem.porter import *
import string
from pyspark.ml.feature import HashingTF, IDF, Tokenizer
from pyspark.sql.functions import udf
from pyspark.sql.types import ArrayType, FloatType, StringType
import nltk
from nltk.stem import SnowballStemmer
from nltk.stem import WordNetLemmatizer
from pyspark.ml.feature import StopWordsRemover
from pyspark.ml.feature import Tokenizer
from pyspark.sql import functions as f

@udf
def change_labels(x):
    if x >= 3.0:    
        return 1
    else:              
        return 0

reviews = sc.textFile("bdad_dataset/review.json")
reviews_df = sqlContext.read.json(reviews)
top_count = reviews_df.groupBy("business_id").count().orderBy("count",ascending = False).limit(1).cache()
top_bid = top_count.select("business_id").collect()[0].business_id

filtered_review = reviews_df.filter(reviews_df.business_id == top_bid).cache()

stemmer = SnowballStemmer('english')
wordnet_lemmatizer = WordNetLemmatizer()


@udf
def remove_punct(text):
    regex = re.compile('[' + re.escape(string.punctuation) + '0-9\\r\\t\\n]')
    nopunct = regex.sub(" ", text)  
    return nopunct


filtered_review = filtered_review.withColumn("text" , remove_punct(filtered_review.text))


tokenizer = Tokenizer(inputCol="text", outputCol="words")

tokenized = tokenizer.transform(filtered_review).select("business_id","text","words","stars")

remover = StopWordsRemover(inputCol="words", outputCol="filtered_words")
removedsw = remover.transform(tokenized)

@udf 
def lemma(line):
	nltk.download("wordnet",download_dir=".")
	nltk.data.path.append(".")
	return [wordnet_lemmatizer.lemmatize(word,pos="v") for word in line]

text = removedsw.withColumn("lemma",lemma(removedsw.filtered_words))


@udf
def unitostr(line):
	temp = line[1:-1].encode('ascii','ignore').split(",")
	s = ""
	for w in temp:
		w = w.strip()
		if len(w) != 1 and w != "" and w != ' ' and len(w)>2:
			s = s +" "+ w 
	return s.strip()

text = text.withColumn("review",unitostr(text.lemma)).withColumn("label",change_labels(text.stars))

line = text.select("review").agg(f.concat_ws(" ", f.collect_list(text.review)).alias("text_val"))

def removedup(line): 
	return list(set(line.split(" ")))

label_udf = udf(removedup, ArrayType(StringType()))



line = line.withColumn("nodup",label_udf(line.text_val))



hashingTF = HashingTF(inputCol="nodup", outputCol="rawFeatures", numFeatures=20)
featurizedData = hashingTF.transform(line)