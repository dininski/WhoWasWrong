var wrongiesModel = (function() {
    "use strict"
    var wrongieModel = {
        id: 'Id',
        fields: {
            Content: {
                field: 'Content',
                defaultValue: ''
            },
            CreatedAt: {
                field: 'CreatedAt',
                defaultValue: new Date()
            },
            CreatedBy: {
                field: 'UserId',
                defaultValue: []
            },
            FavouritedBy: {
                field: 'UserId',
                defaultValue: []
            },
            IsMale: {
                field: 'IsMale',
                defaultValue: true
            },
            Image: {
                field: 'Image',
                defaultValue: ''
            }
        },
        CreatedAtFormatted: function () {
            return AppHelper.formatDate(this.get('CreatedAt'));
        },
        User: function () {
            var userId = this.get('UserId');
            var user = $.grep(usersModel.users(), function (e) {
                return e.Id === userId;
            })[0];
            
            return user ? {
                DisplayName: user.DisplayName
            } : {
                DisplayName: 'Anonymous'
            };
        },
        ImageLocation: function() {
            var imageLocation = AppHelper.resolvePictureUrl(this.get('Image'));
            return imageLocation;
        }
    };
    var wrongiesDataSource = new kendo.data.DataSource({
        type: 'everlive',
        schema: {
            model: wrongieModel
        },
        transport: {
            typeName: 'Wrongie'
        },
        change: function (e) {
            if (e.items && e.items.length > 0) {
                $('#no-activities-span').hide();
            }
            else {
                $('#no-activities-span').show();
            }
        },
        sort: { field: 'CreatedAt', dir: 'desc' }
    });
    return {
        wrongies: wrongiesDataSource
    };
})();