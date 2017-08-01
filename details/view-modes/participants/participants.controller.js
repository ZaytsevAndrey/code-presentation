(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.controller('ParticipantsController', controller);

	/* @ngInject */
	function controller($scope,
		lodash, tournament, TournamentDetailsService, TournamentRequestService,
		AccountModalService) {

		var vm = this;
		vm.tournament = tournament;
		vm.showAccountInfoModal = showAccountInfoModal;
		vm.sortByEloRating = sortByEloRating;
		vm.sortByAvgEloRating = sortByAvgEloRating;
		vm.sortByName = sortByName;
		vm.sortByTeamName = sortByTeamName;
		vm.participantsReverse = participantsReverse;
		vm.participants = [];

		var requestsListener = $scope.$watch(
			function() {
				return TournamentRequestService
					.getRequests(vm.tournament.id);
			},
			function(newValue, oldValue) {
				if (newValue === oldValue) {
					return;
				}

				return newValue
					.then(function(requests) {
						vm.participants = vm.tournament.isSolo() ? requests :
							TournamentDetailsService.getTeams(requests);
						vm.tournament.requests = requests;
					});
			});

		$scope.$on('destroy', requestsListener);

		activate();


		function activate() {
			return TournamentRequestService.getRequests(vm.tournament.id)
				.then(function(response) {
					vm.participants = vm.tournament.isSolo() ? response :
						TournamentDetailsService.getTeams(response);
				});
		}


		function showAccountInfoModal(account) {
			return AccountModalService.showAccountInfoModal(account);
		}

		function sortByEloRating() {
			vm.participants = lodash.sortBy(vm.participants, function(p) {
				return -p.account.statistics[0].rank;
			});

			return vm.participants;
		}

		function sortByAvgEloRating() {
			vm.participants = lodash.sortBy(vm.participants, function(p) {
				return -p.rankAverage;
			});

			return vm.participants;
		}

		function sortByName() {
			vm.participants = lodash.sortBy(vm.participants,
				function(o) {
					return o.account.steam_personal_name;
				});

			return vm.participants;
		}

		function sortByTeamName() {
			vm.participants = lodash.sortBy(vm.participants, 'name');
			return vm.participants;
		}

		function participantsReverse() {
			vm.participants = lodash.reverse(vm.participants);
			return vm.participants;
		}
	}
})();
