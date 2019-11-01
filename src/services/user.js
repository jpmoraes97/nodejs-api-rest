const ValidationError = require('../errors/ValidationError');
const bcrypt = require('bcrypt-nodejs');

module.exports = (app) => {
    const findAll = (filter = {}) => { //filtro por parametro , default = VAZIO
       return app.db('users').where(filter).select(['id', 'name', 'mail']);
    };

    const getPasswordHash = (password) => {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(password, salt);
    };

    const save = async (user) => {
      if(!user.name) return {error: 'Nome é um atributo obrigatório'}; // antes de salvar estou validando
      if(!user.mail) return {error: 'E-mail é um atributo obrigatório'}; // antes de salvar estou validando
      if(!user.password) return {error: 'Senha é um atributo obrigatório'}; // antes de salvar estou validando
      
      const userDb = await findAll({ mail: user.mail });
     
      if (userDb && userDb.length > 0) return { error: 'Já existe um usuário com esse e-mail' };
       user.password = getPasswordHash(user.password);
       return app.db('users').insert(user, ['id', 'name', 'mail']);
    };

    const find = (filter = {}) => { //filtro por parametro , default = VAZIO
      return app.db('users').where(filter).first();
    };

    return {findAll, save, find};
}