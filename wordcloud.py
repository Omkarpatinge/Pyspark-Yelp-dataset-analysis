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


top_bid = top_count.select("business_id").collect()[0].business_id

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



















