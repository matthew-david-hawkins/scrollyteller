################################################
# Overview

# /
# Home page.
# This page is a the html which uses javascript and css to run the leaflet and scrollama applications.

################################################
from pymongo import MongoClient
import pymongo
from flask import Flask, jsonify, render_template


app = Flask(__name__)

# Connect to Mongo DB Atlas

deployment_matt = "mongodb+srv://thrum-rw:Skipshot1@thrumcluster-f2hkj.mongodb.net/test?retryWrites=true&w=majority"
deployment_victor = "mongodb+srv://vgalst:akopova123@tweetering-giclm.mongodb.net/test?retryWrites=true&w=majority"
testing = "mongodb://localhost:27017/myDatabase"

client = pymongo.MongoClient(deployment_victor)
db = client.twitter
serverStatusResult = db.command("serverStatus")
if serverStatusResult:
    print("""
Connection to MongoDB was successful
    """)
    print("The following collections are available: ", db.list_collection_names())


@app.route("/")
def index():

    # Render the template. See javascript files for functionality
    return render_template("index.html")

if __name__ == '__main__':

    app.run(debug=True)
