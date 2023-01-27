// ==UserScript==
// @name         TESTtimer2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.prolific.co/studies*
// @require      https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
// @require      https://code.jquery.com/jquery-3.6.3.js
// @require      https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js
// @resource     https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==
let hourlyRate = "<center>-</center>";
let currentTimeStamp = Date.now();
let reserveButtonClicked = false;
let titleLatest = " ";
let taskPayInGBP = 0;
let timer = "00:00";
let elapsedTime = 0;
let clock = false;
let startTime = 0;
let exchangeRate;
let endTime = 0;
let title = " ";
let taskVariables;


function localStoreGet()
{
	console.log("localStoreGet")
	exchangeRate = localStorage.getItem("exchangeRate");
	let timestamp = localStorage.getItem("timestamp");
	if (currentTimeStamp - timestamp > 24 * 60 * 60 * 1000)
	{
		getExchangeRate()
		console.log("get exchange rate")
	}
	else
	{
		console.log("not getting exhange rate")
		return exchangeRate;
	}
};
localStoreGet();


function getExchangeRate()
{
	console.log("getExchangeRate")
	var requestURL = 'https://api.exchangerate.host/convert?from=GBP&to=USD';
	var request = new XMLHttpRequest();
	request.open('GET', requestURL);
	console.log("apirequest")
	request.responseType = 'json';
	request.send();
	request.onload = function ()
	{
		if (request.status === 200)
		{
			var response = request.response;
			exchangeRate = response.info.rate;
			console.log(exchangeRate);
			localStoreSet()
			return exchangeRate;
		}
	}
}


function localStoreSet(exchangeRateString)
{
	console.log(exchangeRate + "  localStoreSet");
	localStorage.setItem("exchangeRate", exchangeRate);
	localStorage.setItem("timestamp", JSON.stringify(currentTimeStamp));
}


function calculateHourly(exchangeRateString, elapsedTimeString)
{
	let taskPayInGBP1 = document.querySelector('[data-testid="study-tag-reward"]');
	let taskPayInGBP2 = taskPayInGBP1.textContent.replace('£', '');
	let exchangeRate1 = parseFloat(exchangeRate);
	let taskPayInUSD = taskPayInGBP2 * exchangeRate1;
	let hourlyRate1 = taskPayInUSD / (elapsedTime / 1000 / 60 / 60);
	let hourlyRate = hourlyRate1.toFixed(2)

	return hourlyRate;

}
//calculateHourly()


function stopClock()
{
	clock = false;
    document.title = "Prolific"
}


const getTaskInfoPre = function () {
  console.log("getTaskInfoPre");
  document.arrive('[data-testid="study-tag-reward"]', function () {
    getTaskInfo()
  })


function getTaskInfo() {
    console.log("getTaskInfo");
    let rewardElem = document.querySelector('[data-testid="study-tag-reward"]');
    let reward = rewardElem.innerText;
    console.log(reward)

    let requesterElem = document.querySelector('[data-testid="host"]');
    let requesterElemLong = requesterElem.innerText;
    let requester = requesterElemLong.substring(3);
    console.log(requester);

    let titleElem = document.querySelector('[data-testid="title"]');
    let title = titleElem.innerText;
    console.log(title);

    taskVariables = {
        title,
        reward,
        requester
    }
     //latestSubmission({taskVariables})
     // clearVariables({ taskVariables})
    console.log("task variables creation   " + taskVariables.title)
  }
}


function resetReserveButton()
{
	console.log("reserve reset")
	let reserveButton = document.querySelector('[data-testid="reserve"]');
	if (reserveButton)
	{ console.log("reserve if")
		reserveButton.removeEventListener("click", function ()
		{
			reserveButtonClicked = false;
		});
	}
}


function clockMath()
{
	//console.log("math")
	let minutes = Math.floor((elapsedTime / 1000 / 60) % 60);
	let seconds = Math.floor((elapsedTime / 1000) % 60);
	//console.log(minutes, seconds)
	if (minutes < 10)
	{
		minutes = "0" + minutes;
	}
	if (seconds < 10)
	{
		seconds = "0" + seconds;
	}
	timer = `${minutes}:${seconds}`;
	return timer;
}


const updateTimerDisplay = async () => {
  const [timer, hourlyRate] = await Promise.all([clockMath(), calculateHourly()]);
  if (clock) {
    $("#timer").html("<a href='#' data-toggle='tooltip' data-html='true' data-placement='left' title="+titleLatest+"><center>"+ timer + "<br>" + hourlyRate +"</center></a>​");
  }
}

/*

function testFunction({title, reward, requester}){
  console.log("testFunction");
  console.log("variable test", title, reward, requester);
}
*/

function latestSubmission(taskVariables){
    console.log("latest submissions");
    if(taskVariables){
        console.log('latest submissions if')
   let titleLatest = taskVariables.title;
   let requesterLatest = taskVariables.requester;
   let rewardLatest = taskVariables.reward;
   let latestTaskVariables = {
        titleLatest,
        rewardLatest,
        requesterLatest
    }
     console.log("taskvariables test  "+titleLatest+"  "+requesterLatest+"   "+rewardLatest)
        upDateToolTip(latestTaskVariables);
        clearVariables(taskVariables);
        return titleLatest;
   }}



