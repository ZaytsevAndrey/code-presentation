(function () {
	'use strict';

	angular
		.module('app.tournaments')
		.factory('BracketsService', bracketsService);

	/* @ngInject */
	function bracketsService($q, lodash, MatchService, MatchResource,
		TournamentDetailsService, TournamentRequestService) {

		return {
			getRounds: getRounds,
			getRoundRobinTeams: getRoundRobinTeams,
			getSingleEliminationRounds: getSingleEliminationRounds
		};


		function getRounds(tournament, matches) {
			if (tournament.isRoundRobin()) {
				return getRoundRobinTeams(tournament, matches);
			}

			if (tournament.isSingleElimination()) {
				return getSingleEliminationRounds(tournament, matches);
			}

		}


		function getSingleEliminationRounds(tournament, matches) {

			var i, roundsCount = tournament.getMatchesCount(),
				roundsAll = new Array(roundsCount),
				rounds = lodash
				.chain(matches)
				.sortBy(function (match) {
					return [match.round, match.index].join();
				})
				.groupBy(function (match) {
					return [match.round, match.index].join();
				})
				.map(function (match) {
					return lodash.maxBy(match, 'series');
				})
				.groupBy('round')
				.value();

			for (i = 0; i < roundsCount; i++) {
				roundsAll[i] = rounds[i] ? rounds[i] : [];
			}

			return serializeMatches(fillEmptyMatches(roundsAll, tournament.id))
				.then(function () {
					return roundsAll;
				});
		}


		function serializeMatches(rounds) {
			var promises = [];
			lodash.forEach(rounds, function (round) {
				return lodash.forEach(round, function (match) {
					promises.push(MatchService.getParticipants(match));
				});
			});

			return $q.all(promises);
		}



		function fillEmptyMatches(rounds, tournament_id) {
			for (var i = 0; i < rounds.length; i++) {
				var indexCount = Math.pow(2, i);
				for (var j = 0; j < indexCount; j++) {
					var matchedElement = {};

					matchedElement = lodash.find(rounds[i], function (game) {
						return game.index === j;
					});

					if (matchedElement) {
						continue;
					}

					var match = new MatchResource({
						index: j,
						round: i,
						groups: [],
						tournament_id: tournament_id
					});

					if (rounds[match.round + 1]) {
						match.participants = [];
						var firstChildGame = lodash.find(rounds[match.round + 1],
							function (game) {
								return game.index === j * 2;
							});

						var secondChildGame = lodash.find(rounds[match.round + 1],
							function (game) {
								return game.index === j * 2 + 1;
							});

						if (firstChildGame && firstChildGame.getWinner()) {
							match.groups[0] = firstChildGame.getWinner();
						}

						if (secondChildGame && secondChildGame.getWinner()) {
							match.groups[1] = secondChildGame.getWinner();
						}
					}

					rounds[i].splice(match.index, 0, match);
				}
			}

			return rounds;
		}


		function getRoundRobinTeams(tournament, matches) {
			matches = lodash
				.chain(matches)
				.sortBy(function (m) {
					return [m.round, m.index].join();
				})
				.groupBy(function (m) {
					return [m.round, m.index].join();
				})
				.map(function (boSeries) {
					return lodash.maxBy(boSeries, 'series');
				})
				.values()
				.value();

			return TournamentRequestService
				.getRequests(tournament.id)
				.then(function (requests) {
					return tournament.isSolo() ? requests :
						TournamentDetailsService.getTeams(requests);
				})
				.then(function (teams) {
					return lodash.each(teams, function (team) {
						team.matches = lodash.chain(matches)
							.filter(function (match) {
								return lodash.includes(match.groups, team.group_id);
							})
							.reverse()
							.value();

						var completedMatches = lodash.filter(team.matches, function (m) {
							return m.isPassed();
						});

						team.wins = lodash.sumBy(completedMatches, function (m) {
							return m.score[m.groups.indexOf(team.group_id)];
						});

						team.loses = lodash.sumBy(completedMatches, function (m) {
							return m.series_type - m.score[m.groups.indexOf(team.group_id)];
						});

						lodash.groupBy(team.matches, 'round');

						var elem = null;
						var draggie = null;

						setTimeout(function(){
							elem = document.querySelector('.draggable');
							draggie = new Draggabilly( elem, {
								axis: 'x'
							});
						}, 500);

						return lodash.each(team.matches, function (match) {
							return MatchService.getParticipants(match);
						});
					});
				});
		}

	}
})();
