
import {getJson} from "./utils_helper.js";

const geojsonfile = './precincts/berkeleyPrecincts.geojson';
const precincts = await getJson(geojsonfile);

/* /db/exports$ ls
MV_BerkeleyContests.json  MV_BerkeleyPrecints.json  MV_BerkeleyVoteByPrecinctAndCandidate.json
*/
const contestJsonFile = './db/exports/MV_BerkeleyContests.json';
const contestsJson = await getJson(contestJsonFile);

const precinctsJsonFile = './db/exports/MV_BerkeleyPrecints.json';
const precinctsJson = await getJson(precinctsJsonFile);

const voteByPrecinctJsonFile = './db/exports/MV_BerkeleyVoteByPrecinctAndCandidate.json';
const voteByPrecinctJson = await getJson(voteByPrecinctJsonFile);

export {precincts, contestsJson, precinctsJson, voteByPrecinctJson};