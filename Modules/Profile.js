var Profile = function (app, logWriter, mongoose) {

    var ProfileSchema = mongoose.Schema({
        _id: Number,
        profileName: { type: String, default: 'emptyProfile' },
        profileDescription: { type: String, default: 'No description' },
        profileAccess: [{
            module: { type: Number, ref: "modules" },
            access: {
                read: { type: Boolean, default: false },
                editWrite: { type: Boolean, default: false },
                del: { type: Boolean, default: false }
            }
        }]

    }, { collection: 'Profile' });

    var profile = mongoose.model('Profile', ProfileSchema);

    app.post('/Profiles', function (req, res) {
        var data = {};
        data.mid = req.headers.mid;
        if (req.session && req.session.loggedIn) {
            createProfile(req.body, res);
        } else {
            res.send(401);
        }
    });

    app.get('/Profiles', function (req, res) {
        console.log('---------SERVER----getProfiles-------------------------------');
        data = {};
        data.mid = req.param('mid');
        if (req.session && req.session.loggedIn) {
            getProfile(res);
        } else {
            res.send(401);
        }
    });

    app.put('/Profiles/:_id', function (req, res) {
        console.log(req.body);
        data = {};
        var id = req.param('_id');
        data.mid = req.headers.mid;
        if (req.session && req.session.loggedIn) {
            updateProfile(id, req.body, res);
        } else {
            res.send(401);
        }
    });

    app.delete('/Profiles/:_id', function (req, res) {
        data = {};
        var id = req.param('_id');
        data.mid = req.headers.mid;
        if (req.session && req.session.loggedIn) {
            removeProfile(id, res);
        } else {
            res.send(401);
        }
    });

    function createProfile(data, res) {
        try {
            console.log('createProfile');
            if (!data.profileName) {
                logWriter.log('Profile.create Incorrect Incoming Data');
                res.send(400, { error: 'Profile.create Incorrect Incoming Data' });
                return;
            } else {
                console.log(data);
                profile.find({ profileName: data.profileName }, function (error, doc) {
                    try {
                        if (error) {
                            console.log(error);
                            logWriter.log("Profile.js create profile.find");
                            res.send(500, { error: 'Profile.create find error' });
                        }
                        if (doc.length > 0) {
                            console.log("A Profile with the same name already exists");
                            res.send(400, { error: 'A Profile with the same name already exists' });
                        } else if (doc.length === 0) {
                            saveProfileToDb(data);
                        }
                    }
                    catch (error) {
                        logWriter.log("Profile.js create profile.find " + error);
                        res.send(500, { error: 'Profile.create find error' });
                    }
                });
            }
            function saveProfileToDb(data) {
                try {
                    _profile = new profile({ _id: Date.parse(new Date()) });
                    if (data.profileName) {
                        _profile.profileName = data.profileName;
                    }
                    if (data.profileDescription) {
                        _profile.profileDescription = data.profileDescription;
                    }
                    if (data.profileAccess) {
                        _profile.profileAccess = data.profileAccess;
                    }
                    _profile.save(function (err, result) {
                        try {
                            if (err) {
                                console.log(err);
                                logWriter.log("Profile.js saveProfileToDb _profile.save" + err);
                                res.send(500, {error: "Profile save failed"});
                            }
                            if (result) {
                                console.log("Data Profile saved success");
                                res.send(201, {success:"Profile Saved"});
                            }
                        }
                        catch (error) {
                            console.log(error);
                            logWriter.log("Profile.js saveProfileToDb _profile.save" + error);
                            res.send(500, { error: 'Profile.create find error' });
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                    logWriter.log("Profile.js saveProfileToDb " + error);
                    res.send(500, { error: 'Profile.create find error' });
                }
            }
        }
        catch (exception) {
            console.log(exception);
            logWriter.log("Profile.js  create " + exception);
            res.send(500, { error: 'Profile.create find error' });
        }
    };

    function getProfile(response) {
        var res = {};
        res['data'] = [];
        var query = profile.find({});
        query.sort({profileName: 1 }).
        populate('profileAccess.module');
        query.exec(function (err, result) {
            if (err || result.length == 0) {
                if (err) {
                    console.log(err);
                    logWriter.log("Profile.js getProfiles profile.find " + err);
                }
                response.send(404, { error: "Can't find Profile" });
            } else {
                res['data'] = result;
                response.send(res);
            }
        });
    };

    function updateProfile(_id, data, res) {
        try {
            delete data._id;
            profile.update({ _id: _id }, data, function (err, result) {
                if (result) {
                    console.log(" RESULT " + result);
                    res.send(200, { success: 'Profile updated success' });
                } else if(err){
                        logWriter.log("Profile.js update profile.update" + err);
                        res.send(500, { error: "Can't update Profile" });
                    }  else  {
                    res.send(500, { error: "Can't update Profile" });
                }
            });
        }
        catch (exception) {
            console.log(exception);
            logWriter.log("Profile.js update " + exception);
            res.send(500, { error: exception });
        }
    };

    function removeProfile(_id, res) {
        profile.remove({ _id: _id }, function (err, result) {
            if (err) {
                console.log(err);
                logWriter.log("Profile.js remove profile.remove " + err);
                res.send(500, { error: "Can't remove Profile" });
            } else {
                res.send(200, { success: 'Profile removed' });
            }
        });
    };

    return {
        
        createProfile: createProfile,
        
        getProfile: getProfile,
        
        updateProfile: updateProfile,
        
        removeProfile: removeProfile,
        
        profile: profile
    };

};
module.exports = Profile;