var socket,
	isController = window.location.pathname.includes("controller"),
	isOverlays = window.location.pathname.includes("overlays"),
	isDrafting = window.location.pathname.includes("drafting");

function getRoot()
{
	return (window.location.pathname.includes('streameta/com') ? '/streameta/com/' : '/');
}

function log(exp)
{
	if (getRoot() != '/')
	{
		console.log(exp);
		// console.trace();
	}
}

function getDecoded(text)
{
	var area = document.createElement("textarea");
	area.innerHTML = text;
	return area.value;
}

function objToUrlEncode(element, key, list)
{
	var list = list || [];

	if (typeof element == 'object')
	{
		for (var idx in element)
		{
			objToUrlEncode(element[idx], key ? key+'['+idx+']' : idx, list);
		}
	}
	else
	{
		list.push(key+'='+encodeURIComponent(element));
	}
	return list.join('&');
}

function getQueryVariable(variable)
{
	var query = window.location.search.substring(1),
		vars = query.split("&");

	for (var i=0; i<vars.length; i++)
	{
		var pair = vars[i].split("=");

		if (pair[0] == variable)
		{
			return pair[1];
		}
	}

	return false;
}

function getParentOfType(target, query)
{
	while (target.parentElement != document.documentElement)
	{
		if (target.parentElement === null)
		{
			return null;
		}

		if (target.matches(query))
		{
			return target;
		}

		target = target.parentElement;
	}

	return false;
}

function getIndexOfType(child, query)
{
	var children = document.querySelectorAll(query);

	for (var i=0; i<children.length; i++)
	{
		if (children[i] == child)
		{
			return i;
		}
	}
}

function decodeHtmlEntity(str)
{
	return str.replace(/&#(\d+);/g, function(match, dec)
	{
		return String.fromCharCode(dec);
	});
}

function encodeHtmlEntity(str, codes = [])
{
	var buf = [];

	for (var i=str.length-1; i>=0; i--)
	{
		if (codes.length < 1 || codes.includes(str[i].charCodeAt()))
		{
			buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
		}
		else
		{
			buf.unshift(str.charAt(i));
		}
	}
	return buf.join('');
}

function clean(node/* = document.body*/)
{
	node = (typeof node !== 'undefined') ?	node : document.body;

	for (var i = 0; i < node.childNodes.length; i++)
	{
		var child = node.childNodes[i];

		if (child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue)))
		{
			node.removeChild(child);
			i--;
		}
		else if (child.nodeType === 1)
		{
			clean(child);
		}
	}

	if (node.tagName == "TEMPLATE")
	{
		clean(node.content);
	}
}

function formatDate(date)
{
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	var monthNames = [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			/*"January", "February", "March",
			"April", "May", "June", "July",
			"August", "September", "October",
			"November", "December"*/
		];

	return monthNames[monthIndex] + " " + day + ", " + year;
}

function fetchData(subset = "", set = true)
{
	if (isOverlays)
	{
		subset = "";
	}

	var token = "";

	if (!window.location.pathname.includes("controller"))
	{
		token = "?token=" + encodeURIComponent(document.documentElement.dataset.token);

		if (document.documentElement.dataset.overlay)
		{
			token += "&overlay=" + encodeURIComponent(document.documentElement.dataset.overlay);
		}
	}

	if (subset != "")
	{
		subset = (token == "" ? "?" : "&") + "subset=" + encodeURIComponent(subset);
	}

	return ajax("../api/" + token + subset, function (response)
	{
		var start = document.body,
			data = JSON.parse(response);

		log(data);

		if (isOverlays)
		{
			greyConditions(data);

			return data;
		}
		else if (isDrafting)
		{
			updateMaps(data);

			return data;
		}
		else
		{
			if (set)
			{
				setData(start, data);

				if (isController)
				{
					if (subset != "")
					{
						fetchData(undefined, false).then(syncInfo);
					}
					else
					{
						syncInfo(data);
					}

					winnerButton();
				}

				return data;
			}
			else
			{
				return data;
			}
		}
	});
}

function setData(parent, data)
{
	if (data instanceof Array)
	{
		var elemName = getArrayKey(parent),
			elems = getDescendantsByKey(parent, elemName);

		if (elems.length != data.length)
		{
			var elem, curParent;

			if (typeof dataType !== "undefined")
			{
				elem = dataType[elemName];
				curParent = parent;

				for (var i=elems.length; i<data.length; i++)
				{
					var clone = elem.cloneNode(true);
					curParent.appendChild(clone);
				}

				for (var i=elems.length-1; i>=data.length; i--)
				{
					curParent.removeChild(elems[i]);
				}
			}
			else
			{
				elem = elems[0];
				curParent = elem.parentElement;
				var plusminus = curParent.querySelector(":scope>.plusminus");

				for (var i=elems.length; i<data.length; i++)
				{
					// log(curParent.lastChild);
					add(plusminus);
				}

				for (var i=elems.length-1; i>=data.length; i--)
				{
					remove(plusminus);
				}
			}

			elems = getDescendantsByKey(parent, elemName);
		}

		for (var i=0; i<data.length; i++)
		{
			setData(elems[i], data[i]);
		}
	}
	else if (data instanceof Object)
	{
		for (var key in data)
		{
			var elem = getDescendantsByKey(parent, key, true);

			if (elem !== undefined)
			{
				setData(elem, data[key]);
			}

			if (key == "name")
			{
				var editname = getDescendantsByKey(parent, "editname", true);

				if (editname !== undefined)
				{
					setData(editname, data[key]);
				}
			}
		}
	}
	else
	{
		if (parent.dataset.input === undefined)
		{
			setValue(parent, data);
		}
	}
}

