const {GraphQLScalarType} = require('graphql');
const {authorizeWithGithub} = require('../lib');
const fetch = require('node-fetch');

module.exports = {


    Query: {
        totalPhotos: (parent, args, { db }) => {
            return db.collection('photos')
                .estimatedDocumentCount();
        },
        allPhotos: (parent, args, { db }) => {
            return db.collection('photos')
                .find()
                .toArray();
        },
        totalUsers: (parent, args, { db }) => {
            return db.collection('users')
                .estimatedDocumentCount();
        },
        allUsers: (parent, args, { db }) => {
            return db.collection('users')
                .find()
                .toArray();
        },
        githubLoginUrl: () => {
            return `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`;
        },
        me: (parent, args, { currentUser }) => currentUser,
        User: (parent, args, { db }) => {
            return  db.collection('users')
                .findOne({ githubLogin: args.login });
        }

    },

    Mutation: {
        async githubAuth(parent, { code }, { db }) {

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
                .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
            //Возвращаем данные пользователя и его токен
            return {user, token: access_token};
        },

        async postPhoto(parent, args, { db, currentUser }) {

            //если в контексте нет пользователя, выбросить ошибку
            if(!currentUser) {
                throw new Error('only an authorized user can post a photo');
            }

            //Сохранить идентификатор текущего пользователя с фотографией
            const newPhoto = {
                ...args.input,
                userID: currentUser.githubLogin,
                created: new Date()
            };

            //Вставить новую фотографию, записать идентификатор, созданный базой данных
            const { insertedIds } = await db.collection('photos').insert(newPhoto);
            newPhoto.id = insertedIds[0];

            return newPhoto;
        },

        addFakeUsers: async (parent, { count }, { db }) => {
            const randomUserApi = `http://randomuser.me/api/?results=${count}`;

            const { results } = await fetch(randomUserApi)
                .then(res => res.json());

            const users = results.map( r => ({
                githubLogin: r.login.username,
                name: `${r.name.first} ${r.name.last}`,
                avatar: r.picture.thumbnail,
                githubToken: r.login.sha1
            }));

            await db.collection('users').insert(users);

            return users;

        },

        //
        async fakeUserAuth(parent, { githubLogin }, { db }) {

            let user = await db.collection('users').findOne({ githubLogin });

            if(!user) {
                throw new Error(`Cannot fined user with githubLogin "${githubLogin}"`);
            }

            return {
                token: user.githubToken,
                user
            }
        }
    },


    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value.',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    }),

    Photo: {
        id: parent => parent.id || parent._id,
        url: parent => `/img/photos/${parent._id}.jpg`,
        postedBy: (parent, args, { db }) => {
            return db.collection('users').findOne({ githubLogin: parent.userID });
        }
    }
};



