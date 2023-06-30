const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const mongoose = require('mongoose');//
const User = require('../models/user') //mongoose.model('users');
passport.serializeUser((user, done) => {
    //console.log(user.id+ " from serialize")
    //console.log("pics: "+user.photos)
  done(null, user);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => { console.log("finding user from ps user:"+id)
    done(null, user);
    });
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID:  '334123776825-peg3umnmfdd7suhbtitkgchhguco9h1s.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3010/auth/callback',
        proxy:true,
      },
      async (accessToken, refreshToken, profile, done) => {
          //console.log("finding user with profile:"+profile.id)
        const existingUser = await User.findOne({ token: profile.id });
        if (existingUser) {
            //console.log("existing user found"+profile.displayName+profile.emails+" o "+profile.provider+"  p "+profile.photos)
          return done(null, existingUser);
        }
        console.log("non existing one, saving")
        const user = await new User({ token: profile.id,
                                      name:profile.displayName,
                                      email1:profile.emails[0].value,
                                      avatar:profile.photos[0].value
                                    }).save();
       // console.log("user: "+user.photos)
        done(null, user);
      }
    )
  );