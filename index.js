const { ApolloServer } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');

const typeDefs = `

  """
  Date-time
  """
  scalar DateTime
  
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
    inPhotos: [Photo!]!
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
    taggedUsers: [User!]!
    created: DateTime!
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
    allPhotos(after: DateTime): [Photo!]!
  }
  
  """
   Возвращаем недавно опубликованную фотографию из мутации
  """
  type Mutation {
    postPhoto(input: PostPhotoInput): Photo!
  }
  
  
`;

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

};


const server = new ApolloServer({
    typeDefs,
    resolvers
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Server running on ${url}`));