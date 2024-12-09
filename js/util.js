
import {getJson} from "./utils_helper.js";

const geojsonfile = './precincts/berkeleyPrecincts.geojson';
const precincts = await getJson(geojsonfile);

/* /db/exports$ ls
MV_BerkeleyContests.json  MV_BerkeleyPrecints.json  MV_BerkeleyVoteByPrecinctAndCandidate.json
*/
const contestJsonFile = './db/exports/MV_BerkeleyContests.json';
const contestsJson = await getJson(contestJsonFile);

const candidatesJsonFile = './db/exports/MV_BerkeleyCandidates.json';
const candidatesJson = await getJson(candidatesJsonFile);

const precinctsJsonFile = './db/exports/MV_BerkeleyPrecincts.json';
const precinctsJson = await getJson(precinctsJsonFile);

const voteByPrecinctJsonFile = './db/exports/MV_BerkeleyVoteByPrecinctAndCandidate.json';
const voteByPrecinctJson = await getJson(voteByPrecinctJsonFile);

export {precincts, contestsJson, candidatesJson, precinctsJson, voteByPrecinctJson};