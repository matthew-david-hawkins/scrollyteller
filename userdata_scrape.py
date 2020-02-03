# Import the modules
import os
import time
import datetime as DT
import tweepy
import json
import pandas as pd
import numpy as np
import requests
import pymongo
import geonamescache
import fuzzymatcher
from fuzzymatcher import link_table, fuzzy_left_join
from pymongo import MongoClient
from operator import itemgetter
import functools
def conjunction(*conditions):
    return functools.reduce(np.logical_and, conditions)
def DT_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = DT.datetime.fromtimestamp(now_timestamp) - DT.datetime.utcfromtimestamp(now_timestamp)
    return utc_datetime + offset

# Load credentials from json file:
os.chdir(r"C:\Users\hawki\Documents\Drive\Thrum Engineering\Git\Thrum Engineering Portfolio\scrollyteller")
# os.chdir(r"/Users/macbook/Desktop/Data-Program-Files/Group-Projects/Project-3/") #Folder Location
with open("twitter_credentials.json", "r") as file:
    creds = json.load(file)

print(creds)

def user_scrape():
    #Set up Twitter Authentication
    auth = tweepy.OAuthHandler(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'])
    auth.set_access_token(creds['ACCESS_TOKEN'], creds['ACCESS_SECRET'])
    api = tweepy.API(auth)

    users = ['@JoeBiden', '@ewarren', '@KamalaHarris', '@AndrewYang', '@TulsiGabbard', '@Chas10Buttigieg', '@MikeBloomberg', '@tedcruz', '@SecretaryCarson', '@Mike_Pence', '@realDonaldTrump', '@BernieSanders']
    a = 11

    while a > -1:
        listTweets = []
        keyword = itemgetter(a)(users)
        NumTweets = 3200

        def get_tweets(listTweets, keyword, NumTweets):
        # Iterate through all tweets containing the given word, api search mode
            for tweet in tweepy.Cursor(api.user_timeline
                                    , screen_name=keyword
                                    , tweet_mode="extended"
                                    , count=None
                                    , since_id=None
                                    , max_id=None
                                    , trim_user=False
                                    , exclude_replies=True
                                    , contributor_details=False
                                    , include_entities=True).items(NumTweets):
            # Add tweets in this format
                dict_ = {'Screen_Name': tweet.user.screen_name,
                        'User_Name': tweet.user.name,
                        'Tweet_Created_At': str(DT_from_utc_to_local(tweet.created_at)),
                        'Tweet_Text': tweet.full_text,
                        'Hashtags': tweet.entities.get('hashtags'), #How? - get only hashtag text
                        'User_Location': str(tweet.user.location),
                        'Tweet_Coordinates': str(tweet.coordinates),
                        'Tweet_Place': str(tweet.place),
                        'Retweet_Count': str(tweet.retweet_count),
                        'Retweeted': str(tweet.retweeted),
                        'Favorite_Count': str(tweet.favorite_count),
                        'Favorited': str(tweet.favorited),
                        'Replied': str(tweet.in_reply_to_status_id_str),
                        'Tweet_URL': tweet.entities.get('urls') #How? - get only expanded url?
                        }
                listTweets.append(dict_)   
            return listTweets
        get_tweets(listTweets, keyword, NumTweets)
        user_data = pd.DataFrame(listTweets)

        #Add city coordinates to dataset and clean data further
        key = creds['gkey']
        URL = 'https://maps.googleapis.com/maps/api/geocode/json'

        location = user_data[['User_Location']].drop_duplicates()
        location = location.reset_index()
        #Begin getting coordinates
        list_lat = []
        list_long = []
        for index, row in location.iterrows():
            try:
                city = row['User_Location']
                params = {'key': creds['gkey']
                ,'address': city
                ,'sensor': 'false'
                ,'region': 'USA'}
                req = requests.get(URL, params=params)
                res = req.json()
                query = res['results'][0]
                lat = query['geometry']['location']['lat']
                long = query['geometry']['location']['lng']
                list_lat.append(lat)
                list_long.append(long)
            except:
                list_lat.append(0)
                list_long.append(0)

        location['lat'] = list_lat
        location['long'] = list_long
        user_data = user_data.merge(location, left_on='User_Location', right_on='User_Location')
        user_data = user_data[['Screen_Name','User_Name','Tweet_Text','Hashtags','Tweet_Created_At','Favorite_Count','Retweet_Count','Tweet_URL','Tweet_Coordinates','Tweet_Place','User_Location','lat','long']]
        user_data['keyword'] = keyword

        #Connect to Mongo DB Atlas
        mongokey = creds['mongo']
        path = "mongodb+srv://thrum-rw:"+mongokey+"@thrumcluster-f2hkj.mongodb.net/test?retryWrites=true&w=majority"
        client = pymongo.MongoClient(path)
        db = client.twitter_thrum
        collection = db['userdata']
        
        print(user_data)

        #Only import records that do not exist in dataframe
        mongodata = pd.DataFrame(list(collection.find()))
        mongodata = mongodata[['Screen_Name','User_Name','Tweet_Text','Hashtags','Tweet_Created_At','Favorite_Count','Retweet_Count','Tweet_URL','Tweet_Coordinates','Tweet_Place','User_Location','lat','long','keyword']]
        importdata = pd.merge(user_data, mongodata,  how='left', left_on=['Screen_Name','Tweet_Created_At'], right_on=['Screen_Name','Tweet_Created_At'])
        importdata['User_Name_y'] = importdata['User_Name_y'].fillna(0)
        var_is0 = importdata['User_Name_y'] == 0
        importdata = importdata[conjunction(var_is0)]
        importdata = importdata.reset_index()
        importdata = importdata[['Screen_Name','User_Name_x','Tweet_Text_x','Hashtags_x','Tweet_Created_At','Favorite_Count_x','Retweet_Count_x','Tweet_URL_x','Tweet_Coordinates_x','Tweet_Place_x','User_Location_x','lat_x','long_x','keyword_x']]
        importdata = importdata.rename(columns={"User_Name_x": "User_Name", "Tweet_Text_x": "Tweet_Text", "Hashtags_x": "Hashtags", "Favorite_Count_x": "Favorite_Count", "Retweet_Count_x": "Retweet_Count", "Tweet_URL_x": "Tweet_URL", "Tweet_Coordinates_x": "Tweet_Coordinates", "Tweet_Place_x": "Tweet_Place", "User_Location_x": "User_Location", "lat_x": "lat", "long_x": "long", "keyword_x": "keyword"})
        importdata = importdata.drop_duplicates(subset=['Screen_Name','Tweet_Created_At'])
        if importdata.empty:
            importdata.loc[len(importdata.index), 1] = 0
        #create json file
        records = json.loads(importdata.T.to_json()).values()
        #Insert Into Mongo
        collection.insert_many(records)
        a = a - 1
        time.sleep(700)
    print('done')

prompt = input("continue?")
user_scrape()
