(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.directive('joinButtonDirective', joinButton);

	/* @ngInject */
	function joinButton(TournamentService, CardService, AccountService) {

		return {
			restrict: 'A',
			scope: {
				tournament: '='
			},
			templateUrl: 'app/tournaments/details/join-button/button.html',
			link: function(scope) {
				var _disabled = false;

				scope.join = function() {
					if (_disabled) {
						return;
					}
					_disabled = true;
					return CardService.joinTournament(scope.tournament)
						.then(function() {
							_disabled = false;
						});
				};

				scope.leave = function() {
					if (_disabled) {
						return;
					}
					_disabled = true;
					return CardService.leaveTournament(scope.tournament)
						.then(function() {
							_disabled = false;
						});
				};

				scope.isDisabled = function() {
					return _disabled;
				};

				scope.isParticipant = function() {
					if (scope.account) {
						return TournamentService.userIsParticipant(
							scope.tournament,
							scope.account
						);
					}
				};

				function activate() {
					return AccountService.getAccount()
						.then(function(account) {
							scope.account = account;
						});
				}

				activate();
			}
		};
	}
})();
