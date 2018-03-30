// participants list
var participants = [];
// callback counters for steemit api
var callbackCounter = 0;
var expectedCallbackCounter = 0;
var addedEntrys = 0;
// callback interval checker
var handleInterval;


/* new participant constructor*/
function newParticipant(name, lose, pburl) {
	var teilnehmer = {};
    if (lose !== undefined) {
    	teilnehmer["lose"] = lose;
    }
    if (pburl !== undefined) {
    	teilnehmer["pburl"] = pburl;
    }
  	if (name !== undefined) {
    	teilnehmer["name"] = name;
    }
    return teilnehmer;
}

/* Adds a new participant to the participants list */
function addParticipant(participant) {
	var alreadyInList = false;
	for (var i = 0; i < participants.length; i++) {
	    if (participants[i].name === participant.name) {
            alreadyInList = true;
            break;
        }
    }
    if (!alreadyInList) {
        participants.push(participant);
    } else {
        if (window.location.href.indexOf("/en/") == -1) {
            // German notification error
            placeNotification("Fehler!", "<p>Teilnehmer " + participant.name + " bereits in Liste vorhanden!</p>");
        } else {
            placeNotification("Error!", "<p>Participant " + participant.name + " is already in the participants list!</p>");
        }
    }
}

// add stemian
var knopf = document.getElementById("knopf");
knopf.addEventListener("click", function(){
	// get field
    var field = document.getElementById("teilnehmer");
    var fieldvalue = field.value;
    // clear field
    field.value = "";
    // add participant to the list
    if (fieldvalue != undefined && fieldvalue.length > 0) {
        var participant = newParticipant(fieldvalue);
        addParticipant(participant);
    }
    // liste darstellen
    stelleListedar();
});

var loeschenknopf = document.getElementById("loeschen");
loeschenknopf.addEventListener("click", function(){
    listeLeeren();
});

function listeLeeren() {
    participants = [];
    sichtbareListeLeeren();
}

function sichtbareListeLeeren () {
    var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
    while (guiTeilnehmerliste.firstChild) {
        guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
    }
}
// deletes the participant by index
function loescheEintrag (index) {
    participants.splice(index, 1);
    stelleListedar();
}

// deletes the participant by name from the given collection
function deleteByName(name, collection) {
    for (var i = 0; i < collection.length; i++) {
        if (collection[i].name === name) {
            collection.splice(i, 1);
            i = -1;
        }
    }
    return collection;
}

function stelleListedar() {
	 // ul liste holen
    var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
    // ul liste leeren
    while (guiTeilnehmerliste.firstChild) {
        guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
  	}
    // ul liste füllen
    for (var i = 0; i < participants.length; i++) {
  		var li = document.createElement("li");
  		var textKnoten = document.createTextNode(participants[i].name);
  	 	li.appendChild(textKnoten);
        // remove x an li hängen
        var span = document.createElement("span");
        var txt = document.createTextNode("x");
        span.className = "delete";
        span.appendChild(txt);
        li.appendChild(span);
        // li mit data index ausstatten
        li.setAttribute('data-array-index', i);
        // li in gui platzieren
        guiTeilnehmerliste.appendChild(li);
  	}
    
    // deletes funktion anhängen
    var deletes = document.getElementsByClassName("delete");
  	for (var j = 0; j < deletes .length; j++) {
    	    deletes [j].onclick = function() {
    	    var eintrag = this.parentElement;  // auf das LI zugreifen
    	    var referenz = eintrag.getAttribute('data-array-index');
    	    loescheEintrag(referenz);
    	};
    }
}

