const { ObjectID } = require('mongodb');

module.exports = {

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
    },

    Photo: (parent, args, { db }) => {
        return db.collection('photos')
            .findOne({ _id: ObjectID(args.id) });
    }
};