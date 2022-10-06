function buildStandingsSheet() {
    // Create a sorted array of team objects. Teams are sorted by competition points and conference game point differential
    var teams = ["Adrian", "Aquinas", "Iowa Central CC", "Marian", "Thomas More", "Wheeling"];
    var teamObjects = [];
    
    for (var team of teams) {
        teamObjects.push(buildTeamObject(team));
    }

    teamObjects.sort(compareTeam);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Standings");

    for (i = 0; i < teamObjects.length; i++) {
        var teamData = [[teamObjects[i].team,
                        teamObjects[i].totalPoints,
                        teamObjects[i].points,
                        teamObjects[i].bonusPoints,
                        teamObjects[i].conferenceRecord,
                        teamObjects[i].confPointsFor,
                        teamObjects[i].confPointsAgainst,
                        teamObjects[i].confPointDiff,
                        teamObjects[i].overallRecord,
                        teamObjects[i].overallPointsFor,
                        teamObjects[i].overallPointsAgainst,
                        teamObjects[i].overallPointDiff,
                        teamObjects[i].ncrRank,
                        teamObjects[i].goffRank]];

        sheet.getRange(i + 2, 1, 1, teamData[0].length).setNumberFormat("@");                        
        sheet.getRange(i + 2, 1, 1, teamData[0].length).setValues(teamData);
    }

    console.log(teamObjects);

    exportTeamData(teamObjects);
}

function buildTeamObject(team) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(team);
    var values = sheet.getDataRange().getValues();

    var teamObject = {team: team,
                    conferenceRecord: "",
                    overallRecord: "",
                    confWins: 0,
                    overallPointsFor: 0,
                    overallPointsAgainst: 0,
                    overallPointDiff: 0,
                    confPointsFor: 0,
                    confPointsAgainst: 0,
                    confPointDiff: 0,
                    points: 0,
                    bonusPoints: 0,
                    totalPoints: 0,
                    ncrRank: "",
                    goffRank: ""
                    };

    // Overall and Conference records and competition points
    var overallWins = 0;
    var conferenceWins = 0;
    var overallLoses = 0;
    var conferenceLoses = 0;
    var overallTies = 0;
    var conferenceTies = 0;

    for (i = 1; i < values.length; i++) {
        if (values[i][2] != "") {
            var pointDiff = values[i][2] - values[i][3];

            if (pointDiff > 0) {
                overallWins++;
                if (values[i][4] == true) {
                    conferenceWins++;
                    teamObject.confWins++;
                    teamObject.points += 4;
                }
            } else if (pointDiff < 0) {
                overallLoses++;
                if (values[i][4] == true) {
                    conferenceLoses++;
                    // Bounus point if you lose by 7 or less
                    if (pointDiff >= -7) {
                        teamObject.bonusPoints++;
                    }
                }
            } else if (pointDiff == 0) {
                    overallTies++;
                if (values[i][4] == true) {
                    conferenceTies++;
                    teamObject.points += 2;
                }
            }
            
            // Try bonus points        
            if (values[i][5] == true) {
                teamObject.bonusPoints++
            }
        }
    }

    teamObject.totalPoints = teamObject.points + teamObject.bonusPoints;
    teamObject.conferenceRecord = conferenceWins + "-" + conferenceLoses + "-" + conferenceTies;
    teamObject.overallRecord = overallWins + "-" + overallLoses + "-" + overallTies;
    
    // Points for, point against, point differential 
    for (i = 1; i < values.length; i++) {
        teamObject.overallPointsFor += values[i][2];
        teamObject.overallPointsAgainst += values[i][3];
        if (values[i][4] == true) {
            teamObject.confPointsFor += values[i][2];
            teamObject.confPointsAgainst += values[i][3];
        }
    }

    teamObject.overallPointDiff = teamObject.overallPointsFor - teamObject.overallPointsAgainst;
    teamObject.confPointDiff = teamObject.confPointsFor - teamObject.confPointsAgainst;
    
    if (teamObject.overallPointDiff > 0) {
        teamObject.overallPointDiff = "+" + teamObject.overallPointDiff;
    }

    if (teamObject.confPointDiff > 0) {
        teamObject.confPointDiff = "+" + teamObject.confPointDiff;
    }

    // NCR and Goff Rugby ranks
    teamObject.ncrRank = values[1][6];
    teamObject.goffRank = values[1][7];
    
    return teamObject;
}

function compareTeam(a, b) {
    const teamAPoints = a.totalPoints;
    const teamBPoints = b.totalPoints;
    const teamAWins = a.confWins;
    const teamBWins = b.confWins;
    const teamAConfPD = parseInt(a.confPointDiff);
    const teamBConfPD = parseInt(b.confPointDiff);

    var compValue = 0;

    if (teamAPoints > teamBPoints) {
        compValue = -1;
    } else if (teamAPoints < teamBPoints) {
        compValue = 1;
    } else if (teamAPoints == teamBPoints) {
        
        if (teamAWins > teamBWins) {
            compValue = -1;
        } else if (teamAWins < teamBWins) {
            compValue = 1;
        }else if (teamAWins == teamBWins) {
            if (teamAConfPD > teamBConfPD) {
                compValue = -1;
            } else if (teamAConfPD < teamBConfPD) {
                compValue = 1;
            }
        }
    }

    return compValue;
}

function exportTeamData(data) {
    var doc = DocumentApp.openByUrl('https://docs.google.com/document/d/1Gjzt_Cjyq-qKDwBR8FdlJvoBy1UekTy-KZfs7taf8ug/edit');
    var docBody = doc.getBody();
    docBody.clear();
    var jsonData = JSON.stringify(data);
    docBody.appendParagraph(jsonData);
}