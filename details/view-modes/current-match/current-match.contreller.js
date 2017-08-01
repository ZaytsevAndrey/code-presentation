(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.controller('CurrentMatchController', controller);

	/* @ngInject */
	function controller($window, $intercom, tournament, CurrentMatchService) {

		var vm = this;
		vm.tournament = tournament;
		vm.launchDota = launchDota;


		activate();

		function activate() {
			return CurrentMatchService.getMatch(vm.tournament.id)
				.then(
					function(currentMatch) {
						vm.currentMatch = currentMatch;
						return vm.currentMatch;
					}
				);
		}

		function launchDota() {
			// $intercom('trackEvent', 'click-launch-dota-btn');
			// $window.location.href = 'steam://run/570';
		}
	}
})();
