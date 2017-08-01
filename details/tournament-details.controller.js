(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.controller('TournamentDetailsController', tournamentDetailsController);

	/* @ngInject */
	function tournamentDetailsController($q, $scope, $state, lodash, tournament,
		MatchService, CurrentMatchService, TournamentService,
		SocketService, TournamentsSocketService, TournamentRequestService) {

		var vm = this;
		vm.currentMatch = null;
		vm.accountCurrentMatch = null;

		var currentMatchListener = $scope.$watch(
			function() {
				return CurrentMatchService.getMatches();
			},
			function(newValue, oldValue) {
				if (newValue !== oldValue) {
					activate();
				}
			}
		);

		var requestsListener = $scope.$watch(
			function() {
				return TournamentRequestService
					.getRequests(tournament.id);
			},
			function(newValue, oldValue) {
				if (newValue === oldValue) {
					return;
				}

				return newValue
					.then(function(requests) {
						if (vm.tournament) {
							vm.tournament.requests = requests;
						}
					});
			});


		$scope.$on('destroy', function() {
			currentMatchListener();
			requestsListener();
		});

		SocketService.on('tm:match:start', function() {
			return MatchService.fetch(vm.tournament.id);
		});

		SocketService.on('tm:match:complete', function() {
			return MatchService.fetch(vm.tournament.id);
		});

		SocketService.on('tm:request:update', function() {
			return MatchService.fetch(vm.tournament.id);
		});


		activate();

		function activate() {
			TournamentsSocketService.startSockets();
			return $q.all({
					tournament: TournamentService.getTournament(tournament.id),
					currentMatch: CurrentMatchService.getMatch(tournament.id)
				})
				.then(function(responce) {
					vm.currentMatch = responce.currentMatch;
					vm.tournament = responce.tournament;
					return getAccountCurrentMatch();
				})
				.then(setViewMode);
		}

		function getAccountCurrentMatch() {
			return MatchService.fetchCurrentMatch()
				.then(function(matches) {
					vm.accountCurrentMatch = lodash.find(matches, function(m) {
						return vm.currentMatch && (m.id === vm.currentMatch.id);
					});
				});
		}

		function setViewMode() {
			if ($state.current.name === 'root.tournaments.details') {
				var viewMode = vm.currentMatch ?
					'root.tournaments.details.currentMatch' :
					'root.tournaments.details.brackets';
				if (!vm.tournament.isInvitationPeriod() &&
					!vm.tournament.isRunning()) {
					viewMode = 'root.tournaments.details.generalInfo';
				}
				$state.go(viewMode);
			}
		}

	}
})();
