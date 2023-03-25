'''Import modules'''
import json
from flask_cors import CORS
from flask import Flask, request
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# declare constants
HOST = '0.0.0.0'
PORT = 5000


EXTREME_NEGATIVE = -0.3
EXTREME_POSITIVE = 0.3
GENERAL_POSITIVE = 0.1
GENERAL_NEGATIVE = -0.1


def classify_sentiment(score):
    '''Returns a human understandable interpretation of the sentiment score'''
    if score >= GENERAL_POSITIVE :
        if score >= EXTREME_POSITIVE :
            return "Very Positive"
        return "Positive"
    if score <= GENERAL_NEGATIVE :
        if score <= EXTREME_NEGATIVE:
            return "Very Negative"
        return "Negative"
    return "Neutral"


#calculate the negative, positive, neutral and compound scores, plus verbal evaluation
def sentiment_vader(sentence):
    '''Function calculates the sentiment score'''
    # Create a SentimentIntensityAnalyzer object.
    sid_obj = SentimentIntensityAnalyzer()
    sentiment_dict = sid_obj.polarity_scores(sentence)
    negative = sentiment_dict['neg']
    neutral = sentiment_dict['neu']
    positive = sentiment_dict['pos']
    compound = sentiment_dict['compound']
    if sentiment_dict['compound'] >= GENERAL_POSITIVE :
        if sentiment_dict['compound'] >= EXTREME_POSITIVE :
            overall_sentiment = "Very Positive"
        else:
            overall_sentiment = "Positive"
    elif sentiment_dict['compound'] <= GENERAL_NEGATIVE :
        if sentiment_dict['compound'] <= EXTREME_NEGATIVE:
            overall_sentiment = "Very Negative"
        else:
            overall_sentiment = "Negative"
    else :
        overall_sentiment = "Neutral"
    return negative, neutral, positive, compound, overall_sentiment


def compute_sentiment(filename):
    '''Reads an input file and outputs the total score, most positive and most negative comments'''
    most_positive = []
    most_negative = []
    total_score = []
    total_sum = 0
    counter = 0
    with open(filename, "r", encoding="utf8") as filestream:

        data = filestream.readline()

        while data:
            data = str(data[:len(data)-1])
            negative, neutral, positive, compound, overall_sentiment = sentiment_vader(data)
            print(negative, neutral, positive, compound, overall_sentiment)
            data_score = (float(compound), data)
            if len(most_positive) < 3:
                most_positive.append(data_score)
                most_positive.sort(key=lambda tup: tup[0])
            elif compound > float(most_positive[0][0]):
                most_positive.pop(0)
                most_positive.append(data_score)
                most_positive.sort(key=lambda tup: tup[0])
            if len(most_negative) < 3:
                most_negative.append(data_score)
                most_negative.sort(key=lambda tup: tup[0])
            elif compound < most_negative[2][0]:
                most_negative.pop(2)
                most_negative.append(data_score)
                most_negative.sort(key=lambda tup: tup[0])

            total_score.append(compound)
            total_sum += compound
            counter += 1
            data = filestream.readline()

    filestream.close()

    return most_positive, most_negative, total_score, total_sum, counter


# initialize flask application
app = Flask(__name__)


# sample hello world page
@app.route('/')
def hello():
    '''Function triggered when backend is brought up'''
    return "<h1>Hello World</h1>"


# sample api endpoint
@app.route('/api/find_sentiment', methods=['GET', 'POST'])
def find_sentiment():
    '''Function triggered when find_sentiment endpoint is hit, returns sentiment of selected file'''
    most_positive, most_negative, total_score, total_sum, counter = compute_sentiment(
        json.loads(request.get_data(as_text=True))['filename']
    )
    average_sentiment = classify_sentiment(total_sum / counter)
    total_score.sort()
    median_sentiment = classify_sentiment(total_score[counter // 2])
    print("average", total_sum / counter)
    print("median", total_score[counter // 2])
    pos = [ x[1] for x in most_positive ]
    neg = [ x[1] for x in most_negative ]
    res = {
        "average_sentiment": average_sentiment,
        "median_sentiment": median_sentiment,
        "most_positive": pos,
        "most_negative": neg
    }
    response = app.response_class(
        response=json.dumps(res),
        status=200,
        mimetype='application/json'
    )
    return response



if __name__ == '__main__':
    CORS(app)
    app.run(host=HOST, debug=True, port=PORT)