function clearVariables(taskVariables){
    console.log("clearVariables init")
    if(taskVariables){
        console.log("clearVariables if")
let title = taskVariables.title;
let reward = taskVariables.reward;
let requester = taskVariables.requester;
console.log("clearvariables1 test " + title + " " + reward + " " + requester);
    if(title){
	title = "";}
 if(reward){
	reward = "";}
 if (requester){
	requester = "";}
	console.log("clearvariables2 test " + title + " " + reward + " " + requester);
}}


function clockReset()
{
	timer = "00:00";
}


function timerTabOn(){
document.title = timer;
}


function upDateToolTip (latestTaskVariables){
console.log("tooltip");
$("#timer").html("<a href='#' data-toggle='tooltip' data-html='true' data-placement='left' title='" + latestTaskVariables.titleLatest.replace(/'/g, "&#39;") + "    " + latestTaskVariables.rewardLatest.replace(/'/g, "&#39;") + '   ' + latestTaskVariables.requesterLatest.replace(/'/g, "&#39;") + "'><center>" + timer + '   $' + hourlyRate + "/hr</center></a>");
}



/********************************************************************************************************************************/


document.arrive(".help-centre", function ()
{  $("timer").tooltip({ selector: '[data-toggle=tooltip]',  });

	console.log("arrive help centre")
	let anchor = document.getElementsByClassName("nav-link help-centre")[0];
	let anchorElement = anchor.parentNode;
	let timerDiv = document.createElement("div");
	timerDiv.id = "timer";
	timerDiv.innerHTML = "<a href='#' data-toggle='tooltip' data-placement='left' title=Timer"+titleLatest+"><center>"+ timer + "<br>" + hourlyRate +"</center></a>"
 
    timerDiv.style.paddingTop = "5px"
    timerDiv.style.paddingBottom = "5px"
    timerDiv.style.paddingLeft = "20px"
    timerDiv.style.paddingRight = "20px"
	timerDiv.style.boxShadow = "2px 2px 4px #888888";
	timerDiv.style.background = "#FFFFFF";
	timerDiv.style.opacity = "0.75";
	anchorElement.insertBefore(timerDiv, anchor);
	
})


/********************************************************************************************************************************/


console.log(clock + " before");
const startTimer = async () =>
{
	const hourlyRate = await calculateHourly()
	console.log("startTimer" + hourlyRate, startTime, elapsedTime);
	clock = true;
	console.log(clock + " after");
	startTime = new Date();
	let timerInterval = setInterval(function ()
	{
		elapsedTime = new Date() - startTime;

        if (clock)
		{
			updateTimerDisplay();
            timerTabOn();
			;
			return elapsedTime;
		}
	}, 1000);
}


document.arrive('[data-testid="dialog-start-study"]', function ()
{
	console.log("found startbutton")
	let startButton = document.querySelector('[data-testid="dialog-start-study"]');
	startButton.addEventListener("click", function ()
	{
		clockReset();
		clock = true;
		startTimer();

	})
})


document.arrive('[data-testid="reserve"]', function ()

	{const greeting = new Notification('reserve found');
		console.log("found reservebutton");

		let reserveButtons = document.querySelectorAll('[data-testid="reserve"]');

		for (let i = 0; i < reserveButtons.length; i++)
		{
			reserveButtons[i].addEventListener("click", function ()
			{
				console.log("clicked reservebutton");
				reserveButtonClicked = true;
				resetReserveButton()
				getTaskInfoPre()
			});
	}})




document.arrive('[data-testid="complete-button"]', function () {
	console.log("found completebutton")
    let completeButton = document.querySelector('[data-testid="complete-button"]');
    completeButton.addEventListener("click", function () {
latestSubmission(taskVariables);
		stopClock();
      })
})


document.arrive('[data-testid="cancel-reservation"]', function () {
    let cancelResButton = document.querySelector('[data-testid="cancel-reservation"]');
    cancelResButton.addEventListener("click", function (){
	resetReserveButton();
       latestSubmission(taskVariables);
      stopClock();  
	console.log("found cancelresbutton");
	})
});



document.arrive('[data-testid="cancel-study-button"]', function () {
	console.log("found cancelstudybutton")
	let cancelButton = document.querySelector('[data-testid="cancel-study-button"]');
	cancelButton.addEventListener("click", function () {
        console.log("cancel pressed")
 latestSubmission(taskVariables)
		stopClock();
        })
});




document.arrive('h2.title[data-v-47af0476=""]', function () {
	resetReserveButton()
	console.log("found autocomplete")
	let autoCompleteIndicator = document.querySelector('h2.title[data-v-47af0476=""]');
	if (autoCompleteIndicator && autoCompleteIndicator.textContent === "Awaiting review") {
        console.log("autocomplete submission")
		latestSubmission(taskVariables);
        stopClock();
        }
});


document.arrive('h2.title[data-v-82025cd6=""]', function () {
	console.log("found expiration")
	let expirationIndicator = document.querySelector('h2.title[data-v-82025cd6=""]');
	if (expirationIndicator && expirationIndicator.textContent === "Reservation expired") {
		stopClock();
         latestSubmission(taskVariables)
       }
});
