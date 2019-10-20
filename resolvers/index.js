'use strict';

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



