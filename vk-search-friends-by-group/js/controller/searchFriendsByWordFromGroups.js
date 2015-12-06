/**
 * SearchFriendsByWordFromGroupsCtrl
 */
'use strict';
app.controller('SearchFriendsByWordFromGroupsCtrl', function ($scope, ngToast, $timeout, cfpLoadingBar) {

    $scope.word = "Порно";

    var array_members_in_groups;
    $.get('js/execute/get_array_members_in_groups.js', function () {
    }).fail(function (code) {
        array_members_in_groups = code.responseText;
        console.clear();
    });

    $scope.search = function () {
        console.clear();
        VK.api("groups.search", {q: $scope.word, count: "1000", https: "1", v: "5.40"}, function (data) {
            var groups_public = [];
            var items = data.response.items;
            for (var i = 0; i < items.length; i++) {
                if (items[i].is_closed == 0 || items[i].is_closed == 1) {
                    groups_public[groups_public.length] = items[i].id;
                }
            }
            setTimeout(function () {
                get_friends_from_groups(groups_public, 0, groups_public.length);
            }, 350);
        });
    };

    var array_groups_and_items = [];
    var get_friends_from_groups = function (items, offset, count) {
        var groups = [];
        for (var i = offset, j = 0; i < offset + 25; i++, j++) {
            if (i < count) {
                groups[j] = items[i];
            }
        }
        var code = array_members_in_groups
            .replace("$groups_ids$", JSON.stringify(groups));

        VK.api("execute", {code: code, https: 1}, function (data) {
            array_groups_and_items = ArrMath.Sum(array_groups_and_items, JSON.parse(data.response));
            if (offset + 25 < count) {
                setTimeout(function () {
                    get_friends_from_groups(items, offset + 25, count);
                }, 350);
            } else {
                var result_array_groups = [];
                for (var i = 0; i < array_groups_and_items.length; i++) {
                    if (array_groups_and_items[i].items.length > 0) {
                        result_array_groups[result_array_groups.length] = array_groups_and_items[i];
                    }
                }
                console.log(result_array_groups);
            }
        });
    };

    $(document).bind('keydown', function () {
        if (event.keyCode == 13) {
            $scope.search();
        }
    });


});