/* determine the winners  */
var ermittelnKnopf = document.getElementById("ermitteln");
ermittelnKnopf.addEventListener("click", function(){
    var anzahlGewinner = document.getElementById("anzahlGewinner");
    var wert = anzahlGewinner.value;
    var winners = [];
    var lostopf = generiereLostopf();
    var allowMultipleWinning = document.getElementById("allowMultipleWinning").checked;
	for (var i = 0; i < wert; i++) {
	    var winner = giveRandomItem(lostopf);
	    winners.push(winner);
	    if (!allowMultipleWinning) {
	        lostopf = deleteByName(winner.name, lostopf);
	        if (lostopf.length === 0) {
	            break;
	        }
	    }
	}
    // generate winnerstring
	var gewinnerString = "";
	for (var i = 0; i < winners.length; i++) {
	    gewinnerString += "<br>" + winners[i].name;
	}
	
	if (window.location.href.indexOf("/en/") == -1) {
	    // German notification 
	    if (wert == 1) {
	        placeNotification("Gl&uuml;ckwunsch!", "<p>Der Gewinner ist: " + gewinnerString + "</p>");
	    } else {
	        placeNotification("Gl&uuml;ckwunsch!", "<p>Die Gewinner sind: " + gewinnerString + "</p>");
	    }
	} else {
	    if (wert == 1) {
	        placeNotification("Congrantulations!", "<p>The winner is " + gewinnerString + " !</p>");
	    } else {
	        placeNotification("Congrantulations!", "<p>The winners are " + gewinnerString + " !</p>");
	    }
	}
});

