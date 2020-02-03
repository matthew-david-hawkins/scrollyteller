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

os.chdir(r"C:\Users\hawki\Documents\Drive\Thrum Engineering\Git\Thrum Engineering Portfolio\scrollyteller")
# Load credentials from json file:
with open("twitter_credentials.json", "r") as file:
    creds = json.load(file)

def hashtag_scrape():
    #Set up Tweepy Authentication
    auth = tweepy.OAuthHandler(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'])
    auth.set_access_token(creds['ACCESS_TOKEN'], creds['ACCESS_SECRET'])
    api = tweepy.API(auth)

    #Create List of hashtags:
    hashtags = ['#FeelTheBern', '#KeepAmericaGreat', '#TeamJoe', '#TeamWarren', '#YangGang', '#KamalaHarris', '#MikeBloomberg', '#TulsiGabbard', '#PeteButtigieg', '#TedCruz', '#BenCarson', '#MikePence']
    a = 11

    while a > -1:
        #Begin API Scrape
        listTweets = []
        x = 7
        y = 6

        while x > -1:
            today = DT.date.today()
            StartDt = today - DT.timedelta(days=x)
            EndDt = DT.date.today() - DT.timedelta(days=y)
            searchterm = itemgetter(a)(hashtags)
            keyword = searchterm+' since:'+str(StartDt)+' until:'+str(EndDt)+' -filter:retweets'
            NumTweets = 200

            def get_tweets(listTweets, keyword, NumTweets):
            # Iterate through all tweets containing the given word, api search mode
                for tweet in tweepy.Cursor(api.search, q=keyword, lang='en').items(NumTweets):
                # Add tweets in this format
                    dict_ = {'Screen_Name': tweet.user.screen_name,
                            'User_Name': tweet.user.name,
                            'Tweet_Created_At': str(DT_from_utc_to_local(tweet.created_at)),
                            'Tweet_Text': tweet.text,
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
            x = x - 1
            y = y - 1
            df  = pd.DataFrame(listTweets)
            df_all = pd.DataFrame()
            df_all = pd.concat([df_all, df])
            twitter_data = df_all

            #Clean Data
            twitter_data = twitter_data.sort_values('Tweet_Created_At').drop_duplicates('Screen_Name',keep='last')
            gc = geonamescache.GeonamesCache()
            s = gc.get_us_states()
            c = gc.get_cities()

            US_States = [s[key]['name'] 
                        for key in list(s.keys())]

            US_ST = [s[key]['code']+', USA' 
                        for key in list(s.keys())]

            US_Cities = [c[key]['name'] 
                        for key in list(c.keys()) if c[key]['countrycode'] == 'US']

            State = pd.DataFrame(US_States)

            ST = pd.DataFrame(US_ST)

            City = pd.DataFrame(US_Cities)

            df = pd.concat([State, ST, City])

            df.rename(columns={0:'Location'}, inplace=True)

            left_on = ["Location"]

            right_on = ["User_Location"]

            fuzzy_data = twitter_data[['User_Location']]
            fuzzy_data = fuzzy_data.dropna(subset=['User_Location'])
            fuzzy_data = fuzzy_data.drop_duplicates(subset=['User_Location'])
            fuzzy_data = fuzzymatcher.fuzzy_left_join(df, fuzzy_data, left_on, right_on)
            var_fuzzy = fuzzy_data['best_match_score'] > 0
            fuzzy_data = fuzzy_data[conjunction(var_fuzzy)]
            fuzzy_data = fuzzy_data[['User_Location']]
            fuzzy_data = fuzzy_data.drop_duplicates(subset=['User_Location'])
            twitter_data = pd.merge(twitter_data, fuzzy_data, how='inner', on=['User_Location', 'User_Location'])
            twitter_data = twitter_data[['Screen_Name','User_Name','Tweet_Text','Hashtags','Tweet_Created_At','Favorite_Count','Retweet_Count','Tweet_URL', 'User_Location']]

            #Add city coordinates to dataset and clean data further
            twitter_data = twitter_data.reset_index()
            key = creds['gkey']
            URL = 'https://maps.googleapis.com/maps/api/geocode/json'

            location = twitter_data[['User_Location']].drop_duplicates()
            location = location.reset_index()
            Var_Empty = location['User_Location'] != ''
            location = location[conjunction(Var_Empty)]
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
            twitter_data = twitter_data.merge(location, left_on='User_Location', right_on='User_Location')

            Var_0 = twitter_data['lat'] != 0
            twitter_data = twitter_data[conjunction(Var_0)]
            Var_USA = twitter_data['User_Location'] != 'USA'
            twitter_data = twitter_data[conjunction(Var_USA)]
            Var_US = twitter_data['User_Location'] != 'United States'
            twitter_data = twitter_data[conjunction(Var_US)]
            twitter_data = twitter_data[['Screen_Name','User_Name','Tweet_Text','Hashtags','Tweet_Created_At','Favorite_Count','Retweet_Count','Tweet_URL','User_Location','lat','long']]
            twitter_data['keyword'] = searchterm

            #Connect to Mongo DB Atlas
            mongokey = creds['mongo']
            path = "mongodb+srv://thrum-rw:"+mongokey+"@thrumcluster-f2hkj.mongodb.net/test?retryWrites=true&w=majority"
            client = pymongo.MongoClient(path)
            db = client.twitter_thrum
            collection = db['hashtag_data']

            print(twitter_data)
            #Only import records that do not exist in dataframe
            mongodata = pd.DataFrame(list(collection.find()))
            mongodata = mongodata[['Screen_Name','User_Name','Tweet_Text','Hashtags','Tweet_Created_At','Favorite_Count','Retweet_Count','Tweet_URL','User_Location','lat','long']]
            importdata = pd.merge(twitter_data, mongodata,  how='left', left_on=['Screen_Name','Tweet_Created_At'], right_on=['Screen_Name','Tweet_Created_At'])
            importdata['User_Name_y'] = importdata['User_Name_y'].fillna(0)
            var_is0 = importdata['User_Name_y'] == 0
            importdata = importdata[conjunction(var_is0)]
            importdata = importdata[['Screen_Name','User_Name_x','Tweet_Text_x','Hashtags_x','Tweet_Created_At','Favorite_Count_x','Retweet_Count_x','Tweet_URL_x','User_Location_x','lat_x','long_x','keyword']]
            importdata = importdata.rename(columns={"User_Name_x": "User_Name", "Tweet_Text_x": "Tweet_Text", "Hashtags_x": "Hashtags", "Favorite_Count_x": "Favorite_Count", "Retweet_Count_x": "Retweet_Count", "Tweet_URL_x": "Tweet_URL", "User_Location_x": "User_Location", "lat_x": "lat", "long_x": "long"})
            if importdata.empty:
                importdata.loc[len(importdata.index), 1] = 0
            #create json file
            records = json.loads(importdata.T.to_json()).values()
            #Insert Into Mongo
            collection.insert_many(records)
            a = a - 1
            time.sleep(3)
    print('done')
if __name__ == '__main__':
    hashtag_scrape()