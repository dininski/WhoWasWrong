var usersModel = (function () {
    var currentUser = kendo.observable({ data: null });
    var usersData;
    var loadUsers = function () {
        return el.Users.currentUser()
        .then(function (data) {
            var currentUserData = data.result;
            currentUserData.PictureUrl = AppHelper.resolveProfilePictureUrl(currentUserData.Picture);
            currentUser.set('data', currentUserData);
            return el.Users.get();
        })
        .then(function (data) {
            usersData = new kendo.data.ObservableArray(data.result);
        })
        .then(null,
              function (err) {
                  showError(err.message);
              }
        );
    };
    return {
        load: loadUsers,
        users: function () {
            return usersData;
        },
        currentUser: currentUser
    };
}());