// Returns a random item from a given array
function giveRandomItem (array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Generates the lottery pot, based on the amount of tickets each participant has
function generiereLostopf() {
    var lostopf = [];
    for (var i = 0; i < participants.length; i++) {
        var teilnehmer = participants[i];
        var lose = 1;
        if (teilnehmer.lose != undefined) {
            var lose = teilnehmer.lose;
        }
        for (var j = 0; j < lose; j++) {
            lostopf.push(teilnehmer);
        }
    }
    return lostopf;
}

// Feedback how many new Entries got added
function addedParticipantsNotification(amount) {
    if (window.location.href.indexOf("/en/") == -1) {
        // German notification 
        placeNotification("Hinweis", "<p>Es wurden insgesammt " + amount + " Eintr&auml;ge der Liste hinzugef&uuml;gt!</p>");
    } else {
        placeNotification("Hint", "<p>A total of " + amount + " participants got added to the list!</p>");
    }
}

// loading status notification
function loadStatusNotification() {
    if (window.location.href.indexOf("/en/") == -1) {
        // German notification 
        placeNotification("Bitte haben Sie einen Moment Geduld", '<div id="loadstatusSection"><div class="circle0 circle"></div><div class="circle1 circle"></div><div class="circle2 circle"></div><div class="circle3 circle"></div><div class="circle4 circle"></div><div class="circle5 circle"></div><div class="circle6 circle"></div><div class="circle7 circle"></div><div class="circle8 circle"></div><div class="circle9 circle"></div></div><p>Die Daten werden ermittelt, bitte warten...</p>');
    } else {
        placeNotification("Please be patient", '<div id="loadstatusSection"><div class="circle0 circle"></div><div class="circle1 circle"></div><div class="circle2 circle"></div><div class="circle3 circle"></div><div class="circle4 circle"></div><div class="circle5 circle"></div><div class="circle6 circle"></div><div class="circle7 circle"></div><div class="circle8 circle"></div><div class="circle9 circle"></div></div><p>Processing Data, please wait...</p>');
    }
}

/* Notification erstellen */
function placeNotification(headline, content) {
    // scroll to top
    window.scrollTo(0,0);
    removeNotifications();
    var notification = document.createElement("div");
    // fill notification content string
    var tempElementString = "";
    tempElementString += "<div id='notification' class='notification'>";
    tempElementString +=    "<div class='content-wrapper'>";
    tempElementString +=        "<div class='content'>";
    tempElementString +=            "<h3>"+ headline +"</h3>";
    tempElementString +=            content;
    tempElementString +=        "</div>";
    tempElementString +=        "<div class='action'>";
    tempElementString +=            "<a href='#' id='closeNotification' title='OK'>OK</a>";
    tempElementString +=        "</div>";
    tempElementString +=    "</div>";
    tempElementString += "</div>";
    notification.innerHTML = tempElementString;
    document.body.appendChild(notification);
    // add close on action
    var close = document.getElementById("closeNotification");
    close.addEventListener("click", function () {
        var temp = document.getElementById("notification");
        temp.parentNode.removeChild(temp);
    });
}

function removeNotifications() {
    var notifications = document.getElementsByClassName("notification");
    for (var i = 0; i < notifications.length; i++) {
        var temp = notifications[i];
        temp.parentNode.removeChild(temp);
    }
}

/* Form evaluation */
var form = document.getElementById("dataForm");
form.addEventListener("submit", function () {
    event.preventDefault();
    // get option config
    var getUpvoters = document.getElementById("upvoterCheckbox").checked;
    var getCommentators = document.getElementById("commentorCheckbox").checked;
    var getResteemer = document.getElementById("reestemerCheckbox").checked;
    // get post data
    var regex = new RegExp("@([a-z]+)\/([^\/]+)$");
    var ulink = document.getElementById("postlink").value;
    if (ulink != undefined && ulink.length > 0) {
        var author = ulink.match(regex)[1];
        var link = ulink.match(regex)[2];
    }
    if ((getUpvoters || getCommentators || getResteemer) && author != undefined && author != "") {
        loadStatusNotification();
        // get upvoters
        if (getUpvoters) {
            expectedCallbackCounter++;
            steem.api.getActiveVotes(author, link, function (err, result) {
                if (result != undefined) {
                    var length = result.length;
                    for (var i = 0; i < length; i++) {
                        var neu = newParticipant(result[i].voter);
                        addParticipant(neu);
                    }
                    addedEntrys += length;
                }
                callbackCounter++;
            });
        }
        // get commentators
        if (getCommentators) {
            expectedCallbackCounter++;
            steem.api.getContentReplies(author, link, function (err, result) {
                if (result != undefined) {
                    var length = result.length;
                    for (var i = 0; i < length; i++) {
                        var neu = newParticipant(result[i].author);
                        addParticipant(neu);
                    }
                    addedEntrys += length;
                }
                callbackCounter++;
            });
        }
        // get reestemers
        if (getResteemer) {
            expectedCallbackCounter++;
            steem.api.getRebloggedBy(author, link, function (err, result) {
                if (result != undefined) {
                    var length = result.length;
                    for (var i = 0; i < length; i++) {
                        // exclude the author from his own post
                        if (author != result[i]) {
                            var neu = newParticipant(result[i]);
                            addParticipant(neu);
                        }
                    }
                    // correct result length if author was within list
                    for (var i = 0; i < result.length; i++) {
                        if (author == result[i]) {
                            length -= 1;
                        }
                    }
                    addedEntrys += length;
                }
                callbackCounter++;
            });
        }
        // start interval, which checks status of variables. if reached, clear interval by itself and show list
        handleInterval = setInterval(checkStatus, 50);
    } 
});

// interval status checker for steemit callback actions
function checkStatus() {
    if (callbackCounter == expectedCallbackCounter) {
        clearInterval(handleInterval);
        addedParticipantsNotification(addedEntrys);
        stelleListedar();
        // reset variables
        callbackCounter = 0;
        expectedCallbackCounter = 0;
        addedEntrys = 0;
    }
}

/* tabnav functionality */
var navbuttons = document.querySelectorAll("nav button");
var tabcontents = document.querySelectorAll(".tab-content");
navbuttons.forEach(function (elem) {
    elem.addEventListener("click", function (element) {
        var toShow = element.target.id;
        toShow = toShow.replace("tab-", "tab-content-");
        // remove active class on navbuttons
        navbuttons.forEach(function (e) {
            e.classList.remove("active");
        });
        // remove active class on tabcontent
        tabcontents.forEach(function (e) {
            e.classList.remove("active");
        });
        // set active classes
        element.target.classList.add("active");
        document.getElementById(toShow).classList.add("active");
    });
});