const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { readFileSync } = require('fs');
const {MongoClient} = require('mongodb');
require('dotenv').config();

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');

//  Создаем асинхронную функцию
async function start() {
    try {
        const app = express();
        const MONGO_DB = process.env.DB_HOST;

        const client = await MongoClient.connect(
            MONGO_DB,
            {useNewUrlParser: true}
        );

        const db = client.db();
        const context = {db};

        const server = new ApolloServer({typeDefs, resolvers, context});

        server.applyMiddleware({app});

        app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));

        app.get('/playground', expressPlayground({endpoint: '/graphql'}));

        app.listen({port: 4000}, () => {
            console.log(`GraphQL Server @ http://localhost:4000${server.graphqlPath}`)
        });
    } catch (e) {
        console.error(e);
    }

}

start();


/*
let _id = 5;

let tags = [
    { "photoID": "1", "userID": "gPlake" },
    { "photoID": "2", "userID": "sSchmidt" },
    { "photoID": "2", "userID": "mHattrup" },
    { "photoID": "2", "userID": "gPlake" }
];

let users = [
    { "githubLogin": "mHattrup", "name": "Mike Huttrup" },
    { "githubLogin": "sSchmidt", "name": "Glen Plake" },
    { "githubLogin": "gPlake", "name": "Scot Schmidt" }
];

let photos = [
    {
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "the heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "1-2-1986"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created": "2018-04-15T19:09:57.308Z"
    }
];
*/