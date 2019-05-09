#Pyspark 2 code. RUN using pyspark2 shell

from nltk.stem.porter import *
import string
from pyspark.ml.feature import HashingTF, IDF, Tokenizer, CountVectorizer, StopWordsRemover, Tokenizer
from pyspark.sql.functions import udf
from pyspark.sql.types import ArrayType, FloatType, StringType, IntegerType
import nltk
from nltk.stem import SnowballStemmer
from nltk.stem import WordNetLemmatizer
from pyspark.sql import functions as f
from pyspark.ml.feature import NGram
import pandas as pd
from pyspark.ml.classification import LinearSVC


@udf
def change_labels(x):
    if x >= 3.0:    
        return 1
    else:              
        return 0

reviews = sc.textFile("bdad_dataset/review.json")
reviews_df = sqlContext.read.json(reviews)
top_count = reviews_df.groupBy("business_id").count().orderBy("count",ascending = False).limit(10).cache()
top_bid = top_count.select("business_id").collect()[1].business_id

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



def unitoarr(line):
	s = []
	for w in line:
		w = w.strip()
		if len(w) != 1 and w != "" and w != ' ' and len(w)>2:
			s.append(w) 
	return s


unitoarr_udf =  udf(unitoarr, ArrayType(StringType()))

text2 = text.withColumn("review",unitoarr_udf(text.lemma)).withColumn("label",change_labels(text.stars))


ngram = NGram(n=2, inputCol="review", outputCol="ngrams")

ngramDataFrame = ngram.transform(text2)

cv = CountVectorizer(inputCol="ngrams", outputCol="features")

models = cv.fit(ngramDataFrame)

result = models.transform(ngramDataFrame)

result1 = result.select("business_id","text","stars","label","features","ngrams")

idf = IDF(inputCol="features", outputCol="tdfeatures")
idfModel = idf.fit(result1)
rescaledData = idfModel.transform(result1)

testing = rescaledData.select("business_id","text","stars","label","tdfeatures","ngrams").withColumnRenamed("tdfeatures","features")
testing = testing.withColumn("label", testing["label"].cast(IntegerType()))


svm = LinearSVC()
model = svm.fit(testing)
coeffs = model.coefficients


vocabulary_ngram = models.vocabulary
weights_ngram = coeffs.toArray()
svm_coeffs_df_ngram = pd.DataFrame({'ngram': vocabulary_ngram, 'weight': weights_ngram})

sql = SQLContext(sc)

result = sql.createDataFrame(svm_coeffs_df_ngram)

result.coalesce(1).write.csv('bdad_dataset/output/twogramfeatures_'+top_bid)




