var AppHelper = {
    
    mimeMap:{
        jpg : "image/jpeg",
        jpeg: "image/jpeg",
        png : "image/png",
        gif : "image/gif"
    },
    
    resolveProfilePictureUrl: function (id) {
        if (id && id !== applicationSettings.emptyGuid) {
            return el.Files.getDownloadUrl(id);
        }
        else {
            return 'styles/images/avatar.png';
        }
    },
    resolvePictureUrl: function (id) {
        if (id && id !== applicationSettings.emptyGuid) {
            return el.Files.getDownloadUrl(id);
        }
        else {
            return '';
        }
    },
    getBase64ImageFromInput: function (input, cb) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
            if (cb)
                cb(e.target.result);
        };
        reader.readAsDataURL(input);
    },
    getImageFileObject: function (input, fileName, cb) {
        var name = fileName;
        var ext = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
        var mimeType = this.mimeMap[ext];
        if (mimeType) {
            var res = {
                "Filename": name,
                "ContentType": mimeType,
                "base64": input
            };
            cb(null, res);
        }
        else {
            cb("File type not supported: " + ext);
        }
    },
    formatDate: function (dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear().toString();
        var month = date.getMonth().toString();
        var day = date.getDate().toString();
        return day + '.' + month + '.' + year;
    },
    logout: function () {
        return el.Users.logout();
    }
};