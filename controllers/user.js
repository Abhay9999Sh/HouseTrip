const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res) => {
    try {
      let {username, email, password} = req.body;
      const newUser = new User({email, username});
      const registeredUser =  await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, ((err) => {    //passport inbuilt login immediately after signup
        if(err) {
          return next(err);
        }
        req.flash("success", "Welcome to HouseTrip");
      res.redirect("/listings");
      })); 
    }
    catch(err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
};

module.exports.renderLoginform = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) => {
    req.flash("success","Welcome back to HouseTrip");
    let redirecturl = res.locals.redirectUrl  || "/listings";  // to solve  direct login error 
    res.redirect(redirecturl);
};

module.exports.logout = (req, res) => { 
    req.logout((err) => {   
      if(err) {    
        return next(err);
      }
      req.flash("success", "you are logged out");
      res.redirect("/listings");   // now , you have to log in again to edit/create listing 
    })
};