
//import { exec } from 'child_process';
import * as fs from 'fs';
//import sqlite3 from 'sqlite3';
import Database from 'better-sqlite3';
import { kStringMaxLength } from 'buffer';
//import * as async from 'async';

//import { markAsUntransferable } from 'worker_threads';

//const db = new sqlite3.Database('./db/cvr.sqlite3',sqlite3.OPEN_CREATE);

const db = new Database('./db/cvr.sqlite3');
db.pragma('journal_mode = WAL');
//db.run( 'PRAGMA journal_mode = WAL;' );
//db.serialize();

console.log(db);



function executeStmt( conn, text) {

//	conn.serialize(() => {
	
	//const res = conn.exec(text);

	const stmt = conn.prepare(text);
	const info = stmt.run();
	//console.log(info);
	//});
//	console.log("Result:", res);
}


function sqlTypeof(val) {
	if (typeof(val) == 'number') {
		return 'INT';
	}
	if (typeof(val) == 'string') {
		return 'TEXT';
	}
	if (typeof(val) == 'boolean') {
		return 'INT';
	}
	return 'UNKOWNTYPE';
}
function createTableStmt(tblname, obj) {

	if (obj == undefined) {
		console.log("Null obj");
	}
	// supprt TEXT, INT types

	//CREATE TABLE t1(a INT, b TEXT, c REAL);
	var stmt ='CREATE TABLE IF NOT EXISTS ' + tblname + '(';

	var flds = '';

	for (const [key, value] of Object.entries(obj)) {
		if (flds.length > 0 ) {
			flds += ',';
		}
	//	console.log(key, value);
		const fldSpec = key + ' ' + sqlTypeof(value);
		flds += (fldSpec  );
	}
	  
	stmt += (flds + ');');

	return stmt;
}

function dropTableStmt(tblname) {
	// supprt TEXT, INT types

	//CREATE TABLE t1(a INT, b TEXT, c REAL);
	var stmt ='DROP TABLE IF  EXISTS ' + tblname + ";";
	return stmt;
}

function sqlEscape(value) {
   
	if (sqlTypeof(value) == 'TEXT') {
		return value.replaceAll("'", "''");
		
	}
	return value;

}
function insertStmt(tblname, obj) {
	// INSERT INTO table (column1,column2 ,..)
    // VALUES( value1,	value2 ,...);

	//CREATE TABLE t1(a INT, b TEXT, c REAL);
	var stmt ='INSERT INTO  ' + tblname + ' ';

	var flds = '';
	var vals = '';

	for (const [key, value] of Object.entries(obj)) {
		if (flds.length > 0 ) {
			flds += ',';
		}

		if (vals.length > 0 ) {
			vals += ',';
		}
	//	console.log(key, value);
		flds += key;
		var delim = '';

		if (sqlTypeof(value) == 'TEXT') {
			delim = "'";
		}
		vals += (delim+sqlEscape(value)+delim); // quoting?
	}
	stmt += ('(' + flds + ')');
	stmt += ('VALUES( ' + vals + ')');
	return stmt;
}

function insertStmtWithNamedVariables(tblname, obj) {
	// INSERT INTO table (column1,column2 ,..)
    // VALUES( value1,	value2 ,...);
	/* const insert = db.prepare('INSERT INTO cats (name, age) VALUES (@name, @age)');

const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

insertMany([
  { name: 'Joey', age: 2 },
  { name: 'Sally', age: 4 },
  { name: 'Junior', age: 1 },
]);*/

	//CREATE TABLE t1(a INT, b TEXT, c REAL);
	var stmt ='INSERT INTO  ' + tblname + ' ';
	
	var flds = '';
	var vals = '';

	for (const [key, value] of Object.entries(obj)) {
		if (flds.length > 0 ) {
			flds += ',';
		}

		if (vals.length > 0 ) {
			vals += ',';
		}
	//	console.log(key, value);
		flds += key;
		
		vals += ('@'+key);
	}
	stmt += ('(' + flds + ')');
	stmt += ('VALUES( ' + vals + ')');
	return stmt;
}


var tables = new Set();

function createTableIfNeeded( conn, tbleName, stmt) {

}
function processSimpleFile( conn, tblName, fileName) {

	const data = fs.readFileSync(fileName, 'utf8');
	var obj = JSON.parse(data);
	
	const l = obj.List;

	const dropTable = dropTableStmt(tblName);
	executeStmt(db, dropTable);
	
	const createTable =  createTableStmt(tblName, l[0] );
	executeStmt(db, createTable);

	const sql = insertStmtWithNamedVariables( tblName, l[0]);
	const stmt = db.prepare(sql);
	
	for (const o of l) {
		stmt.run(o);		
	}

}

