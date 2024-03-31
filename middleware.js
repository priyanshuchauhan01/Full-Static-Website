const Review = require("./model/Reviews"); // Ensure correct import

module.exports.isloggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to do this!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear the redirectUrl from session after setting in res.locals
    }
    next();
};

module.exports.isListingOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect(`/listings/${req.params.id}`);
        }
        if (!listing.owner.equals(req.user._id)) { // Check if the owner matches the logged-in user
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${req.params.id}`);
        }
        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Error checking listing ownership");
        res.redirect("/listings");
    }
};

module.exports.isReviewsAuthor = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect("back");
        }
        // Check if the current user is the author of the review
        if (!req.user || !review.author.equals(req.user._id)) {
            req.flash("error", "You are not authorized to delete this review");
            return res.redirect("back");
        }
        // If authorized, continue to the next middleware or route handler
        next();
    } catch (err) {
        console.error(err);
        req.flash("error", "Error checking review authorship");
        res.redirect("back");
    }
};
