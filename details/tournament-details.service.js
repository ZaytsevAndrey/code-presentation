(function() {
	'use strict';

	angular
		.module('app.tournaments')
		.factory('TournamentDetailsService', tournamentDetailsService);

	/* @ngInject */
	function tournamentDetailsService(lodash, gettextCatalog, moment,
		DEFAULT_TEAM_LOGO) {

		return {
			getPlaceTitle: getPlaceTitle,
			getGeneralInfo: getGeneralInfo,
			getTeams: getTeams
		};

		function getGeneralInfo(tournament) {
			var placeRewards = tournament.getPlaceRewards();

			// TODO: Refactor in viev according ng-switch
			var rewards = lodash.map(placeRewards, function(reward, i) {
				return {
					title: getPlaceTitle(i),
					amount: reward,
					getImgName: function() {
						switch (i) {
							case 0:
								return '1place';
							case 1:
								return '2place';
							case 2:
								return '3place';
							default:
								return 'place';
						}
					}
				};
			});

			// TODO: Refactor in viev according ng-switch
			var policy = [{
					title: tournament.gameApp.name,
					icon: 'icons8-controller'
				}, {
					title: tournament.isSolo() ?
						gettextCatalog.getString('Solo players') : gettextCatalog.getString('Team players'),
					icon: 'icons8-gender-neutral-user'
				}, {
					title: moment(tournament.registration_starts_at).lang('en').format("MMM DD YYYY HH:mm:ss"),
					icon: 'icons8-finish-flag'
				}, {
					title: tournament.participants()
						.current + '/' +
						tournament.participants()
						.total,
					icon: 'icons8-user-group-man-man'
				}

			];

			return {
				rewards: rewards,
				policy: policy
			};
		}
		// TODO: Refactor in viev according ng-switch
		function getPlaceTitle(index) {
			switch (index) {
				case 0:
					return gettextCatalog.getString('1st');
				case 1:
					return gettextCatalog.getString('2nd');
				case 2:
					return gettextCatalog.getString('3rd-4th');
				case 3:
					return gettextCatalog.getString('5th-8th');
				case 4:
					return gettextCatalog.getString('9th-16th');
				case 5:
					return gettextCatalog.getString('17th-32st');
				case 6:
					return gettextCatalog.getString('33nd-64rd');
				case 7:
					return gettextCatalog.getString('65th-128th');
				case 8:
					return gettextCatalog.getString('129th-256th');
				case 8:
					return gettextCatalog.getString('257th-512th');
			}
		}

		function getTeams(requests) {
			return lodash
				.chain(requests)
				.groupBy('team_id')
				.map(function(requests) {
					return {
						name: requests[0].team.name,
						logo_url: requests[0].team.logo.url || DEFAULT_TEAM_LOGO,
						players: requests,
						rankAverage: (lodash.sumBy(requests, function(p) {
							// TODO: Should find as for tournament.game_app_id
							return p.account.statistics[0].rank;
						})) / requests.length
					};
				})
				.value();
		}
	}
})();
