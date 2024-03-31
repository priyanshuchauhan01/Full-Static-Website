if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
} 
const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require('express-flash');
const Joi = require('joi');
const mongoose = require("mongoose");
const Listing = require("./model/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./util/wrapasync.js");  
const ExpressError = require("./util/expresserror.js");
const Review = require("./model/Reviews.js"); 
const ReviewsSchema = require('./schema.js');
const User = require("./model/user.js");
const passport = require('passport');
const {saveRedirectUrl ,isloggedIn,  isReviewsAuthor} = require("./middleware.js")
const LocalStrategy = require('passport-local').Strategy;

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const dbUrl = process.env.ATLASDB_URL; // Corrected variable name
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600
})
store.on("error", () => {
  console.log("ERROR IS MONGO SESSION STORE");
});


const sessionOption = { 
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expire : Date.now() + 100 *60 *60 *24 *3,
    maxAge :  100 *60 *60 *24 *3,
    httponly : true
  },
};


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // Make the current user available in templates
  next();
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  // Assuming you have a variable named flexSwitchCheckChecked available
  const flexSwitchCheckChecked = true; // Set this value based on your logic
  res.render("listings/index.ejs", { allListings, flexSwitchCheckChecked });
}));

// New Route
app.get("/listings/new",isloggedIn,(req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get('/listings/:id', wrapAsync(async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("reviews").populate({
      path: "reviews",
      populate:{
        path : "author",
      },
    }).populate("owner");
    if (!listing) {
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
    }
    res.render('listings/show', { listing, currentUser: req.user, imageUrl: listing.image.url });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error fetching listing details");
    res.redirect("/listings");
  }
}));

// Create Route
app.post("/listings", isloggedIn , wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success" , "New Listing Created");
  res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit",isloggedIn , wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if(!listing){
    req.flash("error" , "Listing does not exit");
    res.redirect("/listings")
  }
 res.render("listings/edit.ejs", { listing });
}));

// Update Route with proper error handling
app.put("/listings/:id", isloggedIn , wrapAsync(async (req, res, next) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedListing) {
      throw new ExpressError(404, "Listing not found");
    }
    req.flash("success" , "New Listing Updated");
    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    next(err);
  }
}));

// Delete Listing Route
app.delete("/listings/:id", isloggedIn,wrapAsync(async (req, res) => {
  const { id } = req.params;
  // Add logic here to delete the listing based on the ID
  // For example:
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
}));
;

const validateReview = (req, res, next) => {
  const { error } = ReviewsSchema.validate(req.body.review);
 if (error) {
    const errMsg = error.details.map((el) => el.message).join(', ');
    return res.status(400).send(`Validation error: ${errMsg}`);
  }
  next();
}; 

// Reviews route 
app.post("/listings/:id/reviews",isloggedIn, validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await listing.save();
  await newReview.save();
  req.flash("success", "New Review added");
  res.redirect(`/listings/${req.params.id}`);
}));

// Delete Review Route
app.delete("/listings/:listingId/reviews/:reviewId", isloggedIn, isReviewsAuthor, wrapAsync(async (req, res) => {
  const { reviewId, listingId } = req.params;
  try {
      await Review.findByIdAndDelete(reviewId); // Delete the review
      req.flash("success", "Review Deleted");
      res.redirect(`/listings/${listingId}`);
  } catch (err) {
      console.error(err);
      req.flash("error", "Error deleting review");
      res.redirect(`/listings/${listingId}`);
  }
}));

app.get("/login", async (req, res) => {
  res.render("users/login.ejs");
});

app.get("/signup", async (req, res) => {
  res.render("users/signup.ejs");
});
   
app.post("/login", saveRedirectUrl, passport.authenticate('local', { 
  failureRedirect: '/login', 
  failureFlash: true 
}), async (req, res) => {
  req.flash("success", "Welcome back to Wonder");
  res.redirect(res.locals.redirectUrl || '/listings');
});

app.post("/signup", wrapAsync(async (req, res) => {
  let { username, email, password } = req.body;
  const newUser = new User({ email, username });
  try {
    const registerUser = await User.register(newUser, password);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wonder");
      res.redirect("/listings");
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'UserExistsError') {
      req.flash("error", "User with that email or username already exists.");
    } else {
      req.flash("error", "Registration failed. Please try again.");
    }
    res.redirect("/signup");
  }
}));

app.get("/logout" , (req , res , next)=>{
  req.logOut((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success" , "you are logged out!");
    res.redirect("/listings")
  });
});

// footer 
app.get("/privacy",(req, res)=>{
  res.render("include/footer/privacy.ejs")
})
app.get("/terms",(req, res)=>{
  res.render("include/footer/terms.ejs")
})
app.get("/company",(req, res)=>{
  res.render("include/footer/company.ejs")
})

// Request-to-Book
app.get("/requestbook", (req, res) => {
  res.render("listings/request.ejs"); 
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(`Error ${statusCode}: ${message}`);
});



