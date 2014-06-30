(function () {
    function HeatmapCtrl($scope, $http, $SettingsSrv) {
        $scope.settings = $SettingsSrv.get();
        
        $http
            .get('data/sample.json')
            .then(function(result) {
                var _data = [],
                    _val = result.data.values;
                for (var line in _val) {
                    _data[_val[line][0].data] = _val[line][1].data;
                };
                $scope.settings.data = _data;
                delete _val;
                delete _data;

        
                $scope.heatmap1 = new widgets.Heatmap({year: $scope.settings.year, data: $scope.settings.data});
                $scope.heatmap2 = new widgets.Heatmap({container: 'heatmap-widget2', year: $scope.settings.year, data: $scope.settings.data});
                $scope.heatmap3 = new widgets.Heatmap({container: 'heatmap-widget3', year: $scope.settings.year, data: $scope.settings.data});
                $scope.heatmap4 = new widgets.Heatmap({container: 'heatmap-widget4', year: $scope.settings.year, dataurl: 'data/sample.json'});
                window.setTimeout(function() {$scope.heatmap4.refresh({dataurl: 'data/sample1.json'})}, 5000);
            });

        $scope.settings.refreshWidget = function () {
            console.log('refreshing');
            $scope.heatmap4.refresh({lowColor: $scope.settings.lowColor, highColor: $scope.settings.highColor, data: $scope.settings.data});
        }
    }

    angular
        .module('myApp')
        .controller('HeatmapCtrl', ['$scope', '$http', '$SettingsSrv', HeatmapCtrl]);
})();