# historical.py makes API calls to twitter and gathers the last ~3000 tweets for a given twitter user and adds them to a Mongo Database
import csv
import os
import json
import time
import requests
import pymongo
from pymongo import MongoClient
import numpy as np
import pandas as pd
import datetime as DT
import tweepy
import functools
from pprint import pprint
from opencage.geocoder import OpenCageGeocode
import geonamescache
import difflib
from operator import itemgetter
import functools
import fuzzy_matcher
from fuzzyjoin import io
from fuzzywuzzy import fuzz

# Load credentials from json file:
os.chdir(r"C:\Users\angy4\BootCamp-HW\d3-data-viz")
with open("twitter_credentials.json", "r") as file:
    creds = json.load(file)

# Set up Twitter Authentication
CONSUMER_KEY = creds['CONSUMER_KEY']
CONSUMER_SECRET = creds['CONSUMER_SECRET']
ACCESS_TOKEN = creds['ACCESS_TOKEN']
ACCESS_SECRET = creds['ACCESS_SECRET']

auth = tweepy.OAuthHandler(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'])
auth.set_access_token(creds['ACCESS_TOKEN'], creds['ACCESS_SECRET'])
api = tweepy.API(auth)

#### Read user data from csv ###
with open('ind_twitter_users.csv') as f:

    for line in f.readlines():
        array = line.split(',')
        first_item = array[0]

    num_columns = len(array)
    f.seek(0)

    reader = csv.reader(f, delimiter=',')
    user_col = [2]
    username_col = [1]
    ht_cols = [3]

    # SKip Header
    next(reader)

    list_users = []
    hashtags = []
    user_id = []
    screen_name = []

    for row in reader:
        content = [row[i] for i in user_col]
        ht = [row[i] for i in ht_cols]
        scrname = [row[i] for i in username_col]
#         add if not in in list
        if not content in list_users:
            list_users.append(content)
            hashtags.append(ht)
            screen_name.append(scrname)
            users_arr = np.array(list_users)
            ht_arr = np.array(hashtags)

            for s in users_arr:
                # tHandle - user handle without the space before "@"
                tHandle = np.char.strip(users_arr, chars=' ')

#       Add if not in list
        if not screen_name in user_id:
            user_id.append(screen_name)


# csv to DataFrame
source_df = pd.read_csv('ind_twitter_users.csv', encoding="ISO-8859-1")

# Twitter Handle
user_df = source_df['Twitter Handle']

# Hashtags
hashtag_df = source_df['Slogan Hashtag']


# Amount of loops needed to pull x amount of tweets
loop = 16
# Count of tweets requested at a time
count = 200
# where tweets will be added to
listTw = []


def conjunction(*conditions):
    return functools.reduce(np.logical_and, conditions)


def DT_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = DT.datetime.fromtimestamp(
        now_timestamp) - DT.datetime.utcfromtimestamp(now_timestamp)
    return utc_datetime + offset


###### Pull Max amount of Tweets for each user######
while loop > -1:

    def get_all_tweets(screen_name):
         # authorize twitter, initialize tweepy
        auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
        auth.set_access_token(ACCESS_TOKEN, ACCESS_SECRET)
        api = tweepy.API(auth)

        # initialize a list to hold all the tweepy Tweets
        alltweets = []

        # make initial request for most recent tweets (200 is the maximum allowed count)
        new_tweets = api.user_timeline(screen_name=screen_name, count=3200)

        # save most recent tweets
        alltweets.extend(new_tweets)

        # save the id of the oldest tweet less one
        oldest = alltweets[-1].id - 1

        # keep grabbing tweets until there are no tweets left to grab
        while len(new_tweets) > 0:
            print("getting tweets before %s" % (oldest))
            # all subsiquent requests use the max_id param to prevent duplicates
            new_tweets = api.user_timeline(
                screen_name=screen_name, count=200, max_id=oldest)

            # save most recent tweets
            alltweets.extend(new_tweets)

            # update the id of the oldest tweet less one
            oldest = alltweets[-1].id - 1

            print("...%s tweets downloaded so far" % (len(alltweets)))

        # tweet.truncated reps whether tweet has been retweeted and is not original post
            outtweets = [{
                'Screen_Name': tweet.user.screen_name,
                'User_Name': tweet.user.name,
                'Tweet_Created_At': str(DT_from_utc_to_local(tweet.created_at)),
                'Tweet_Text': tweet.text,
                'Hashtags': tweet.entities.get('hashtags'),
                'User_Location': str(tweet.user.location),
                'Tweet_Coordinates': str(tweet.coordinates),
                'Tweet_Place': str(tweet.place),
                'Retweet_Count': str(tweet.retweet_count),
                'Retweeted': str(tweet.retweeted),
                'Favorite_Count': str(tweet.favorite_count),
                'Favorited': str(tweet.favorited),
                'Replied': str(tweet.in_reply_to_status_id_str),
                'Tweet_URL': tweet.entities.get('extended url')
            }
                for tweet in alltweets]

            with open('%s_tweets.json' % screen_name, 'a') as f:

                json_dumps = json.dumps(
                    outtweets, indent=4, sort_keys=True, default=str)
                f.write(json_dumps)
                pprint(outtweets)

                pass
            listTw.append(outtweets)
            return listTw
        user_data = pd.DataFrame(listTw)

        # Add city coordinates to dataset and clean data further
        key = creds['key']
        geocoder = OpenCageGeocode(key)

        location = user_data[['User_Location']].drop_duplicates()
        location = location.reset_index()

        # Begin getting coordinates
        list_lat = []
        list_long = []
        for index, row in location.iterrows():
            try:
                city = row['User_Location']
                query = str(city)
                results = geocoder.geocode(query)
                lat = results[0]['geometry']['lat']
                long = results[0]['geometry']['lng']
                list_lat.append(lat)
                list_long.append(long)
            except:
                list_lat.append(0)
                list_long.append(0)

        location['lat'] = list_lat
        location['long'] = list_long
        user_data = user_data.merge(
            location, left_on='User_Location', right_on='User_Location')
        user_data = user_data[['Screen_Name', 'User_Name', 'Tweet_Text', 'Hashtags', 'Tweet_Created_At', 'Favorite_Count',
                               'Retweet_Count', 'Tweet_URL', 'Tweet_Coordinates', 'Tweet_Place', 'User_Location', 'lat', 'long']]
        user_data['keyword'] = keyword

        # Connect to Mongo DB Atlas
        mongokey = creds['mongo']
        path = "mongodb+srv://vgalst:"+mongokey + \
            "@tweetering-giclm.mongodb.net/test?retryWrites=true&w=majority"
        client = pymongo.MongoClient(path)
        db = client.twitter
        collection = db['userdata']

        # Only import records that do not exist in dataframe
        mongodata = pd.DataFrame(list(collection.find()))
        mongodata = mongodata[['Screen_Name', 'User_Name', 'Tweet_Text', 'Hashtags', 'Tweet_Created_At', 'Favorite_Count',
                               'Retweet_Count', 'Tweet_URL', 'Tweet_Coordinates', 'Tweet_Place', 'User_Location', 'lat', 'long', 'keyword']]
        importdata = pd.merge(user_data, mongodata,  how='left', left_on=[
                              'Screen_Name', 'Tweet_Created_At'], right_on=['Screen_Name', 'Tweet_Created_At'])
        importdata['User_Name_y'] = importdata['User_Name_y'].fillna(0)
        var_is0 = importdata['User_Name_y'] == 0
        importdata = importdata[conjunction(var_is0)]
        importdata = importdata[['Screen_Name', 'User_Name_x', 'Tweet_Text_x', 'Hashtags_x', 'Tweet_Created_At', 'Favorite_Count_x',
                                 'Retweet_Count_x', 'Tweet_URL_x', 'Tweet_Coordinates_x', 'Tweet_Place_x', 'User_Location_x', 'lat_x', 'long_x', 'keyword_x']]
        importdata = importdata.rename(columns={"User_Name_x": "User_Name", "Tweet_Text_x": "Tweet_Text", "Hashtags_x": "Hashtags", "Favorite_Count_x": "Favorite_Count", "Retweet_Count_x": "Retweet_Count",
                                                "Tweet_URL_x": "Tweet_URL", "Tweet_Coordinates_x": "Tweet_Coordinates", "Tweet_Place_x": "Tweet_Place", "User_Location_x": "User_Location", "lat_x": "lat", "long_x": "long", "keyword_x": "keyword"})
        importdata = importdata.reset_index(drop=True)
        importdata = importdata.drop_duplicates(
            subset=['Screen_Name', 'Tweet_Created_At'])
        importdata = importdata.set_index(['Tweet_Created_At'])

        # create json file
        records = json.loads(importdata.T.to_json()).values()
        collection.insert_many(records)
        # a = a - 1
        time.sleep(300)


if __name__ == '__main__':

    ###################### Tweets from all users in csv file #########################
    for use in user_df:

        get_all_tweets(use)