function getArrayKey(elem)
{
	return elem.dataset.type.slice(0, -1);
}

function getDescendantsByKey(parent, key, single/* = false*/)
{
	single = (typeof single !== 'undefined') ?	single : false;

	var descendants = [],
		queue = [parent];

	while (queue.length > 0 && queue[0] !== undefined)
	{
		var children = queue[0].children;

		for (var i = 0; i < children.length; i++)
		{
			if (children[i].dataset.type == key)
			{
				if (single)
				{
					return children[i];
				}
				else
				{
					descendants.push(children[i]);
				}
			}
			if (descendants.length == 0)
			{
				queue.push(children[i]);
			}
		}

		queue.shift();
	}

	if (!single)
	{
		return descendants;
	}
}

function clearChildren(elem, leave/*=0*/)
{
	leave = (typeof leave !== 'undefined') ?  leave : 0;

	while (elem.lastChild)
	{
		if (elem.lastChild == elem.children[leave-1])
		{
			break;
		}
		else
		{
			elem.removeChild(elem.lastChild);
		}
	}
}

function resizeText(e)
{
	var elem = e.currentTarget ? e.currentTarget : e;

	if (elem.id != "setsjson")
	{
		while (elem.scrollHeight == elem.clientHeight && elem.rows > 1)
		{
			elem.rows = elem.rows - 1;
		}

		while (elem.scrollHeight > elem.clientHeight)
		{
			elem.rows = elem.rows + 1;
		}
	}
}

function getDateStringFromDate(date)
{
    return date.toISOString().split('T')[0]
}


function resizeTexts()
{
	var textareas = document.querySelectorAll("textarea");

	for (var i = 0; i < textareas.length; i++)
	{
		resizeText(textareas[i]);
	}
}

function getCSSValue(key, value)
{
	var keyArr = key.split("-"),
		lastKey = keyArr[keyArr.length-1];

	switch (lastKey)
	{
		case "visibility":
			return (value === true || value == "true") ? "visible" : "hidden";
		case "display":
			return (value === true || value == "true") ? "inline" : "none";
		case "separator":
			// log("Value"+value);
			return "' " + value + " '";
		/*case "bracket":
			return "'" + value + "'";*/
		case "font":
			fonts[value] = true;
			return "'" + value + "'";
		case "image":
			return "url('../users/" + document.documentElement.dataset.overlay + "/images/" + value + "?v=" + Date.now() + "')";
	}

	return value;
}

function equalLower(string1, string2)
{
    if (string1.toLowerCase() == string2.toLowerCase())
    {return true}
    else {return false}
}

var SEC_IN_DAY = 60*60*24,
    SEC_IN_WEEK = SEC_IN_DAY*7,
    SEC_IN_MONTH = SEC_IN_DAY*30.4375,
    SEC_IN_YEAR = SEC_IN_DAY*365.25,
    MS_IN_DAYS = 1000*SEC_IN_DAY;

function getDate(date)
{
    if (typeof date !== 'object')
    {
        if (date < 3000)
        {
            date = "" + date;
        }

        return (date == "present" || date == "TBA" || !date) ? new Date() : new Date(date);
    }
    else
    {
        return date;
    }
}
function timeSince(date, to, approx, postfix)
{
    var fromDate = getDate(date),
        toDate = getDate(to),
        seconds = Math.floor((toDate - fromDate) / 1000),
        formatted = "",
        intervalType,
        interval = Math.floor(seconds / SEC_IN_YEAR),
        thresh = 1;

    if (interval >= thresh)
    {
        intervalType = "year";
    }
    else
    {
        interval = Math.floor(seconds / SEC_IN_MONTH);

        if (interval >= thresh)
        {
            intervalType = "month";
        }
        else
        {
            interval = Math.floor(seconds / SEC_IN_WEEK);

            if (interval >= thresh)
            {
                intervalType = "week";
            }
            else
            {
                interval = Math.floor(seconds / SEC_IN_DAY);

                if (interval >= thresh || postfix)
                {
                    intervalType = "day";
                }
                else
                {
                    return "present";
                }
            }
        }
    }

    if (interval > 1 || interval === 0)
    {
        intervalType += "s";
    }

    var postfix =  postfix || (to ? "old" : "ago"),
        formatted = approx ? "~" : "";

    return formatted + interval + " " + intervalType + " " + postfix;
}

const formatSetData = (string, player) => {
    let re = new RegExp("(.*) ([0-9]+) - (.*) ([0-9]+)");
    var temp;
    var result = re.exec(string);
    var p1 = result[1];
    var p1_score = parseInt(result[2]);
    var p2 = result[3];
    var p2_score = parseInt(result[4]);

    temp = p1.split("|");
    if (temp.length > 1){
       p1 = temp.slice(1).join('').trim();
    }
    temp = p2.split("|");
    if (temp.length > 1){
       p2 = temp.slice(1).join('').trim();
    }

    closest = difflib.getCloseMatches(player, [p1, p2]);
    player = closest[0];
    if (player == p1){
       var player_score = p1_score
       var opp_score = p2_score
       var opponent = p2
    }
    else {
      var player_score = p2_score
      var opp_score = p1_score
      var opponent = p1
    }

    if (player_score > opp_score){
      var symbol = "✔"
    }
    else {
      var symbol = "✗"
    }

    return `${player_score} - ${opp_score} ${symbol} ${opponent}`
};
