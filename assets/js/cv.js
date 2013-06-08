angular.module('content', ['ngResource']).
    factory('Content', function($resource) {
      var Content = $resource('content.json');

      return Content;
    });

angular.module('cv', ['content']).
    config(function($routeProvider) {
        $routeProvider.
            when('/:lang', {controller: langCtrl, templateUrl: 'cv'}).
            otherwise({redirectTo:'/en'});
    }).
    directive('hiddenRepeat',function($parse){
        return {
            link: function(scope, elem, attrs){
                scope.$watch(attrs.hiddenRepeat, function (newVal, oldVal, scope) {
                    var data = $parse(attrs.hiddenRepeat)(scope);
                    if(data){
                        for (var i=0;i< data.length;i++){
                          elem.append(data[i]+ "<br />");
                        }
                    }
                }, true);

            }
        };
    });

function langCtrl($scope, $location, $routeParams, Content) {
    var self = this;

    var lang = $scope.lang = $routeParams.lang;
    Content.get(function(content) {

        if (!(lang in content))

            // lang = 'zh';
            $location.path('/zh').relace();

        angular.extend($scope, content[lang]);
        console.log($scope.addr);
    });




}
