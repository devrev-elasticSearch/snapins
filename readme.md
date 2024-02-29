# Description of snap ins

For our hackathon project, we have considered three data sources
1. Reddit hot posts by subreddit
2. Twitter most recent posts in a specified timeframe by list of hashtags
3. Google playstore reviews for application.

We publish this data to a centralized where we run the clustering and insight generation software
We periodically generate tickets, that are ingested by a snapin with a command and a ticket is created on the 
devrev platform with the typescript sdk

We have considered the following snap ins
1. playstore_snap_in
2. reddit_snap_in
3. twitter_snap_in
4. ticket_creator_snap_in
5. other_tweets_snap_in

Each snap in used the following secrets
1. awsAccessKey - Access Key for AWS IAM User
2. awsSecretKey - Secret Key for AWS IAM User
3. regionName - Region Name for aws account

Each snap in has the following default inputs
1. default owner id
2. default part id
3. app_name - For the multi app system, this is the app name the client want to register. Not that this app name must be the same as the one registered on the dashboard

## playstore_snap_in

### Description
This snap in runs on a 5 minute timer and fetches the most recent reviews for an app on the playstore
It then forwards it for processing

### Snap in Inputs
1. app_id - App id of the application on the play store
2. queue_url - SQS queue to pusblish events

## reddit_snap_in

### Description
This snap in runs on a 10 minute timer and fetches hot posts for a subreddit on reddit
It then forwards it for processing

### snap in Inputs
1. subreddit - Subreddit to monitor for hot posts
2. queue_url - SQS queue to publish events

### snap in secrets
1. reddit client id 
2. reddit client secret

These are used to access the reddit api

## twitter_snap_in

### Description
This snap in runs on a 5 minute timer and fetches newest tweets on twitter
It then forwards it for processing

### snap in inputs
1. myhashtags - Comma separated list of hashtags - eg #Gpay,#googlepay
2. queue_url - SQS queue to publish events

### snap in secrets
1. rapid_api_key - Api key for accessing the Rapid Api twitter api

## ticket_creator_snap_in

### Description
This snap in defined a command that fetches already generated tickets from the data ingested by the other
snap ins

### snap in inputs
1. ticketUrl - Url for the sqs queue where the events are generated

### comamnds
/create-tickets :Count
Count is the maximum number of tickets to create
By default count is set to 1

## other_tweets_snap_in
This snap in fetches tweets based on a list of hashtags and exclusively finds feature requests. The idea is to monitor tweets for organizations within a common space like Google/Apple/Amazon pay, PhonePe. BharatPe etc for the payment and upi space This snap in uses fireworks llm library to classify the text. Tickets are then created on the Devrev Platform, the data is also published to a message queue so it can be consumed by our dashboard.

### snap in inputs
1. queue_url - Message queue to publish the messages

### Snap in secrets
1. fireworks_api_key - Api key for accessing fireworks llm models
2. google_api_key - Api key for accessing google translate api
3. rapid_api_key - Api key for accessing the Rapid Api twitter api

### comamnds
/other_features :Count
Count is the maximum number of tickets to create