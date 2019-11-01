const request = require('supertest');
const app = require('../../src/app');

test('Deve receber token ao logar', () => {
    const mail = `${Date.now()}@mail.com`;
    return app.services.user.save(
        {name: 'Joao Autenticado', mail, password: 't3st3s'})
        .then(() => request(app).post('/auth/signin')
        .send({mail, password: 't3st3s'}))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
});

test.skip('Nao deve autenticar usuario com senha invalida', () => {
    const mail = `${Date.now()}@mail.com`;
    return app.services.user.save(
        {name: 'Joao Autenticado', mail, password: 't3st3s'})
        .then(() => request(app).post('/auth/signin')
        .send({mail, password: 'inv4lida'}))
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Usuario e/ou senha invalido');
        });
});

test('Não deve acessar uma rota protegida sem token', () => {
    return request(app).get('/v1/users')
    .then((res) => {
        expect(res.status).toBe(401);
    });
});

test('Deve criar usuário via signup', () => {
    return request(app).post('/auth/signup')
    .send({name: 'John Node', mail: `${Date.now()}@mail.com`, password: 't3st3s'})
    .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe('John Node');
        expect(res.body).toHaveProperty('mail');
        expect(res.body).not.toHaveProperty('password');
    });
});