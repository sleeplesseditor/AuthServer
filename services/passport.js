const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

//Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    //Verify email and password, call 'done' with user if it's correct email and password
    //Otherwise call 'done' with false
    User.findOne({ email: email }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        
        //Compare passwords – is 'password' equal to user.password?
        user.comparePassword(password, function(err, isMatch) {
            if (err) { return done(err); }
            if (!isMatch) { return done(null, false); }
            
            return done(null, user);
        });
    });
});

//Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

//Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    //See if user ID in payload exists in database
    //If it does, call 'done' with user
    //Otherwise, call 'done' without user object
    User.findById(payload.sub, function(err, user) {
        if (err) { return done(err, false); } 
        
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

//Tell Passport to use this Strategy
passport.use(jwtLogin);
passport.use(localLogin);