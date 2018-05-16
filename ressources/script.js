// participants list
var participants = [];
// winner list
var winnersObjectArray = [];
// callback counters for steemit api
var callbackCounter = 0;
var expectedCallbackCounter = 0;
var addedEntrys = 0;
// callback interval checker
var handleInterval;


/* new participant constructor*/
function newParticipant(name, didvote, didcomment, didresteem) {
    var participant = {
        didcomment: false,
        didvote: false,
        didresteem: false
    };
  	if (name !== undefined) {
  	    participant["name"] = name;
  	}
  	if (didvote !== undefined) {
  	    participant["didvote"] = didvote;
  	}
  	if (didcomment !== undefined) {
  	    participant["didcomment"] = didcomment;
  	}
  	if (didresteem !== undefined) {
  	    participant["didresteem"] = didresteem;
  	}
  	return participant;
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
        participants[i] = mergeParticipantAction(participant, participants[i]);
        if (window.location.href.indexOf("/en/") == -1) {
            // German notification error
            placeNotification("Fehler!", "<p>Teilnehmer " + participant.name + " bereits in Liste vorhanden!</p>");
        } else {
            placeNotification("Error!", "<p>Participant " + participant.name + " is already in the participants list!</p>");
        }
    }
}
/* Merges the data of the two participants, to get all useractiondata; returns the merge dataset */
function mergeParticipantAction(a, b) {
    if (a.didvote != b.didvote) {
        a.didvote = true;
    }
    if (a.didcomment !== b.didcomment) {
        a.didcomment = true;
    }
    if (a.didresteem !== b.didresteem) {
        a.didresteem = true;
    }
    return a;
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

    /*
	 // store reference to table
    var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
    // clear table
    while (guiTeilnehmerliste.firstChild) {
        guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
  	}
    // fill table
    for (var i = 0; i < participants.length; i++) {
        var tr = document.createElement("tr");
  		var td = document.createElement("td");
  		var textKnoten = document.createTextNode(participants[i].name);
  		td.appendChild(textKnoten);
        // show useractions
  		if (participants[i].didvote) {
  		    td.insertAdjacentHTML('beforeend', upvotesvg);
  		}
  		if (participants[i].didcomment) {
  		    td.insertAdjacentHTML('beforeend', commentsvg);
  		}
  		if (participants[i].didresteem) {
  		    td.insertAdjacentHTML('beforeend', resteemsvg);
  		}

        // remove x an td hängen
        var span = document.createElement("span");
        var txt = document.createTextNode("x");
        span.className = "delete";
        span.appendChild(txt);
        td.appendChild(span);
        // td mit data index ausstatten
        td.setAttribute('data-array-index', i);
        // td in gui platzieren
        tr.appendChild(td);
        guiTeilnehmerliste.appendChild(tr);
  	}
    
    // deletes funktion anhängen
    var deletes = document.getElementsByClassName("delete");
  	for (var j = 0; j < deletes .length; j++) {
    	    deletes [j].onclick = function() {
    	    var eintrag = this.parentElement;  // access the td
    	    var referenz = eintrag.getAttribute('data-array-index');
    	    loescheEintrag(referenz);
    	};
    }
    */
    if ($.fn.DataTable.isDataTable("#teilnehmerliste")) {
        $('#teilnehmerliste').DataTable().clear().destroy();
    }
    $('#teilnehmerliste').DataTable({
        data: participants,
        columns: [
            { data: 'name', title : 'Name' },
            { data: 'didvote', title: 'Upvote' + upvotesvg + '' },
            { data: 'didcomment', title : 'Comment' + commentsvg + '' },
            { data: 'didresteem', title: 'Resteem' + resteemsvg + '' },
            { data: null, defaultContent: '<button class="deleteButton">delete</button>' }
        ],
        dom: 'Bfrtip',
        buttons: [{
            extend: 'pdf',
            title: 'Steemfortune Export',
            filename: 'steemfortune_export'
        }, {
            extend: 'excel',
            title: 'Steemfortune Export',
            filename: 'steemfortune_export'
        }, {
            extend: 'csv',
            title: 'Steemfortune Export',
            filename: 'steemfortune_export'
        }],
        searching : false
    });

    $("#teilnehmerliste").width("100%");
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

    // modify winners to object
    // reset first
	winnersObjectArray = [];
	for (var i = 0; i < winners.length; i++) {
	    winnersObjectArray.push(winners[i]);
	}


    // generate winner table
	if ($.fn.DataTable.isDataTable("#gewinnerliste")) {
	    $('#gewinnerliste').DataTable().clear().destroy();
	}
	$('#gewinnerliste').DataTable({
	    data: winnersObjectArray,
	    columns: [
            { data: 'name', title: 'Name' },
            { data: 'didvote', title: 'Upvote' + upvotesvg + '' },
            { data: 'didcomment', title: 'Comment' + commentsvg + '' },
            { data: 'didresteem', title: 'Resteem' + resteemsvg + '' }
	    ],
	    dom: 'Bfrtip',
	    buttons: [{
	        extend: 'pdf',
	        title: 'Steemfortune Winner Export',
	        filename: 'steemfortune_winner_export'
	    }, {
	        extend: 'excel',
	        title: 'Steemfortune Winner Export',
	        filename: 'steemfortune_winner_export'
	    }, {
	        extend: 'csv',
	        title: 'Steemfortune Winner Export',
	        filename: 'steemfortune_winner_export'
	    }],
	    searching: false
	});

	$("#gewinnerliste").width("100%");

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
                        var neu = newParticipant(result[i].voter, true, undefined, undefined);
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
                        var neu = newParticipant(result[i].author, undefined, true, undefined);
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
                            var neu = newParticipant(result[i], undefined, undefined, true);
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

/* svgs for useraction */
var upvotesvg = '<svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg>';
var resteemsvg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg>';
var commentsvg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><path d="M124.3,400H277c14.4,0,14.4,0.1,21.3,5.2S384,464,384,464v-64h3.7c42.2,0,76.3-31.8,76.3-71.4V119.7 c0-39.6-34.2-71.7-76.3-71.7H124.3C82.2,48,48,80.1,48,119.7v208.9C48,368.2,82.2,400,124.3,400z"></path></svg>';


/* add delete logic to custom button within datatable */
$('body').on('click', '.deleteButton', function () {
    var participantToDelete = this.parentElement.parentElement.firstChild.textContent;
    participants = deleteByName(participantToDelete, participants);
    stelleListedar();
});