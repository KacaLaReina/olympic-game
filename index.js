const fs = require("fs");

const groups = JSON.parse(fs.readFileSync("groups.json", "utf8"));
const exibitions = JSON.parse(fs.readFileSync("exibitions.json", "utf8"));

const pots = { D: [], E: [], F: [], G: [] };
const pots2 = { A: [], B: [] };

const calculateWinProbability = (teamA, teamB) => {
  const data = exibitions[teamA] || [];
  const results = data.filter((match) => match.Opponent === teamB);

  let teamAWins = 0;
  let teamBWins = 0;

  results.forEach((result) => {
    const [scoreA, scoreB] = result.Result.split("-").map(Number);
    if (scoreA > scoreB) teamAWins++;
    else if (scoreB > scoreA) teamBWins++;
  });

  const total = teamAWins + teamBWins;
  return total > 0 ? teamAWins / total : 0.5;
};

const simulateMatch = (teamA, teamB) => {
  const probabilityA = calculateWinProbability(teamA, teamB);
  const scoreA = Math.floor(Math.random() * 50) + 50;
  const scoreB = Math.floor(Math.random() * 50) + 50;
  const adjustedScoreA = scoreA + Math.round(probabilityA * 10);
  const adjustedScoreB = scoreB + Math.round((1 - probabilityA) * 10);
  return [adjustedScoreA, adjustedScoreB];
};

const simulateGroupStage = (group) => {
  const teams = group.map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointsDifference: 0,
    points: 0,
  }));

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i];
      const teamB = teams[j];
      const [scoreA, scoreB] = simulateMatch(
        teamA.Team,
        teamB.Team,
        teamA.FIBARanking,
        teamB.FIBARanking
      );

      teamA.pointsFor += scoreA;
      teamA.pointsAgainst += scoreB;
      teamB.pointsFor += scoreB;
      teamB.pointsAgainst += scoreA;
      teamA.pointsDifference = teamA.pointsFor - teamA.pointsAgainst;
      teamB.pointsDifference = teamB.pointsFor - teamB.pointsAgainst;

      if (scoreA > scoreB) {
        teamA.wins++;
        teamB.losses++;
        teamA.points += 2;
      } else if (scoreA < scoreB) {
        teamB.wins++;
        teamA.losses++;
        teamB.points += 2;
      } else {
        teamA.points++;
        teamB.points++;
      }
    }
  }

  return teams.sort(
    (a, b) =>
      b.points - a.points ||
      b.pointsDifference - a.pointsDifference ||
      b.pointsFor - a.pointsFor
  );
};

const displayGroupStageResults = () => {
  console.log("Grupna faza:");
  Object.keys(groups).forEach((groupName) => {
    console.log(`  Grupa ${groupName}:`);
    const group = groups[groupName];
    const results = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const teamA = group[i];
        const teamB = group[j];
        const [scoreA, scoreB] = simulateMatch(
          teamA.Team,
          teamB.Team,
          teamA.FIBARanking,
          teamB.FIBARanking
        );
        results.push(`${teamA.Team} - ${teamB.Team} (${scoreA}:${scoreB})`);
      }
    }
    results.forEach((result) => console.log(`    ${result}`));
  });
};

const displayGroupStandings = () => {
  console.log("\nKonačan plasman u grupama:");
  Object.keys(groups).forEach((groupName) => {
    const group = groups[groupName];
    const sortedTeams = simulateGroupStage(group);
    console.log(`  Grupa ${groupName}:`);
    sortedTeams.forEach((team, index) => {
      console.log(
        `    ${index + 1}. ${team.Team} ${team.wins} / ${team.losses} / ${
          team.points
        } / ${team.pointsFor} / ${team.pointsAgainst} / ${
          team.pointsDifference
        }`
      );
    });
  });
};

const displayPots = () => {
  console.log("\nŠeširi:");
  Object.keys(pots).forEach((potName) => {
    console.log(`  Šešir ${potName}`);
    pots[potName].forEach((team) => {
      console.log(`    ${team.Team}`);
    });
  });
};

const formEliminationPairs = () => {
  let sesir = [];
  Object.keys(groups).forEach((groupName) => {
    const sortedTeams = simulateGroupStage(groups[groupName]);
    sesir = sesir.concat(sortedTeams);
  });

  sesir.sort(
    (a, b) =>
      b.points - a.points ||
      b.pointsDifference - a.pointsDifference ||
      b.pointsFor - a.pointsFor
  );

  pots.D.push(sesir[0]);
  pots.D.push(sesir[1]);
  pots.E.push(sesir[2]);
  pots.E.push(sesir[3]);
  pots.F.push(sesir[4]);
  pots.F.push(sesir[5]);
  pots.G.push(sesir[6]);
  pots.G.push(sesir[7]);

  displayPots();
  drawMatches();
};

