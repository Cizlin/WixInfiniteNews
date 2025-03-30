/*************************
backend/http-functions.js
*************************

'backend/http-functions.js' is a reserved Velo file that lets you expose APIs that respond to fetch requests from external services.

In this file you create APIs to expose the functionality of your site as a service. That is, other people can use 
the functionality of your site by writing code that calls your site's APIs, as defined by the functions you create here.

Using the provided code (below this comment block) as an example, users of your HTTP functions can call your API using the following patterns: 

Production endpoints:

 • Premium site:
   https://mysite.com/_functions/multiply?leftOperand=3&rightOperand=4
 • Free sites:
   https://username.wixsite.com/mysite/_functions/multiply?leftOperand=3&rightOperand=4

Test endpoints:
 • Premium sites:
   https://mysite.com/_functions-dev/multiply?leftOperand=3&rightOperand=4
 • Free sites:
   https://username.wixsite.com/mysite/_functions-dev/multiply?leftOperand=3&rightOperand=4

---
About HTTP functions: 
https://support.wix.com/en/article/velo-exposing-a-site-api-with-http-functions

API Reference:
https://www.wix.com/velo/reference/wix-http-functions

**********************/

import { ok, serverError, badRequest } from 'wix-http-functions';
import { secrets } from "wix-secrets-backend.v2";
import { elevate } from "wix-auth";
import wixFetch from 'wix-fetch';

import * as ApiConstants from 'public/Constants/ApiConstants.js';
import * as ApiFunctions from 'backend/ApiFunctions.jsw';

import hmac from 'js-crypto-hmac';

const elevatedGetSecretValue = elevate(secrets.getSecretValue);

// Define some simple default response objects
const defaultResponse = {
	headers: {
    	    "Content-Type": "application/json"
	},
};

const defaultInvalidAuthResponse = {
	...defaultResponse,
	body: {
    	    error: "Invalid authentication token"
	}
}

const hash = 'SHA-256';



export async function get_waypointProgressionGuideXoJson(request) {
  
    let options = {
        "headers": {
            "Content-Type": "application/json"
        }
    };

    let waypointApiHeaders = await ApiFunctions.makeWaypointHeaders();

    // query a collection to find matching items
    return await wixFetch.getJSON(ApiConstants.WAYPOINT_URL_GUIDE, { headers: waypointApiHeaders })
        .then((resultJson) => {
            options.body = resultJson
            return ok(options);
        })
        // something went wrong
        .catch((error) => {
            options.body = {
                "error": error
            };
            return serverError(options);
        });
}

export async function post_updateTwitchDrops(request) {
    const secretKey = await elevatedGetSecretValue("HMAC_SECRET_KEY");


    if(!request.headers.hasOwnProperty("in-access-sign") && !request.headers.hasOwnProperty("in-access-timestamp")) {
      console.log(request.headers);
      return badRequest(defaultInvalidAuthResponse)
    }
    else {
      try {
        const bodyText = await request.body.text();
        const message = request.headers["in-access-timestamp"] + request.method + request.url + bodyText;

        const generatedHash = await ApiFunctions.hmacGenerator(secretKey.value, message);
        if (generatedHash !== request.headers["in-access-sign"]) {
          return badRequest(defaultInvalidAuthResponse);
        }
        else {
          let options = {
            "headers": {
                  "Content-Type": "application/json"
              }
          };
      
          options.body = {"Good job": "You did it"};
          return ok(options);
        }
      }
      catch (e) {
        console.error("Error:" + e);
      }
    }
}