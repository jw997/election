async function getJson(url) {
	try {
		const response = await fetch(url); // {cache: 'no-cache'} https://hacks.mozilla.org/2016/03/referrer-and-cache-control-apis-for-fetch/
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const json = await response.json();
		return json;
	} catch (error) {
		console.error(error.message);
	}
}

var tempData = new Map();
tempData.set("200100",51.79);
tempData.set("200200",54.04);
tempData.set("201400",58.64);
tempData.set("202200",64.38);
tempData.set("202500",64.5);
tempData.set("202620",65.7);
tempData.set("203100",59.26);
tempData.set("203500",66.43);
tempData.set("203800",65.87);
tempData.set("203880",73.91);
tempData.set("203890",50.0);
tempData.set("204210",63.18);
tempData.set("204300",64.57);
tempData.set("204900",67.78);
tempData.set("205200",56.86);
tempData.set("205700",54.03);
tempData.set("206200",63.9);
tempData.set("206900",66.22);
tempData.set("207000",56.46);
tempData.set("207200",63.21);
tempData.set("207700",66.18);
tempData.set("208010",61.1);
tempData.set("208300",65.55);
tempData.set("208510",65.6);
tempData.set("208690",56.52);
tempData.set("208800",63.92);
tempData.set("208820",64.68);
tempData.set("208900",66.48);
tempData.set("209010",63.24);
tempData.set("209310",58.2);
tempData.set("209700",58.24);
tempData.set("209900",62.94);
export {getJson,tempData};