function beginTxn(conn) {
	executeStmt(conn, "BEGIN TRANSACTION")  // speeds up inserts
}

function endTxn(conn) {
	executeStmt(conn, "END TRANSACTION")
}

function processObjArray( conn, tblName, arr) {

	const jsonKeys = new Set();

	if (!tables.has(tblName)) {
		const createTable =  createTableStmt(tblName, arr[0] );
		executeStmt(db, createTable);
		tables.add(tblName);
	}
	
	const sql = insertStmtWithNamedVariables(tblName, arr[0]);
	const stmt = conn.prepare(sql);

	for (const o of arr) {
	    if (o.IsAmbiguous) {
			o.IsAmbiguous =1;
		} else {
			o.IsAmbiguous=0;
		}
		o.IsVote=1;

		const info = stmt.run(o);
	//	console.log(info);
		
	}


}

function handleCards( conn, countingGroupId, ver) {
	const arrVotes = [];
	const cards = ver.Cards;
	for (const card of cards ) {
		const contests = card.Contests;
		for (const contest of contests) {
			const marks = contest.Marks;

			if (marks == "*** REDACTED ***") {
				console.log("REDACTED!");
			} else {
				//console.log(marks);
				const votes = marks.filter( (mark) => mark.IsVote);

				// add the contestId and countingGroupId
				for (const v of votes) {
					v.contestId = contest.Id;
					v.countingGroupId = countingGroupId;
					v.PrecinctPortionId = ver.PrecinctPortionId;
					delete v.OutstackConditionIds;
					delete v.WriteinIndex;
					delete v.WriteinDensity;
					delete v.PartyId;

					//delete v.IsAmbiguous;
					//delete v.IsVote;
					arrVotes.push(v);
				}
				//arrVotes.push(votes);
			}
		}
	}

	if (arrVotes.length >0) {
		processObjArray(conn, "VOTES", arrVotes);
	}

}

var cardId=1;

var mapIdToName = new Map();
mapIdToName.set(133,"Alfred");
mapIdToName.set(134,"Carole");
mapIdToName.set(135,"Xavier");
mapIdToName.set(136,"Avery");
mapIdToName.set(137,"Andy");
mapIdToName.set(138,"Dominique");
mapIdToName.set(432,"Writein");

function RentIdToName(id) {
	return mapIdToName(id);
}

function marksToObj( votes ) {
	//var v = {133:0,134:0, 135:0, 136:0, 137:0, 138:0, 432:0};
	var v = {};
	for (const name of mapIdToName.values()) {
		v[name]=0;
	}
	for (const mark of votes) {
		const name = mapIdToName.get(mark.CandidateId);
		v[name] = 1; // computed prop name
	}
	//console.log(v);
	return (v);

}

function handleRENTCards( conn, countingGroupId, ver) {
	const arrVotes = [];
	const cards = ver.Cards;
	for (const card of cards ) {
		const contests = card.Contests;
		for (const contest of contests) {
          //  console.log(contest.Id);
			if (contest.Id == 43) {
				const marks = contest.Marks;

				//console.log("rent:",marks);

				if (marks == "*** REDACTED ***") {
					console.log("REDACTED!");
				} else {
					//console.log(marks);
					const votes = marks.filter( (mark) => mark.IsVote);
					const obj = marksToObj(votes);
					arrVotes.push(obj);
				}
			}
		}
	}

	if (arrVotes.length >0) {
		processObjArray(conn, "RENT", arrVotes);
	}

}



function processCvrExport( conn, fileName) {
	const data = fs.readFileSync(fileName, 'utf8');
	var obj = JSON.parse(data);
	const sessions = obj.Sessions;

	//beginTxn(conn);
	for (const sess of sessions) {
		const countingGroupId = sess.CountingGroupId;
		const ver = sess.Modified ?? sess.Original;
		handleRENTCards( conn, countingGroupId, ver);
	}
	//endTxn(conn);
}

/*
pp/BallotTypeContestManifest.json
pp/BallotTypeManifest.json
pp/CandidateManifest.json
pp/ContestManifest.json
pp/CountingGroupManifest.json
pp/DistrictManifest.json

pp/DistrictPrecinctPortionManifest.json
pp/DistrictTypeManifest.json
pp/ElectionEventManifest.json  <-- weird one with array


pp/OutstackConditionManifest.json
pp/PartyManifest.json

pp/PrecinctManifest.json

pp/PrecinctPortionManifest.json
pp/TabulatorManifest.json

*/

