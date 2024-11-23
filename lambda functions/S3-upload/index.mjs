import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-1" }); 

export const handler = async (event) => {
  try {
    const imageBase64 = event.image;
    const bucketName = event.bucket;
    const objectKey = event.object;
    const customLabels = event.customLabels;

    if (!imageBase64 || !bucketName || !objectKey) {
      throw new Error("Missing required parameters: imageBase64, bucketName, or objectKey.");
    }

    const customLabelsString = customLabels ? customLabels.join(",") : "";

    const imageBuffer = Buffer.from(imageBase64, "base64");

    const s3Params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: imageBuffer,
      ContentEncoding: "base64",
      Metadata: {
        "x-amz-meta-customlabels": customLabelsString 
      }
    };

    const command = new PutObjectCommand(s3Params);
    const s3Response = await s3Client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image uploaded successfully",
        resposne: s3Response
      })
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error uploading image",
        error: error.message
      })
    };
  }
};
