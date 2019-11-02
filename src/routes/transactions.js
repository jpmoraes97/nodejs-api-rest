const express = require('express');

module.exports = (app) => {
    const router = express.Router();

    router.param('id', (req, res, next) => {
        app.services.transaction.find(req.user.id , {'transactions.id': req.params.id})
        .then(result => {
            if(result.length > 0) return next();
            return res.status(403).json({error: 'Este recurso nao te pertence'});
        });
    });

    router.get('/', (req, res, next) => {
        app.services.transaction.find(req.user.id)
        .then(result => res.status(200).json(result));
    });

    router.post('/', (req, res, next) => {
       app.services.transaction.save(req.body)
       .then((result) => res.status(201).json(result[0])); 
    });

    router.get('/:id' , (req, res, next) => {
        app.services.transaction.findOne({id: req.params.id})
        .then((result) => res.status(200).json(result));
    });

    router.put('/:id', (req, res, next) => {
        app.services.transaction.update(req.params.id, req.body)
        .then(result => res.status(200).json(result[0]));
    })

    router.delete('/:id', (req, res, next) => {
        app.services.transaction.remove(req.params.id)
        .then(() => res.status(204).send());
    });


    return router;
}