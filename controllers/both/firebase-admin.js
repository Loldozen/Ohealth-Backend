const admin = require('firebase-admin')
var serviceAccount1 = require("../../ohealth-notifs-firebase-adminsdk-ckcp6-05b63e8c6c.json");

let admin1 = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount1),
	databaseURL: "https://ohealth-notifs.firebaseio.com"
}, 'ohealth-notifs');

var serviceAccount2 = require("../../odoctor-notifs-firebase-adminsdk-yq5lt-8c4b224511.json");

let admin2 = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount2),
	databaseURL: "https://odoctor-notifs.firebaseio.com"
}, 'odoctor-notifs');

module.exports = { admin1, admin2 }
