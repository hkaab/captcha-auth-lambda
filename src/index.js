// Lambda Authorizer for Google reCAPTCHA v2
// This Lambda function verifies the reCAPTCHA token sent from the client
// and returns an IAM policy allowing or denying access to the API Gateway.

'use strict';

const https = require('https')

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-southeast-2'
});

// Create an SSM client to retrieve parameters from AWS Systems Manager Parameter Store
// Ensure that the Lambda function has the necessary permissions to access these parameters
// You can set the parameters in Parameter Store using the AWS Console or CLI
// The parameters should include the reCAPTCHA secret key and the verification URL
// Example parameters:
// - /google/captcha_secret_key: Your reCAPTCHA secret key
// - /google/google_captch_verification_url: The URL for reCAPTCHA verification
//   (usually "https://www.google.com/recaptcha/api/siteverify")
// Make sure to replace these with your actual parameter names if they differ
// The Lambda function will retrieve these parameters at runtime
// and use them to verify the reCAPTCHA token sent by the client.
// The Lambda function expects the reCAPTCHA token to be passed in the 'authorizationToken'
// field of the event object.
const parameterStore = new AWS.SSM();

const getParam = param => {
  return new Promise((res, rej) => {
    parameterStore.getParameter({
      Name: param
    }, (err, data) => {
        if (err) {
          return rej(err);
        }
        return res(data);
    });
  });
};

// The Lambda function handler is the entry point for the Lambda function
// It receives an event object containing the authorization token
// and context information, and it returns a callback with the policy document
// or an error message if the token is invalid
// The handler function is asynchronous and uses Promises to handle the parameter retrieval
// and reCAPTCHA verification process.
// The function first retrieves the reCAPTCHA secret key and verification URL from Parameter Store
// using the getParam function. It then calls the verifyCaptcha function to verify the token.
// If the verification is successful, it generates an IAM policy allowing access to the API Gateway 
// and returns it in the callback. If the verification fails, it returns an 'Unauthorized' error.
// The Lambda function is designed to be used as a custom authorizer for API Gateway,
// allowing you to protect your API endpoints with Google reCAPTCHA v2. 
exports.handler = async(event, context, callback) => {
    const token = event.authorizationToken;
    var result;
    
    // Check if the token is provided
    if (!token) {
        callback('Unauthorized');
        return;
    }
    // Retrieve the reCAPTCHA secret key and verification URL from Parameter Store
    // These parameters should be set in AWS Systems Manager Parameter Store
    // Ensure that the Lambda function has the necessary permissions to access these parameters
    // The parameters should include:
    // - /google/captcha_secret_key: Your reCAPTCHA secret key
    // - /google/google_captch_verification_url: The URL for reCAPTCHA  
    const captcha_secret_key = await getParam(`/google/captcha_secret_key`);
    const google_captch_verification_url = await getParam(`/google/google_captch_verification_url`);
    
    // Verify the reCAPTCHA token using the verifyCaptcha function
    // The function sends a POST request to the reCAPTCHA verification URL with the secret key
    // and the token provided in the authorizationToken field of the event object
    // If the verification is successful, it returns a response with the success status
    // If the verification fails, it throws an error which is caught and logged
    // The result of the verification is stored in the 'result' variable
    // The function returns a Promise that resolves with the verification result
    // or rejects with an error if the verification fails
    // The result is expected to be a JSON object with a 'success' field indicating the
    // success or failure of the reCAPTCHA verification
    // The Lambda function expects the reCAPTCHA token to be passed in the 'authorizationToken
    // field of the event object.
    // The function uses the https module to send a POST request to the reCAPTCHA verification
    // URL with the secret key and the token. It resolves the Promise with the response data
    // or rejects it with an error if the request fails.
    // The function is designed to be used as a custom authorizer for API Gateway,
    // allowing you to protect your API endpoints with Google reCAPTCHA v2.
    // The function is asynchronous and uses Promises to handle the parameter retrieval
    // and reCAPTCHA verification process.
    // The function expects the reCAPTCHA token to be passed in the 'authorizationToken'
    // field of the event object.
    // The function returns a callback with the policy document allowing access to the API Gateway  
    await verifyCaptcha(captcha_secret_key.Parameter.Value,google_captch_verification_url.Parameter.Value,token).then(r => result= r, e => console.log('error ' + e));
    
    const success=JSON.parse(result).success;
    if (success) {
        // If the reCAPTCHA verification is successful, generate an IAM policy allowing access
        // to the API Gateway resource specified in the event.methodArn
        // The policy is generated using the genPolicy function, which creates a policy document
        // with the specified effect (allow or deny) and the resource ARN
        // The policy document is returned in the callback along with a context object
        // The context object can be used to pass additional information to the API Gateway
        // The context object is optional and can include any custom data you want to pass
        // to the API Gateway or downstream services
        // In this case, the context object includes a simpleAuth field set to true
        // indicating that the authorization was successful
        // The policy document is structured according to the IAM policy format
        // and includes the version, statement, action, effect, and resource fields
        // The policy document allows the API Gateway to invoke the specified resource
        // The policy document is returned in the response object along with the context
        // The response object is structured according to the API Gateway custom authorizer response format
        // The response object includes the policyDocument field containing the IAM policy
        // and the context field containing the custom context data
        // The Lambda function is designed to be used as a custom authorizer for API Gateway,
        const policy = genPolicy('allow', event.methodArn);
        const context = {
            simpleAuth: true
        };
        const response = {
            policyDocument: policy,
            context: context
        };
        callback(null, response);
    }
    else {
        callback('Unauthorized');
    }
};

function genPolicy(effect, resource) {
    const policy = {};
    policy.Version = '2012-10-17';
    policy.Statement = [];
    const stmt = {};
    stmt.Action = 'execute-api:Invoke';
    stmt.Effect = effect;
    stmt.Resource = resource;
    policy.Statement.push(stmt);
    return policy;
}

function verifyCaptcha(captcha_secret_key,google_captch_verification_url,token) {
    return new Promise(function(resolve, reject) {


        const params = `?secret=${captcha_secret_key}&response=${token}`;
        

        const options = {
            hostname: 'www.google.com',
            port: 443,
            path: google_captch_verification_url+params,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', d => {
                resolve(d);
            });
        });

        req.on('error', error => {
            reject(error);
        });

         req.end();
    });
}
