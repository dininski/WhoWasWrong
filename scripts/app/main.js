var app = (function () {
    'use strict';

    var showAlert = function(message, title, callback) {
        navigator.notification.alert(message, callback || function () {
        }, title, 'OK');
    };
    var showError = function(message) {
        showAlert(message, 'Error occured');
    };

    window.addEventListener('error', function (e) {
        e.preventDefault();
        var message = e.message + "' from " + e.filename + ":" + e.lineno;
        showAlert(message, 'Error occured');
        return true;
    });
       
    var onBackKeyDown = function(e) {
        e.preventDefault();
        navigator.notification.confirm('Do you really want to exit?', function (confirmed) {
            var exit = function () {
                navigator.app.exitApp();
            };
            if (confirmed === true || confirmed === 1) {
                //AppHelper.logout().then(exit, exit);
                exit();
            }
        }, 'Exit', 'Ok,Cancel');
    };
    var onDeviceReady = function() {
        document.addEventListener("backbutton", onBackKeyDown, false);
        if (navigator.connection.type == "none") {
            showAlert("Internet connection is required to run this app!", "No internet connection");
        }
    };

    document.addEventListener("deviceready", onDeviceReady, false);

    var facebook = new IdentityProvider({
        name: "Facebook",
        loginMethodName: "loginWithFacebook",
        endpoint: "https://www.facebook.com/dialog/oauth",
        response_type:"token",
        client_id: "622842524411586",
        redirect_uri:"https://www.facebook.com/connect/login_success.html",
        access_type:"online",
        scope:"email",
        display: "touch"
    });    

    // login view model
    var loginViewModel = (function () {
        var login = function () {
            var username = $('#loginUsername').val();
            var password = $('#loginPassword').val();

            el.Users.login(username, password)
            .then(function () {
                return usersModel.load();
            })
            .then(function () {
                mobileApp.navigate('views/wrongiesView.html');
            })
            .then(null,
                  function (err) {
                      showError(err.message);
                  }
            );
        };
        var loginWithFacebook = function() {
            mobileApp.showLoading();
            facebook.getAccessToken(function(token) {
                el.Users.loginWithFacebook(token)
                .then(function () {
                    return usersModel.load();
                })
                .then(function () {
                    mobileApp.hideLoading();
                    mobileApp.navigate('views/wrongiesView.html');
                })
                .then(null, function (err) {
                    mobileApp.hideLoading();
                    if (err.code = 214) {
                        showError("The specified identity provider is not enabled in the backend portal.");
                    }
                    else {
                        showError(err.message);
                    }
                });
            })
        } 
        return {
            login: login,
            loginWithFacebook: loginWithFacebook
        };
    }());

    // signup view model
    var singupViewModel = (function () {
        var dataSource;
        var signup = function () {
            dataSource.Gender = parseInt(dataSource.Gender);
            var birthDate = new Date(dataSource.BirthDate);
            if (birthDate.toJSON() === null)
                birthDate = new Date();
            dataSource.BirthDate = birthDate;
            Everlive.$.Users.register(
                dataSource.Username,
                dataSource.Password,
                dataSource)
            .then(function () {
                showAlert("Registration successful");
                mobileApp.navigate('#welcome');
            },
                  function (err) {
                      showError(err.message);
                  }
            );
        };
        var show = function () {
            dataSource = kendo.observable({
                Username: '',
                Password: '',
                DisplayName: '',
                Email: '',
                Gender: '1',
                About: '',
                Friends: [],
                BirthDate: new Date()
            });
            kendo.bind($('#signup-form'), dataSource, kendo.mobile.ui);
        };
        return {
            show: show,
            signup: signup
        };
    }());

    // wrongies view model
    var wrongiesViewModel = (function () {
        var init = function () {
            $("#select-filter").kendoMobileButtonGroup({
                select: function() {
                    switch (this.selectedIndex) {
                        case 0:
                            resetWrongiesFilter();
                            return;
                        case 1:
                            showHisWrongies();
                            return;
                        case 2:
                            showHerWrongies();
                            return;
                    }
                },
                index: 0
            });
        }
        var wrongieSelected = function (e) {
            mobileApp.navigate('views/wrongieView.html?uid=' + e.data.uid);
        };
        var resetWrongiesFilter = function() {
            wrongiesModel.wrongies.filter({});  
        };
        var showHisWrongies = function() {
            wrongiesModel.wrongies.filter({field: "IsMale", operator: "eq", value: true});
        };
        var showHerWrongies = function() {
            wrongiesModel.wrongies.filter({field: "IsMale", operator: "eq", value: false});
        };
        var navigateHome = function () {
            mobileApp.navigate('#welcome');
        };
        var logout = function () {
            AppHelper.logout()
            .then(navigateHome, function (err) {
                showError(err.message);
                navigateHome();
            });
        };
        return {
            init: init,
            wrongies: wrongiesModel.wrongies,
            wrongieSelected: wrongieSelected,
            logout: logout
        };
    }());

    // wrongie details view model
    var wrongieViewModel = (function () {
        var show = function(e) {
            var wrongie = wrongiesModel.wrongies.getByUid(e.view.params.uid);
            kendo.bind(e.view.element, wrongie, kendo.mobile.ui);
        };
        
        return {
            show: show
        };
    }());

    // add wrongie view model
    var addWrongieViewModel = (function () {
        var wrongieImageBase64 = null;
        var $isMale = true;
        var $newWrongie;
        var validator;
        var init = function () {
            validator = $('#enterStatus').kendoValidator().data("kendoValidator");
            $newWrongie = $('#newWrongie');
            $("#gender").kendoMobileSwitch({
                checked: true,
                onLabel: "HE",
                offLabel: "SHE",
                change: function() {
                    $isMale = !$isMale;
                }
            }); 
        };
        var show = function () {
            $newWrongie.val('');
            wrongieImageBase64 = null;
            validator.hideMessages();
        };
        var saveWrongie = function () {
            var that = this;
            if (validator.validate()) {
                var wrongies = wrongiesModel.wrongies;
                var wrongie = wrongies.add(wrongie);
                if (wrongieImageBase64) {
                    AppHelper.getImageFileObject(
                        wrongieImageBase64,
                        Math.floor(Math.random() * 10000000) + '.jpg',
                        function (err, fileObj) {
                            if (err) {
                                navigator.notification.alert(err);
                                return;
                            }
                            $.ajax({
                                type: "POST",
                                url: 'https://api.everlive.com/v1/' + applicationSettings.apiKey + '/Files',
                                contentType: "application/json",
                                data: JSON.stringify(fileObj),
                                error: function (error) {
                                    navigator.notification.alert(JSON.stringify(error));
                                }
                            }).done(function (data) {
                                //var item = imagesViewModel.images.add();
                                wrongie.Image = data.Result.Id;
                                wrongie.Content = $newWrongie.val();
                                wrongie.UserId = usersModel.currentUser.get('data').Id;
                                wrongie.DisplayName = usersModel.currentUser.get('data').DisplayName;
                                wrongie.IsMale = $isMale;
                                wrongies.one('sync', function () {
                                    mobileApp.navigate('#:back');
                                });
                                wrongies.sync();
                            });
                        });
                }
                else {
                    wrongie.Content = $newWrongie.val();
                    wrongie.UserId = usersModel.currentUser.get('data').Id;
                    wrongie.DisplayName = usersModel.currentUser.get('data').DisplayName;
                    wrongie.IsMale = $isMale;
                    wrongies.one('sync', function () {
                        mobileApp.navigate('#:back');
                    });
                    wrongies.sync();
                }
            }
        };
        var addWrongieImage = function() {
            var imageDestinationType = navigator.camera.DestinationType;
            
            navigator.camera.getPicture(function(base64img) {
                wrongieImageBase64 = base64img;
            }, function (err) {
                throw err;
            }, {
                quality: 30,
                destinationType: imageDestinationType.DATA_URL
            });
        };
        return {
            init: init,
            show: show,
            me: usersModel.currentUser,
            saveWrongie: saveWrongie,
            addWrongieImage: addWrongieImage
        };
    }());

    var statsViewModel = (function() {
        var show = function() {
            $("#chart").kendoChart({
                seriesDefaults: {
                    labels: {
                        visible: true,
                        template: "#= series.name # was wrong #= value # times"
                    }
                },
                series: [
                    {
                        data: [
                            {
                                name: "HE",
                                value: 53.8,
                                color: "#2E9AFE"
                            },{
                                name: "SHE",
                                value: 33.6,
                                color: "#F781D8"
                            }
                        ]
                    }
                ]
            });
        }
        return {
            show: show
        }
    }());
    
    return {
        viewModels: {
            login: loginViewModel,
            signup: singupViewModel,
            wrongies: wrongiesViewModel,
            wrongie: wrongieViewModel,
            addWrongie: addWrongieViewModel,
            stats: statsViewModel
        }
    };
}());