const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const drawMatches = () => {
  console.log("\nČetvrtfinale:");

  const team1 = pots.D[randomBetween(0, pots.D.length - 1)];
  const team8 = pots.G[randomBetween(0, pots.G.length - 1)];
  const match1 = simulateMatch(
    team1.Team,
    team8.Team,
    team1.FIBARanking,
    team8.FIBARanking
  );
  console.log(`${team1.Team} - ${team8.Team} (${match1[0]}:${match1[1]})`);

  pots.D = pots.D.filter((t) => t !== team1);
  pots.G = pots.G.filter((t) => t !== team8);

  const team2 = pots.D[randomBetween(0, pots.D.length - 1)];
  const team7 = pots.G[randomBetween(0, pots.G.length - 1)];
  const match2 = simulateMatch(
    team2.Team,
    team7.Team,
    team2.FIBARanking,
    team7.FIBARanking
  );
  console.log(`${team2.Team} - ${team7.Team} (${match2[0]}:${match2[1]})`);

  pots.D = pots.D.filter((t) => t !== team2);
  pots.G = pots.G.filter((t) => t !== team7);

  const team3 = pots.E[randomBetween(0, pots.E.length - 1)];
  const team6 = pots.F[randomBetween(0, pots.F.length - 1)];
  const match3 = simulateMatch(
    team3.Team,
    team6.Team,
    team3.FIBARanking,
    team6.FIBARanking
  );
  console.log(`${team3.Team} - ${team6.Team} (${match3[0]}:${match3[1]})`);

  pots.E = pots.E.filter((t) => t !== team3);
  pots.F = pots.F.filter((t) => t !== team6);

  const team4 = pots.E[randomBetween(0, pots.E.length - 1)];
  const team5 = pots.F[randomBetween(0, pots.F.length - 1)];
  const match4 = simulateMatch(
    team4.Team,
    team5.Team,
    team4.FIBARanking,
    team5.FIBARanking
  );
  console.log(`${team4.Team} - ${team5.Team} (${match4[0]}:${match4[1]})`);

  const getQuarterfinalWinners = () => {
    return [
      match1[0] > match1[1] ? team1 : team8,
      match2[0] > match2[1] ? team2 : team7,
      match3[0] > match3[1] ? team3 : team6,
      match4[0] > match4[1] ? team4 : team5,
    ];
  };

  const quarterfinalWinners = getQuarterfinalWinners();

  pots2.A.push(quarterfinalWinners[0], quarterfinalWinners[1]);
  pots2.B.push(quarterfinalWinners[2], quarterfinalWinners[3]);

  console.log("\nPolufinale:");
  const semifinals = [
    [pots2.A[0], pots2.B[0]],
    [pots2.A[1], pots2.B[1]],
  ];

  const [semifinal1Result, semifinal2Result] = semifinals.map(
    ([teamA, teamB]) => {
      const [scoreA, scoreB] = simulateMatch(
        teamA.Team,
        teamB.Team,
        teamA.FIBARanking,
        teamB.FIBARanking
      );
      console.log(`  ${teamA.Team} - ${teamB.Team} (${scoreA}:${scoreB})`);
      return [scoreA, scoreB, teamA, teamB];
    }
  );

  const [semifinal1Winner, semifinal1Loser] = semifinal1Result;
  const [semifinal2Winner, semifinal2Loser] = semifinal2Result;

  const thirdPlaceMatch = simulateMatch(
    semifinal1Loser.Team,
    semifinal2Loser.Team,
    semifinal1Loser.FIBARanking,
    semifinal2Loser.FIBARanking
  );
  console.log("\nUtakmica za treće mesto:");
  console.log(
    `  ${semifinal1Loser.Team} - ${semifinal2Loser.Team} (${thirdPlaceMatch[0]}:${thirdPlaceMatch[1]})`
  );

  const finalMatch = simulateMatch(
    semifinal1Winner.Team,
    semifinal2Winner.Team,
    semifinal1Winner.FIBARanking,
    semifinal2Winner.FIBARanking
  );
  console.log("\nFinale:");
  console.log(
    `  ${semifinal1Winner.Team} - ${semifinal2Winner.Team} (${finalMatch[0]}:${finalMatch[1]})`
  );

  const [finalWinner, finalLoser] =
    finalMatch[0] > finalMatch[1]
      ? [semifinal1Winner, semifinal2Winner]
      : [semifinal2Winner, semifinal1Winner];

  const thirdPlaceWinner =
    thirdPlaceMatch[0] > thirdPlaceMatch[1] ? semifinal1Loser : semifinal2Loser;

  console.log("\nMedalje:");
  console.log(`  1. ${finalWinner.Team}`);
  console.log(`  2. ${finalLoser.Team}`);
  console.log(`  3. ${thirdPlaceWinner.Team}`);
};

displayGroupStageResults();
displayGroupStandings();
formEliminationPairs();
