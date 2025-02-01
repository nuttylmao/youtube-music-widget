const appId = "nuttys-ytmdesktop-widget";
const appName = "nuttys YouTube Music Widget";
const appVersion = "1.0.0";
const baseURL = "http://nuttylmao.github.io/youtube-music-widget";

let browserSourceURL = ""

// Request a four digit authentication code
async function RequestCode() {
	const response = await fetch("http://localhost:9863/api/v1/auth/requestcode", {
		method: "POST",
		body: JSON.stringify({
			"appId": appId,
			"appName": appName,
			"appVersion": appVersion
		}),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})
	
	const responseData = await response.json();
	console.debug(responseData);
	if (responseData.hasOwnProperty("statusCode"))
	{
		document.getElementById("errorCode").innerHTML = responseData.statusCode;
		document.getElementById("errorMessage").innerHTML = responseData.message;
	}
	else
		return await responseData;
}

// Wait for the user to accept the code and return them an access token
async function RequestToken() {
	const requestCode = await RequestCode();
	const authCode = requestCode.code;
	console.debug(`Auth Code: ${authCode}`);
	document.getElementById("authorizationCode").innerHTML = authCode;

	const response = await fetch("http://localhost:9863/api/v1/auth/request", {
		method: "POST",
		body: JSON.stringify({
			"appId": appId,
			"code": authCode
		}),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})

	const responseData = await response.json();
	if (responseData.hasOwnProperty("statusCode"))
	{
		document.getElementById("errorCode").innerHTML = responseData.statusCode;
		document.getElementById("errorMessage").innerHTML = responseData.message;
	}

	const token = responseData.token;
	console.debug(`Token: ${token}`);
	//browserSourceURL = `${baseURL}?token=${token}`;
	
	browserSourceURL = window.location.href;
	console.log(browserSourceURL);
	document.getElementById("copyURLButton").disabled = false;

	return await responseData; 
}

function CopyToURL() {
	//navigator.clipboard.writeText(browserSourceURL);
	console.log(`Browser URL ${browserSourceURL}`);
}