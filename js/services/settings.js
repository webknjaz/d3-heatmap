(function () {
    angular
        .module('myApp')
        .factory('$SettingsSrv', function() {
            var settings = {
                year: 2013,
                lowColor: 'rgb(190, 219, 57)',
                highColor: 'rgb(255, 83, 71)'
            };
            return {
                        get: function () {
                            return settings;
                        }
                    };
        });
})();