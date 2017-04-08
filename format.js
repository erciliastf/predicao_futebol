var fs = require("fs");
// var csv = fs.readFileSync('updated_data/training.csv', 'UTF-8');
var csv = fs.readFileSync('updated_data/training_pred.csv', 'UTF-8');
csv = csv.split('\n');
var newCols = ["days", "homeWonLast", "awayWonLast", "homeWinStreak", "homeLoseStreak", "homeTieStreak", "awayWinStreak", "awayLoseStreak", "awayTieStreak", "homePoints", "awayPoints", "homeWonLastEncounter", "lastEncounterWasTie", "homeLastSeasonPlace", "awayLastSeasonPlace"];

var date = '2000-08-11';
var teams = {};
var seasons = {};
var currentSeason = '';

csv.forEach(function (row, index) {
    // if (index > 10000) return;
    var cols = row.split(',');
    if (index < 1) {
        cols = cols.concat(newCols)
        csv[0] = cols;
        return;
    }
    currentSeason = cols[0] + cols[1];
    // console.log(currentSeason)
    if (!seasons[currentSeason]) {
        seasons[currentSeason] = {};
        // console.log(seasons);
    }
    var home = cols[3];
    var away = cols[4];
    if (!seasons[currentSeason][home])
        seasons[currentSeason][home] = -1;
    if (!seasons[currentSeason][away])
        seasons[currentSeason][away] = -1;
    // if (typeof home === 'undefined') return;
    if (typeof cols[2] === 'undefined') return;
    var dateCol = cols[2].split('/');
    var date1 = new Date(dateCol[2], dateCol[1], dateCol[0]);
    cols.push(Math.floor((date1.getTime() - Date.parse(date)) / 86400000))
    cols.push(wonLast(row, home)); //homeWonLast
    cols.push(wonLast(row, away)); //awayWonLast
    //end season
    [teams[home], teams[away]].forEach(team => {
        if (team.season == currentSeason) return;
        team.season = currentSeason;
        team.seasonPoints = 0;
        var aux = [];
        // console.log('current:', seasons[currentSeason])
        for (var t in seasons[currentSeason]) {
            // console.log('t:', t)
            aux.push({ name: t, points: seasons[currentSeason][t], place: 0 });
        }
        aux = aux.sort((a, b) => {
            return b.points - a.points;
        })
        aux.forEach(function (item, index) {
            teams[item.name].prevSeason = index + 1;
        }, this);
        // console.log('aux:', aux)
    })
    cols.push(teams[home].winStreak); //homeWinStreak
    cols.push(teams[home].loseStreak); //homeLoseStreak
    cols.push(teams[home].tieStreak); //homeTieStreak
    cols.push(teams[away].winStreak); //awayWinStreak
    cols.push(teams[away].loseStreak); //awayLoseStreak
    cols.push(teams[away].tieStreak); //awayTieStreak
    cols.push(teams[home].seasonPoints); //homePoints
    cols.push(teams[away].seasonPoints); //awayPoints
    //homeWonLastEncounter
    if (teams[home].matches[away] == home)
        cols.push(1);
    else
        cols.push(0)
    //lastEncounterWasTie
    if (teams[home].matches[away] == 'tie')
        cols.push(1);
    else
        cols.push(0)
    cols.push(teams[home].prevSeason); //homeLastSeasonPlace
    cols.push(teams[away].prevSeason); //awayLastSeasonPlace
    //8 -> homeWin
    if (cols[8] > 0) {
        teams[home].winStreak++;
        teams[home].loseStreak = 0;
        teams[home].tieStreak = 0;
        teams[home].wonLast = true;
        teams[home].seasonPoints += 3;
        teams[home].matches[away] = home;
        teams[away].matches[home] = home;
        teams[away].loseStreak++;
        teams[away].winStreak = 0;
        teams[away].tieStreak = 0;
        teams[away].wonLast = false
    }
    if (cols[9] > 0) {
        teams[away].winStreak++;
        teams[away].loseStreak = 0;
        teams[away].tieStreak = 0;
        teams[away].wonLast = true;
        teams[away].seasonPoints += 3;
        teams[home].matches[away] = away;
        teams[away].matches[home] = away;
        teams[home].loseStreak++;
        teams[home].winStreak = 0;
        teams[home].tieStreak = 0;
        teams[home].wonLast = false;
    }
    if (cols[10] > 0) {
        teams[home].winStreak = 0;
        teams[home].loseStreak = 0;
        teams[home].tieStreak++;
        teams[home].wonLast = false;
        teams[home].seasonPoints += 1;
        teams[away].seasonPoints += 1;
        teams[home].matches[away] = 'tie';
        teams[away].matches[home] = 'tie';
        teams[away].winStreak = 0;
        teams[away].loseStreak = 0;
        teams[away].tieStreak++;
        teams[away].wonLast = false;
    }
    seasons[currentSeason][home] = teams[home].seasonPoints;
    seasons[currentSeason][away] = teams[away].seasonPoints;
    csv[index] = cols;
}, this);
// console.log(seasons)
for (var t in teams) {
    console.log(t, teams[t].prevSeason)
}
var output = '';
console.log('------------');
csv.forEach(function (el, index) {
    // if (index > 300) return;
    if (index == csv.length - 1) return; //skip last
    el.forEach(function (col) {
        output += col + ',';
    }, this);
    output += '\n';
}, this);

fs.writeFile('updated_data/training_pred_ok.csv', output);
//date - 3
//home - 4
//away - 5

function wonLast(row, team) {
    if (typeof teams[team] === 'undefined') {
        // console.log('new team:', team);
        teams[team] = {
            winStreak: 0,
            loseStreak: 0,
            tieStreak: 0,
            wonLast: 0,
            season: currentSeason,
            seasonPoints: 0,
            matches: {},
            prevSeason: 35 //season com mais times é 30, assuma 35
        };
        return 0;
    }
    if (teams[team].wonLast)
        return 1;
    else
        return 0;
}
