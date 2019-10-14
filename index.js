const { ApolloServer } = require('apollo-server');

const typeDefs = `
  """
  тип Photo
  """
  type Photo {
    id: ID!
    name: String!
    url: String!
    description: String
  }

  """
   Возвращаем Photo по запросу allPhotos
  """
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
  
  """
   Возвращаем недавно опубликованную фотографию из мутации
  """
  type Mutation {
    postPhoto(name: String! description: String): Photo!
  }
  
  
`;


let photos = [];

let _id = 2;

const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },
    Mutation: {
        postPhoto(parent, args) {
            let newPhoto = {
                id: _id++,
                ...args
            };
            photos.push(newPhoto);
            return newPhoto;
        }
    }

};


const server = new ApolloServer({
    typeDefs,
    resolvers
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Server running on ${url}`));