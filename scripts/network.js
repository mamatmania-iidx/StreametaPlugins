var socket;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function log(message){
	console.log(message)
}

function initWebsocket()
{
	var host,
		updateButton = document.querySelector("#update");

	if (location.protocol == "https:")
	{
		host = "wss://ws.streameta.com:443";
	}
	else
	{
		host = "ws://ns.streameta.com:9000";
	}

	socket = new WebSocket(host);

	socket.sendMsg = function(msg, rpt = 0)
	{
		if (this.readyState === this.OPEN)
		{
			this.send(msg);
		}
		/*else if (rpt < 2)
		{
			initWebsocket();
			fetchData();
			setTimeout(function(){ socket.sendMsg(msg, rpt+1); }, 2000);
		}*/
	};

	log('WebSocket - status '+socket.readyState);

	socket.onopen = function()
	{
		console.log("Welcome - status "+this.readyState);
		socket.send(streametaToken);
	};

	socket.onmessage = function(msg)
	{
		var data = msg.data;
        log(data);
        checkMessage(data)
	};

	socket.onclose = function()
	{
		log("Disconnected - status "+this.readyState);

		if (updateButton)
		{
			updateButton.dataset.status = "disconnected";
		}

		if (getRoot() != '/streameta/com/')
		{
			setTimeout(initWebsocket, 2000);
		}
	};
}

async function getStreametaApi(callback, subset=false)
{
	var api = `http://ns.streameta.com/api/?token=${streametaToken}`;
	if (subset){
		api = api + `&subset=${subset}`;
	}
	return $.get(api, callback)
}

async function ajax(url, callback, data = null, header = null, value = null)
{
	return new Promise(function (resolve, reject)
	{
		var method = (data !== null) ? "POST" : "GET",
			xhr = new XMLHttpRequest();

		if (callback !== undefined)
		{
			xhr.onreadystatechange = function()
			{
				if (this.readyState == xhr.DONE && this.status == 200)
				{
					resolve(callback(this.responseText));
					// setTimeout(resolve, 2000);
				}
			};
		}
		else
		{
			xhr.onload = function ()
			{
				resolve();
			}
		}

		xhr.open(method, url, true);

		// log(typeof data);

		if (typeof data === 'string')
		{
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}

        if (header != null)
        {
            xhr.setRequestHeader(header, value)
        }

		xhr.send(data);
	});
}