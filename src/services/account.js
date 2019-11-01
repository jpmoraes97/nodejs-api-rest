module.exports = (app) => {

    const findAll = (userId) => {
        return app.db('accounts').where({user_id: userId});
    }; 

    const find = (filter = {}) => {
        return app.db('accounts').where(filter).first();
    };
    
    const save = async (account) => {
        if(!account.name) return { error: 'Nome e um atributo obrigatorio'};
        
        const accDB = await find({name: account.name, user_id: account.user_id})
        if(accDB) return { error: 'Já existe uma conta com esse nome'};

        return app.db('accounts').insert(account, '*');
    };

    const update = (id, account) => {
        return app.db('accounts').where({id}).update(account, '*');
    };

    const remove = (id) => {
        return app.db('accounts').where({id}).del();
    };

    return { save, findAll, find, update, remove };

};