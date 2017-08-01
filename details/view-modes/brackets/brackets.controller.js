(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.controller('BracketsController', controller);

	/* @ngInject */
	function controller($scope, lodash, tournament, MatchService,
		BracketsService, TournamentsModalService, TournamentResource) {

		var vm = this;
		vm.tournament = tournament;
		vm.rounds = null;
		vm.teams = [];
		vm.showMatchDetails = showMatchDetails;
		vm.currentGroupId = -1;
		vm.setGroupId = setGroupId;
		vm.unsetGroupId = unsetGroupId;
		vm.getHeight = getHeight;


		var matchListener = $scope.$watch(
			function() {
				return MatchService.getMatches(vm.tournament.id);
			},
			function(newValue, oldValue) {
				if (newValue === oldValue) {
					return;
				}

				return newValue.then(function() {
					activate();
				});
			}
		);

		$scope.$on('destroy', matchListener);

		activate();

		function activate() {
			return MatchService.getMatches(vm.tournament.id)
				.then(function(matches) {
					switch (tournament.mode) {

						case TournamentResource.MODE.DOUBLE_ELIMINATION:
							//@TODO some logic for DOUBLE_ELIMINATION
							return;

						case TournamentResource.MODE.ROUND_ROBIN:
							return BracketsService.getRoundRobinTeams(tournament, matches)
								.then(function(teams) {
									vm.teams = teams;

								});

							// case TournamentResource.MODE.SINGLE_ELIMINATION:
						default:
							return BracketsService
								.getSingleEliminationRounds(vm.tournament, matches)
								.then(function(rounds) {
									vm.rounds = lodash.reverse(rounds);
								});
					}
				});
		}

		function getHeight(length, round) {
			return 47 * Math.pow(2, (length - round - 1));
		}

		function setGroupId(currentGroupId) {
			vm.currentGroupId = currentGroupId ? currentGroupId : -1;
		}

		function unsetGroupId() {
			vm.currentGroupId = -1;
		}

		function showMatchDetails(match, tournament) {
			if (!match.participants[0] || !match.participants[1]) {
				return;
			}

			return TournamentsModalService.showMatchDetails(match, tournament);
		}

	}
})();
