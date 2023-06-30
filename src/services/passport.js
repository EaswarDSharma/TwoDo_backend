const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');//
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
          console.log(profile.displayName+"is the profile"); var d;
        var existingUser = await User.findOne({ email1: profile.emails[0].value});{ //finding from db and returning with 
          if(existingUser) {  existingUser.firsttimeentry=false; console.log('found');/*d=existingUser.email1;existingUser.email1=existingUser.email2;existingUser.email2=d;  */return done(null, existingUser);}
          if(!existingUser){  existingUser=await User.findOne({ email2: profile.emails[0].value});}
          if(existingUser) {  existingUser.firsttimeentry=false; console.log('found'); return done(null,existingUser);}}
       // console.log("non existing one, saving")
      //const user = mongoose.model('user',User)
       const user = await new User({ token: profile._id, // profile----->user present, 2
                                      name:profile.displayName,
                                      email1:profile.emails[0].value,
                                      avatar:profile.photos[0].value,
                                      firsttimeentry:true
                                    });
       // console.log("user: "+user.photos)
        done(null, user);
      }
    )
  );