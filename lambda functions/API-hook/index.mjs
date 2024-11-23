import {LexRuntimeV2Client, RecognizeTextCommand} from "@aws-sdk/client-lex-runtime-v2";

const lexClient = new LexRuntimeV2Client({region: "us-east-1"});


export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Origin": "*"
  }
  try {
    console.log("Received event:", JSON.stringify(event, null, 2)); 
    const userMessage = event.queryStringParameters?.q;
    
    console.log(userMessage);

    console.log("-----------ab1-----------");

    if (!userMessage){
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({
          message: "Missing required query parameter 'q'"
        })
      }
    }
    console.log("-----------ab2-----------");
    const params = {
      botAliasId: "TSTALIASID",
      botId: "L4IIULZHEW",
      localeId: "en_US",
      text: userMessage,
      sessionId: "637423540591764"
     };
    const command = new RecognizeTextCommand(params);
    const lexResponse = await lexClient.send(command);
    
    console.log("-----------ab3-----------");
    
    console.log(lexResponse);
    const message = lexResponse.messages;
    console.log(message);
    if (message.length == 1){
      return {
        statusCode: 400,
        headers: headers,
      body: JSON.stringify({
        message: lexResponse.messages[0].content,
      })
    }
    }
    
    console.log("Found")
    var urls, retmessage
    try {
      console.log("-----------ab4-----------");
      retmessage = lexResponse.messages[0].content
      urls = JSON.parse(lexResponse.messages[1].content);
      console.log("found urls", urls);
      console.log("found message", message);
    } catch (error){
      console.log("-----------ab5-----------");
      console.log(error.message)
    }
    console.log("-----------ab6-----------");
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        message: retmessage,
        URLS: urls
      })
  }
 } catch (error){
  console.log(error.message)
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ message: error.message })
    }
  }
}
