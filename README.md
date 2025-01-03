﻿# Photo Album Web Application

This project is a photo album web application that allows users to upload photos and search them using natural language text. It leverages AWS services such as Lex, ElasticSearch, and Rekognition to create an intelligent search layer capable of querying photos.

## Contributors
- Yash Amin (yva2006)
- Anish Nimbalkar (an4338)

## Video submission link
- https://www.youtube.com/watch?v=wCgy6GzkaCw

## Features
1. **ElasticSearch Instance**: A domain named "photos" is created using AWS ElasticSearch service.
2. **Photo Upload & Indexing**: Photos are stored in an S3 bucket and indexed using a Lambda function triggered on uploads. Labels are detected using AWS Rekognition.
3. **Natural Language Search**: An Amazon Lex bot processes search queries, which are then used to search the ElasticSearch index.
4. **API Layer**: Built using API Gateway with methods for uploading photos and searching.
5. **Frontend Application**: Allows users to upload photos and perform search queries.
