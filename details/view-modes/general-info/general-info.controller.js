(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.controller('GeneralInfoController', controller);

	/* @ngInject */
	function controller(tournament, TournamentDetailsService, gettextCatalog) {

		var vm = this;
		vm.tournament = tournament;
		vm.generalInfo = TournamentDetailsService.getGeneralInfo(vm.tournament);
		vm.currentLang = currentLang;

		function currentLang() {
			return gettextCatalog.getCurrentLanguage();
		}

	}
})();
