const {GraphQLScalarType} = require('graphql');
const {authorizeWithGithub} = require('../lib');
const fetch = require('node-fetch');

module.exports = {


    Query: {
        totalPhotos: (parent, args, {db}) => {
            return db.collection('photos')
                .estimatedDocumentCount();
        },
        allPhotos: (parent, args, {db}) => {
            return db.collection('photos')
                .find()
                .toArray();
        },
        totalUsers: (parent, args, {db}) => {
            return db.collection('users')
                .estimatedDocumentCount();
        },
        allUsers: (parent, args, {db}) => {
            return db.collection('users')
                .find()
                .toArray();
        },
        githubLoginUrl: () => {
            return `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`;
        },
        me: (parent, args, {currentUser}) => currentUser,
        User: (parent, args, {db}) =>
            db.collection('users')
                .findOne({githubLogin: args.login})
    },

    Mutation: {
        async githubAuth(parent, {code}, {db}) {

            //получаем данные от Github
            let {
                message,
                access_token,
                avatar_url,
                login,
                name
            } = await authorizeWithGithub({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code
            });

            //если что-то пошло не так
            if (message) {
                throw new Error(message);
            }

            //пакуем результат в один пакет
            let latestUserInfo = {
                name,
                githubLogin: login,
                githubToken: access_token,
                avatar: avatar_url
            };

            //Добавляем новую информацию или обновляем запись
            const {ops: [user]} = await db
                .collection('users')
                .replaceOne({githubLogin: login}, latestUserInfo, {upsert: true});
            //Возвращаем данные пользователя и его токен
            return {user, token: access_token};
        }
    },


    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value.',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
};



