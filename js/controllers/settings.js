(function () {
    function SettingsCtrl($scope, $SettingsSrv) {
    	$scope.settings = $SettingsSrv.get();
        $scope.appTitle = 'Heatmap widget';
        $scope.year = 2013;

    }
    
    angular
    	.module('myApp')
    	.controller('SettingsCtrl', ['$scope', '$SettingsSrv', SettingsCtrl]);
})();