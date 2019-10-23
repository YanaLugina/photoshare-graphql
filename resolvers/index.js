const clientID = '7b8d6537da1af4e97d92';
const clientSecret = '3ad9329e5240066b24d1b60f30a288f896c81504';

// code= bd8f57115e24282d5043

/**
 * resolvers for graphql
 * @public
 */
const resolvers = {


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
        }
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
                client_id: '696aa1d9f46f55b9c43d',
                client_secret: 'f1528109a3980b3095db55e58f97b528ade14ce0',
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
            //Возвращаем данные пользователя и его логин

            return {user, token: access_token};
        }
    }
    /*
      Mutation: {
          postPhoto(parent, args) {
              let newPhoto = {
                  id: _id++,
                  ...args.input,
                  created: new Date()
              };
              photos.push(newPhoto);
              return newPhoto;
          }
      },

      //тривиальный распознователь
      Photo: {
          url: parent => `http://site.com/img/${parent.id}.jpg`,
          postedBy: parent => {
              return users.find(u => u.githubLogin === parent.githubUser)
          },
          taggedUsers: parent => tags

          //Возвращаем массив тегов, которые содержат только текущие фотографии
              .filter(tag => tag.photoID === parent.id)

              //Преобразует массив тегов в массив значений userID
              .map(tag => tag.userID)

              //Преобразует массив значений userID в массив объектов пользователей
              .map(userID => users.find(u => u.githubLogin === userID))
      },

      User: {
          postedPhotos: parent => {
              return photos.filter(p => p.githubUser === parent.githubLogin)
          },
          inPhotos: parent => tags

          //Возвращаем массив тегов, которые содержат только текущего пользователя
              .filter(tag => tag.userID === parent.id)

              //Преобразует массив тегов в массив значений photoID
              .map(tag => tag.photoID)

              //Преобразует массив значений photoID в массив объектов фотографий
              .map(photoID => photos.find(p => p.id === photoID))
      },

      DateTime: new GraphQLScalarType({
          name: 'DateTime',
          description: 'A valid date time value.',
          parseValue: value => new Date(value),
          serialize: value => new Date(value).toISOString(),
          parseLiteral: ast => ast.value
      })
  */

};


/**
 * Module exports.
 * @public
 */

module.exports = resolvers;