/*


processSimpleFile(db,"BallotTypeContest", './pp/BallotTypeContestManifest.json');
processSimpleFile(db,"BallotType", './pp/BallotTypeManifest.json');
processSimpleFile(db,"Candidate", './pp/CandidateManifest.json');
processSimpleFile(db,"Contest", './pp/ContestManifest.json');


processSimpleFile(db,"CountingGroup", './pp/CountingGroupManifest.json');
processSimpleFile(db,"District", './pp/DistrictManifest.json');

processSimpleFile(db,"DistrictPrecinctPortion", './pp/DistrictPrecinctPortionManifest.json');
processSimpleFile(db,"DistrictType", './pp/DistrictTypeManifest.json');

processSimpleFile(db,"OutstackConditionManifest", './pp/OutstackConditionManifest.json');
processSimpleFile(db,"Party", './pp/PartyManifest.json');

processSimpleFile(db,"Precinct", './pp/PrecinctManifest.json');


processSimpleFile(db,"PrecinctPortion", './pp/PrecinctPortionManifest.json');

processSimpleFile(db,"Tabulator", './pp/TabulatorManifest.json');
*/
const dropTable = dropTableStmt("VOTES");
	//executeStmt(db, dropTable);

var files = fs.readdirSync('./pp').filter(fn => fn.startsWith('CvrExport_'));


for (const file of files) {
	//unction(file,cb){
		const fname = './pp/' + file
	//	console.log("Processing ", fname);
		processCvrExport(db, fname);
	
}


db.close();

/*
const data = fs.readFileSync('./pp/ContestManifest.json', 'utf8');
var obj = JSON.parse(data);
const jsonKeys = new Set();

const l = obj.List;

const objCount = l.size;

const createTable =  createTableStmt("Contest", l[0] );

executeStmt(db, createTable);


for (const o of l) {

	const insert = insertStmt('Contest', o);
	console.log(insert);
	executeStmt(db, insert);
	
/*
	for (const [key, value] of Object.entries(o)) {
		console.log(key, value);
	}
	  
	for (const k in o) {
		jsonKeys.add(k);

	}*/
//}

/*
for (const k of jsonKeys) {
	console.log("Field name: ", k)	;
}*/



/*



const letters = JSON.parse(obj.data.letters.toUpperCase()).slice(1); // discard banned letter
const words = JSON.parse(obj.data.all_words);
const hexgrams = JSON.parse(obj.data.specific_words) ?? [];
const perfects = hexgrams.filter(  (word) => (word.length == 6));
console.log("Hexgrams: " , hexgrams.length, " Perfect: ", perfects.length);

console.log("Queen Bee points: ", JSON.parse(obj.data.total_point));
console.log("total words: ", words.length);
const mapXxToCount = new Map();
const mapXtoMapLengthToCount = new Map();
let maxLen=0;

for (const w of words)  {
	//console.log( "word " , w)
	const a = w.slice(0,1);
	const ab = w.slice(0,2);
	const len = w.length;
	maxLen = Math.max( len, maxLen);

	mapXxToCount.set(ab, (mapXxToCount.get(ab) ?? 0) + 1);

	if (mapXtoMapLengthToCount.get(a) == undefined) {
		mapXtoMapLengthToCount.set(a, new Map());
	//	console.log("Creating length map for letter ", a);
	}
	const m = mapXtoMapLengthToCount.get(a);

	const oldCount = m.get(len) ?? 0;
	m.set( len, oldCount+1);	
};

// print length table
// print header line
let line = "  ";
for (let i=4; i<= maxLen; i++) {
	
	const s = String(i).padStart(4,' ')
	line += (s );
}
console.log(line);

for (const l of letters) {
	let lengthMap = mapXtoMapLengthToCount.get(l);
	if (lengthMap != undefined) {
			
		let line = "" + l + " ";

		for (let i=4; i<= maxLen; i++) {
			const ct = lengthMap.get(i) ?? 0;
			const s = String(ct).padStart(4,' ')
			line += (s );
		}
		console.log(line);
	}
};


// print 2 letter counts
mapXxToCount.forEach((value, key) => {
	console.log(`${key} = ${value}`);
});

*/
console.log("bye");