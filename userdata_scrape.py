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


def get_tweets(keyword, NumTweets, creds, max_id_set):
    listTweets = []
    # Iterate through all tweets containing the given word, api search mode
        #Set up Twitter Authentication
    auth = tweepy.OAuthHandler(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'])
    auth.set_access_token(creds['ACCESS_TOKEN'], creds['ACCESS_SECRET'])
    api = tweepy.API(auth)

    tweep = tweepy.Cursor(api.user_timeline
                            , screen_name=keyword
                            , tweet_mode="extended"
                            , count=50
                            , since_id=None
                            , max_id=max_id_set
                            , trim_user=False
                            , exclude_replies=True
                            , contributor_details=False
                            , include_entities=True).items(NumTweets)
    

    for tweet in tweep:

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
                'Tweet_URL': tweet.entities.get('urls'), #How? - get only expanded url?
                'ID': tweet.id
                }
        listTweets.append(dict_)
        time.sleep(0.5)
        print(tweet.id)
        print(dict_["Screen_Name"])
        print(dict_["Tweet_Created_At"])
    return listTweets

def user_scrape(creds):


    #users = ['@ewarren', '@KamalaHarris', '@AndrewYang', '@TulsiGabbard', '@PeteButtigieg', '@MikeBloomberg', '@tedcruz', '@SecretaryCarson', '@Mike_Pence', '@BernieSanders','@JoeBiden', '@realDonaldTrump']
    users = ['@realDonaldTrump']

    
    continue_prompt = 'y'
    max_id_set = 1207668878081478656

    #Connect to Mongo DB Atlas
    mongokey = creds['mongo']
    path = "mongodb+srv://thrum-rw:"+mongokey+"@thrumcluster-f2hkj.mongodb.net/test?retryWrites=true&w=majority"
    client = pymongo.MongoClient(path)
    db = client.twitter_thrum
    collection = db['userdata']
    print("The following collections are available: ", db.list_collection_names())


    while continue_prompt == 'y':

        a = 0
        while a > -1:

            keyword = itemgetter(a)(users)
            print(keyword)
            NumTweets = 3200

            listTweets = get_tweets(keyword, NumTweets, creds, max_id_set)
            try:
                max_id_set = int(listTweets[-1]["ID"])
                user_data = pd.DataFrame(listTweets)

                print(f'max id is {max_id_set}')


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
                #time.sleep(600)
            except:
                pass
            
        print('done')
        #continue_prompt = input("continue?(y/n)")

prompt = input("continue?")
user_scrape(creds)
