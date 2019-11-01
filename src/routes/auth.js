const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const secret = 'segredo';



module.exports = (app) => {
    const router = express.Router();
    router.post('/signin',(req, res, next) => {
        app.services.user.find({mail: req.body.mail})
        .then((user) => {
            if(bcrypt.compareSync(req.body.password, user.password)){
                const payLoad = {
                    id: user.id,
                    name: user.name,
                    mail: user.mail,
                };
                const token = jwt.encode(payLoad, secret);
                res.status(200).json({token});
            }
            
        }).catch(err => console.log(err));
    });


    router.post('/signup', async (req, res) => {
        const result = await app.services.user.save(req.body);

        if(result.error) return res.status(400).json(result); 

        res.status(201).json(result[0]);
    });




    return router;
};