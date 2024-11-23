import  { Client } from '@opensearch-project/opensearch';
const openSearchClient = new Client({
  node : 'https://search-photos-domain-u4rqv7ulmgeipfl25av6qtflem.aos.us-east-1.on.aws',
  auth :{
      username: 'luffy5656',
      password: 'Zoro@1017#Sanji'
  }
})

export const handler = async (event) => {
  const session = event.sessionId;
  const intentName = event.sessionState?.intent?.name || 'UnknownIntent';
  const confirmStatus = event.sessionState?.intent?.confirmationState || "None";
  const sessionState = event.sessionState || {};
  const slots = event.sessionState?.intent?.slots || {};


  if (intentName == "SearchIntent"){
    console.log(slots);
    const values = Object.values(slots).map((term) => {
      const value = term?.value?.interpretedValue;
      return value != null ? value : "";
  }).filter(Boolean);
    console.log(values)
    const query = {
      query: {
        terms: {
          labels: values
        },
      },
    };

    const response = await openSearchClient.search({
      index: 'photos',
      body: query,
    });

    const val = response.body.hits.hits.map(hit => hit._source);
    console.log(val);
    const imageURLs = val.map(v => ({
      title: v.objectKey,
      imageURL: `https://${v.bucket}.s3.us-east-1.amazonaws.com/${v.objectKey}`,
      labels: v.labels
    }))

    console.log(imageURLs)

    if (val.length != 0){
      return {
        messages: [
            {
                contentType: 'PlainText',
                content: "Found"
            },
            {
              contentType: 'PlainText',
              content: JSON.stringify(imageURLs)
            }
          ],
        sessionState: {
            ...sessionState,
            dialogAction: {
                type: "Close",
            },
            intent: {
                name: intentName,
                state: "Fulfilled"
            },
            sessionId: session
        }
    };
    } else {
      return {
        messages: [
            {
                contentType: 'PlainText',
                content: "Not Found"
            }],
        sessionState: {
            ...sessionState,
            dialogAction: {
                type: "Close",
            },
            intent: {
                name: intentName,
                state: "Fulfilled"
            },
            sessionId: session
        }
    };
    }

    
  } else{
    return {
      messages: [
          {
              contentType: 'PlainText',
              content: "wrong Intent"
          }],
      sessionState: {
          ...sessionState,
          dialogAction: {
              type: "Close",
          },
          intent: {
              name: intentName,
              state: "Failed"
          },
          sessionId: session
      }
    }
  }
};

