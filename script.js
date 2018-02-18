var teilnehmerliste = [];


/* neuer Teilnehmer Konstruktor*/
function neuerTeilnehmer(name, lose, pburl) {
		var teilnehmer = {};
    if (lose != undefined) {
    	teilnehmer["lose"] = lose;
    }
    if (pburl != undefined) {
    	teilnehmer["pburl"] = pburl;
    }
  	if (name != undefined) {
    	teilnehmer["name"] = name;
    }
    return teilnehmer;
}

function fuegeTeilnehmerlisteHinzu(teilnehmer) {
		var alreadyInList = false;
    for (var i=0; i < teilnehmerliste.length; i++) {
    		if (teilnehmerliste[i].name === teilnehmer.name) {
        	alreadyInList = true;
          break;
        }
    }
    if (!alreadyInList) {
    	teilnehmerliste.push(teilnehmer);
    } else {
    	window.alert("Teilnehmer "+ teilnehmer.name +" bereits in Liste vorhanden!");
    }
}

knopf.addEventListener("click", function(){
		// feld holen
    var eingabefeld = document.getElementById("teilnehmer");
    var wert = eingabefeld.value;
    // feld leeren
    eingabefeld.value = "";
    // teilnehmer hinzufuegen
    var neu = neuerTeilnehmer(wert);
    fuegeTeilnehmerlisteHinzu(neu);
    // liste darstellen
    stelleListedar();
});

var loeschenknopf = document.getElementById("loeschen");
loeschenknopf.addEventListener("click", function(){
    listeLeeren();
});

function listeLeeren() {
  teilnehmerliste = [];
  sichtbareListeLeeren();
}

function sichtbareListeLeeren () {
	var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
  while (guiTeilnehmerliste.firstChild) {
      guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
  }
}

function loescheEintrag (index) {
	teilnehmerliste.splice(index, 1);
  stelleListedar();
}

function stelleListedar() {
	 // ul liste holen
    var guiTeilnehmerliste = document.getElementById("teilnehmerliste");
    // ul liste leeren
    while (guiTeilnehmerliste.firstChild) {
      guiTeilnehmerliste.removeChild(guiTeilnehmerliste.firstChild);
  	}
    // ul liste füllen
    for (var i=0; i < teilnehmerliste.length; i++) {
  		var li = document.createElement("li");
  		var textKnoten = document.createTextNode(teilnehmerliste[i].name);
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

/* Gewinner ermitteln  */

var ermittelnKnopf = document.getElementById("ermitteln");
ermittelnKnopf.addEventListener("click", function(){
    var anzahlGewinner = document.getElementById("anzahlGewinner");
    var wert = anzahlGewinner.value;
    var gewinnerString = "";
    var lostopf = generiereLostopf();
		for (var i = 0; i < wert; i++) {
    	  var gewinner = giveRandomItem(lostopf);
    		gewinnerString += gewinner.name;
    }
    window.alert("Die oder der Gewinner ist: " + gewinnerString + "");
    console.log(gewinnerString);
});

function giveRandomItem (array) {
 return array[Math.floor(Math.random() * array.length)];
}

function generiereLostopf() {
	var lostopf = [];
  for(var i=0; i < teilnehmerliste.length; i++) {
  		var teilnehmer = teilnehmerliste[i];
      var lose = 1;
      if (teilnehmer.lose != undefined) {
        var lose = teilnehmer.lose;
      }
      for(var j = 0; j < lose; j++) {
      	lostopf.push(teilnehmer);
      }
  }
  return lostopf;
}


/* Upvoter mit Steemit api abholen */

var upvoterKnopf = document.getElementById("upvoterHinzufuegen");
upvoterKnopf.addEventListener("click", function(){
		var regex = new RegExp("@([a-z]+)\/([^\/]+)$");
    var ulink = document.getElementById("upvoterLink").value;
    var author = ulink.match(regex)[1];
    var link = ulink.match(regex)[2];
    steem.api.getActiveVotes(author, link, function(err, result) {
     		console.log(err, result);
        if(result != undefined) {
          var length = result.length;
					for(var i= 0; i < length; i++) {
            var neu = neuerTeilnehmer(result[i].voter);
    				fuegeTeilnehmerlisteHinzu(neu);
          }
        }
        stelleListedar();
    });
});

/* Kommentatoren mit Steemit api abholen */

var kommentatorenKnopf = document.getElementById("kommentatorenHinzufuegen");
kommentatorenKnopf.addEventListener("click", function(){
		var regex = new RegExp("@([a-z]+)\/([^\/]+)$");
    var ulink = document.getElementById("kommentatorenLink").value;
    var author = ulink.match(regex)[1];
    var link = ulink.match(regex)[2];
    steem.api.getContentReplies(author, link, function(err, result) {
     		console.log(err, result);
        if (result != undefined) {
          var length = result.length;
					for(var i= 0; i < length; i++) {
            var neu = neuerTeilnehmer(result[i].author);
    				fuegeTeilnehmerlisteHinzu(neu);
          }
        }
        stelleListedar();
    });
});