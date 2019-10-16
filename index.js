const { ApolloServer } = require('apollo-server');

const typeDefs = `

  """
  Тип перечисления PhotoCategory
  """
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }
  
  """
  тип User
  """
  type User {
    githubLogin: ID!
    name: String!
    avatar: String
    postedPhotos: [Photo!]!
  }

  """
  тип Photo
  """
  type Photo {
    id: ID!
    name: String!
    url: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
  }
  
  """
  Тип ввода для мутации postPhoto
  """
  input PostPhotoInput {
    name: String!
    description: String
    category: PhotoCategory=PORTRAIT
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
    postPhoto(input: PostPhotoInput): Photo!
  }
  
  
`;

let _id = 5;

let photos = [];

// распознователи
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },
    Mutation: {
        postPhoto(parent, args) {
            let newPhoto = {
                id: _id++,
                ...args.input
            };
            photos.push(newPhoto);
            return newPhoto;
        }
    },
    //тривиальный распознователь
    Photo: {
        url: parent => `http://site.com/img/${parent.id}.img`
    }

};


const server = new ApolloServer({
    typeDefs,
    resolvers
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Server running on ${url}`));