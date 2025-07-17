const passport = require("passport");

const router = require("express").Router();

router.get("/google", passport.authenticate("google", { 
  scope: ["profile", 'email'],
  prompt: 'select_account'
}));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/users");
  }
);

router.get("/logout", (req, res, next) => {
  const sessionId = req.sessionID;
  
  req.logout(function(err) {
    if (err) { 
      console.error('Error durante logout:', err);
      return next(err); 
    }
    
    req.session.destroy(function(err) {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return next(err);
      }
      
      console.log(`Sesión ${sessionId} eliminada`);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

module.exports = router;

