const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const ROUTE = '/v1/accounts';
let user;
let user2;

//beforeAll -> Executa uma vez antes de todos os testes
//beforeEach -> Executa antes de cada um dos testes
beforeEach(async () => {
 const res = await app.services.user.save({name: 'User Account', mail: `${Date.now()}@mail.com`, password: '654321'})
 user = {...res[0]};
 user.token = jwt.encode(user, 'segredo');

 const res2 = await app.services.user.save({name: 'User Account 2', mail: `${Date.now()}@mail.com`, password: '654321'})
 user2 = {...res2[0]};

});

test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(ROUTE)
       // .send({ name: 'Acc #2', user_id: user.id }) // como estamos trabalhando com token nao precisa informar ID
       .send({ name: 'Acc #2'})
       .set('Authorization', `Bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(201);
            expect(result.body.name).toBe('Acc #2');
        });
});

test('Nao deve inserir uma conta sem nome', () => {
    return request(app).post(ROUTE)
    //.send({ user_id: user.id }) // como estamos trabalhando com token nao precisa informar ID
    .send({})
    .set('Authorization', `Bearer ${user.token}`)
    .then((result) => {
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Nome e um atributo obrigatorio');
    });
});

test('Nao deve inserir conta com nome duplicado para o mesmo usuario', () => {
    return app.db('accounts').insert({name: 'Acc Duplicada', user_id: user.id})
    .then(() => request(app).post(ROUTE)
    .set('Authorization', `Bearer ${user.token}`).send({name: 'Acc Duplicada'}))
    .then((result) => {
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Já existe uma conta com esse nome');
    });
});

/*
test('Deve listar todas as contas', () => {
    return app.db('accounts').insert({name: 'Acc #List', user_id: user.id})
    .then(() => request(app).get(ROUTE)
    .set('Authorization', `Bearer ${user.token}`))
    .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.length).toBeGreaterThan(0);
    });
});
*/

test('Deve listar apenas as contas do usuario', () => {
    return app.db('accounts').insert([
        {name: 'Acc User #1', user_id: user.id},
        {name: 'Acc User #2', user_id: user2.id}
    ]).then(() => {
        request(app).get(ROUTE)
        .set('Authorization', `Bearer ${user.token}`)
        .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.length).toBe(1);
        expect(result.body[0].name).toBe('Acc User #1');
    });
    });
});



test('Deve retornar uma conta por id', () => {
    return app.db('accounts')
    .insert({name: 'Acc #ByID', user_id: user.id}, ['id'])
    .then(acc => request(app).get(`${ROUTE}/${acc[0].id}`)
    .set('Authorization', `Bearer ${user.token}`))
    .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.name).toBe('Acc #ByID');
        expect(result.body.user_id).toBe(user.id);
    });
});

test('Nao deve retornar uma conta de outro usuario', () => {
    return app.db('accounts')
    .insert({name: 'Acc User #2', user_id: user2.id}, ['id'])
    .then(acc => request(app).get(`${ROUTE}/${acc[0].id}`)
    .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Este recurso não pertence ao usuário');
    })
});


test('Deve alterar uma conta', () => {
    return app.db('accounts')
    .insert({name: 'Acc #ToUpdate', user_id: user.id}, ['id'])
    .then(acc => request(app).put(`${ROUTE}/${acc[0].id}`)
    .send({name: 'Acc Updated'})
    .set('Authorization', `Bearer ${user.token}`))
    .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.name).toBe('Acc Updated');
    });
});

test('Nao deve alterar uma conta de outro usuario', () => {
    return app.db('accounts')
    .insert({name: 'Acc User #2', user_id: user2.id}, ['id'])
    .then(acc => request(app).put(`${ROUTE}/${acc[0].id}`)
    .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Este recurso não pertence ao usuário');
    })
});


test('Deve remover uma conta', () => {
    return app.db('accounts')
    .insert({name: 'Acc #toRemove', user_id: user.id}, ['id'])
    .then(acc => request(app).delete(`${ROUTE}/${acc[0].id}`)
    .set('Authorization', `Bearer ${user.token}`))
    .then((result) => {
        expect(result.status).toBe(204);
    });
});

test('Nao deve remover uma conta de outro usuario', () => {
    return app.db('accounts')
    .insert({name: 'Acc User #2', user_id: user2.id}, ['id'])
    .then(acc => request(app).delete(`${ROUTE}/${acc[0].id}`)
    .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Este recurso não pertence ao usuário');
    })
});

