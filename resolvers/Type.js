const { GraphQLScalarType } = require('graphql');
const { ObjectID } = require('mongodb');

module.exports = {

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
        },

        taggedUsers: async (parent, args, { db }) => {

            const tags = await db.collection('tags').find().toArray();

            const logins = tags
                .filter(t => t.photoID === parent._id.toString())
                .map(t => t.githubLogin);

            return db.collection('users')
                .find({ githubLogin: { $in: logins }})
                .toArray()

        }
    },

    User: {

        postedPhotos: (parent, args, { db }) => {
            return db.Collection('photos')
                .find({ userID: parent.githubLogin })
                .toArray();
        },

        inPhotos: async (parent, args, { db }) => {

            const tags = await db.collection('tags').find().toArray();

            const photoIDs = tags
                .filter(t.githubLogin === parent.githubLogin)
                .map(t => ObjectID(t.photoID));

            return db.collection('photos')
                .find({ _id: { $in: photoIDs } })
                .toArray();
        }
    }

};