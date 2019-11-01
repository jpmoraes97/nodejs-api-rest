const passport = require('passport');
const passportJwt = require('passport-jwt');

const { Strategy, ExtractJwt } = passportJwt;

module.exports = (app) => {
    const params = {
        secretOrKey: 'segredo',
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };

    const strategy = new Strategy(params, (payload, done) => {
        app.services.user.find({id: payload.id})
        .then((user) => {
            if(user) done(null, {...payload});
            else done(null, false);
        });
    });
   
    passport.use(strategy);

    return {
        authenticate: () => passport.authenticate('jwt', { session: false }),  
    };

};