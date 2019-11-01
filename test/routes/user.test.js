const request = require('supertest');
const app = require('../../src/app');

const jwt = require('jwt-simple');

const ROUTE = '/v1/users';

const mail = `${Date.now()}@mail.com`;
let user;

beforeAll(async () => {
 const res = await app.services.user.save({name: 'User Account', mail: `${Date.now()}@mail.com`, password: '654321'})
 user = {...res[0]};
 user.token = jwt.encode(user, 'segredo');
});


test('Deve listar todos os usuarios', () => {
    return request(app).get(ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir usuario com sucesso', () => {
    //const mail = `${Date.now()}@mail.com`;
    return request(app).post(ROUTE)
    .send({name : 'Andressa', mail, password: '12345'})
    .set('Authorization', `Bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Andressa');
        expect(res.body).not.toHaveProperty('password')

    });
});

test('Deve armazenar senha criptografada', async () => {
const res = await request(app).post(ROUTE)
.send({name : 'Andressa', mail: `${Date.now()}@mail.com`, password: '12345'})
.set('Authorization', `Bearer ${user.token}`);
expect(res.status).toBe(201);

const {id} = res.body;
const userDB = await app.services.user.find({id});
expect(userDB.password).not.toBeUndefined();
expect(userDB.password).not.toBe('12345');



});

//ESSA FORMA É A PREFERIDA PARA REALIZAR O TESTE
test('Não deve inserir usuário sem nome', () => {
    return request(app).post(ROUTE)
    .send({mail: 'johnjohnnodedev@mail.com', password: '12345'})
    .set('Authorization', `Bearer ${user.token}`) 
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});

test('Não deve inserir usuário sem email', async () => {
    const result = await request(app).post(ROUTE)
    .send({name : 'Andressa', password: '12345'})
    .set('Authorization', `Bearer ${user.token}`);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('E-mail é um atributo obrigatório');
});

test('Não deve inserir usuário sem senha', (done) => { //done ajuda manter o sincronismo da requisição
    request(app).post(ROUTE)
    .send({name : 'João', mail: 'jhonnopassword@mail.com'})
    .set('Authorization', `Bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Senha é um atributo obrigatório');
        done();
        //done.fail(); para falhar o teste
    });
});

test('Não deve inserir usuário com e-mail existente', () => {
    return request(app).post(ROUTE)
    .send({name : 'Andressa', mail : mail, password: '12345'})
    .set('Authorization', `Bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Já existe um usuário com esse e-mail');
    });
});