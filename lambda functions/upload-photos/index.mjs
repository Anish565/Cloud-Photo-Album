import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import  { Client } from '@opensearch-project/opensearch';


const s3Client = new S3Client();
const rekognize = new RekognitionClient();
const openSearchClient = new Client({
  node: "https://search-photos-domain-u4rqv7ulmgeipfl25av6qtflem.aos.us-east-1.on.aws",
  auth: {
    username: "luffy5656",
    password: "Zoro@1017#Sanji"
  }
})

export const handler = async (event) => {

  console.log(event);

  console.log("Received event:", JSON.stringify(event, null, 2));

  
  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const tempkey = event.Records[0].s3.object.key;
    const key = decodeURIComponent(tempkey.replace(/\+/g, ' '));

    console.log("Bucket:", bucketName, "Key:", key);

    const input = {
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: key
        }
      },
      MaxLabels: 10
    };

    let rekognitionResponse;
    try {
      const detectLabelsCommand = new DetectLabelsCommand(input);
      rekognitionResponse = await rekognize.send(detectLabelsCommand);
    } catch (rekognitionError) {
      console.error("Error in Rekognition DetectLabels:", rekognitionError);
      throw new Error("Rekognition DetectLabels failed");
    }

    console.log("Rekognition Response:", rekognitionResponse);
    console.log("Labels:", rekognitionResponse.Labels); // Check Labels property
    
    const photoLabels = (rekognitionResponse.Labels || []).map(label => label.Name);
    console.log("Photo Labels:", photoLabels);

    const inputHead = {
      Bucket: bucketName,
      Key: key
    };

    const commandHead = new HeadObjectCommand(inputHead);
    const responseHead = await s3Client.send(commandHead);

    const customLabels = responseHead.Metadata['x-amz-meta-customlabels'] ? 
                        responseHead.Metadata['x-amz-meta-customlabels'].split(','):
                        [];

    const allLabels = [...customLabels, ...photoLabels].map(label => label.toLowerCase());

    
    console.log(allLabels)

    const document = {
      objectKey: key,
      bucket: bucketName,
      createdTimestamp: event.Records[0].eventTime,
      labels: allLabels
    }

    try{
      const response = await openSearchClient.index({
          index: 'photos',
          body: document
      });
      console.log("Inserted Successfully", response.body);
    } catch (error){
      console.log(error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error inserting the index",
          error: error.message
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Retrieved successfully",
        photoLabels: photoLabels
      })
    };
  } catch (error) {
    console.error("Error processing image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing the image",
        error: error.message
      })
    };
  }
};
