const express = require('express');

module.exports = (app) => {
    const router = express.Router();    
    router.get('/', (req, res) => {
        app.services.user.findAll()
        .then(result => res.status(200).json(result));
    });
    
    router.post('/', async (req, res) => {
        const result = await app.services.user.save(req.body);

        if(result.error) return res.status(400).json(result); // na minha rota se voltar um atributo erro quer dizer que deu problema

        res.status(201).json(result[0]);
    });

    return router;
}