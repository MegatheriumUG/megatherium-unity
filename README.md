# megatherium-unity
Unit testing. Named it "megatherium-unity" and not "megatherium-unit", because I created a "megatherium-unit"-folder manually and windows won't let me delete it without a hard reset.

## API

Ein simpler Test-Case:

```
var unity = require('megatherium-unity');

// Test erstellen
var test = new unity.Test({serverUrl: 'http://localhost:2001/'});

// über die request-Methode können wir leicht & schnell HTTP-Anfragen ausführen
var request = test.request;

// füge Test-Cases hinzu
test.add([
	['UserLogin.fail1', function(callback) {
		request('POST UserLogin', {}, function(err, response) {
			if (err) return callback(err);
			if (response.status == 'success') return callback('Konnte mich ohne Nutzername und Passwort anmelden.');
			if (response.error != 'Bitte gebe einen Benutzernamen ein.') return callback('Unerwarteter Fehler in Antwort');
			callback();
		});
	}],

	['UserLogin.fail2', function(callback) {
		request('GET UserLogin', {username: 'SargTeX', password: 'abc'}, function(err, response) {
			if (err) return callback(err);
			if (response.statusCode == 404) return callback(); // GET UserLogin existiert nicht, nur POST UserLogin; => 404 sollte der Status-Fehler sein!
			if (response.status == 'success') return callback('Konnte mich anmelden, obwohl der Controller GET UserLogin nicht existieren sollte.');
			callback('GET UserLogin scheint zu existieren.');
		});
	}]
]);

// and now: go!
test.run(function(errors) {
	if (errors) {
		if (errors.length && errors.length > 0) {
			for (var i = 0; i < errors.length; ++i) {
				if (typeof errors[i] === 'string') console.log(errors[i]);
				else console.log(JSON.stringify(errors[i]));
			}
			throw 'Errors occured, see above';
			return;
		}

		if (typeof errors === 'string') throw errors;
		throw JSON.stringify(errors);
	};

	console.log('Test successfully finished');
});


## Dokumentation

### Test

Die Test-Klasse bietet Zugriff auf alle wichtigen Funktionen.

#### new Test()

Initialisiert einen Test.

Parameter:
 - ***options*** (*Object*) - optional; ein JSON-Objekt (`{bla: 'mem'}`) mit Optionen; Standardwert: `{}`
   - ***serverUrl*** (*String*) - die URL zum Server, mit abschließendem Slash; z.B. `'http://localhost:2001/'`


#### Test.prototype.add

Fügt weitere Test-Cases hinzu.

Parameter:
 - ***cases*** (*Array*) - ein Array mit TestCases; in jedem Element ist wiederum ein Array, dessen erstes Element den Namen des Tests beinhaltet, und deren zweites Element eine Funktion zur Durchführung des Tests beinhaltet; siehe Beispiel oben

Rückgabewert:
 - ***this*** (*Test*) - gibt sich selbst (`return this`) zurück


#### Test.prototype.request

Führt eine Anfrage auf den Server hinzu.

Parameter:
 - ***target*** (*String*) - das Ziel der Anfrage, d.h. der Name des Controllers mit dem Anfrage-Typ, mit Leerzeichen getrennt; z.B. `GET UserList` oder `POST UserAdd`
 - ***data*** (*Object*) - JSON-Objekt mit Anfrageparametern; werden automatisch in einen Querystring oder in Body-encoding umgewandelt
 - ***callback*** (*Function*) - wird nach Ausführung der Anfrage aufgerufen; callback(err, response); response beinhaltet normalerweise den über JSON.parse geparsten Inhalt der Seite (unsere APIs antworten atm nur mit JSON), außer, wenn ein HTTP-Fehlercode (wie z.B. 404) übergeben wurde; dann entspricht response der Antwort, welche im request-Modul enthalten wird; kurz: überprüfe erst auf korrekten Statuscode (200), dann auf inhaltliche Fehler der Antwort