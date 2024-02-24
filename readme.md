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

Each snap in used the following secrets
1. awsAccessKey - Access Key for AWS IAM User
2. awsSecretKey - Secret Key for AWS IAM User
3. regionName - Region Name for aws account

Each snap in has the following default inputs
1. default owner id
2. default part id

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
1. Rapid api key

## ticket_creator_snap_in

### Description
This snap in defined a command that fetches already generated tickets from the data ingested by the other
snap ins

### snap in inputs
1. ticketUrl - Url for the sqs queue where the events are generated

### comamnds
/create-tickets :Count
Count is the number of tickets to create
By default count is set to 1

