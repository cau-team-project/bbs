const graphql = require('graphql')
const { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql
const connection = require('./connection')

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLID },
    uname: { type: GraphQLString },
    level: { type: GraphQLInt },
    bdate: { type: GraphQLString },
    fname: { type: GraphQLString },
    mname: { type: GraphQLString },
    lname: { type: GraphQLString },
    sex: { type: GraphQLString },
    email: { type: GraphQLString }
  })
})

const BoardType = new GraphQLObjectType({
  name: 'BoardType',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    admin_id: { type: GraphQLID }
  })
})

const ArticleType = new GraphQLObjectType({
  name: 'ArticleType',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    ctime: { type: GraphQLString },
    mtime: { type: GraphQLString },
    title: { type: GraphQLString },
    vcount: { type: GraphQLInt },
    upcount: { type: GraphQLInt },
    dwcount: { type: GraphQLInt },
    prev_id: { type: GraphQLID },
    prev_article: {
      type: ArticleType,
      resolve(parent, args) {
        console.log(`prev id is ${parent.prev_id}`)
      }
    }
  })
})

const CommentType = new GraphQLObjectType({
  name: 'CommentType',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    ctime: { type: GraphQLString },
    mtime: { type: GraphQLString },
    upcount: { type: GraphQLInt },
    dwcount: { type: GraphQLInt },
    article_id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    image_id: { type: GraphQLID },
    parent_id: { type: GraphQLID }
  })
})

const rootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        console.log(args.id)
        return {id: 1, uname: 'novice', level: '3', bdate: '2019.11.30', fname: 'john', lname: 'doe', sex: 'M', email: 'cau@cau.ac.kr'}
      }
    },
    board: {
      type: BoardType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        console.log(args.id)
        return {id: 1, name: 'freeboard', admin_id: 1}
      }
    },
    article: {
      type: ArticleType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        console.log(args.id)
        return {id: 1, content: 'my article', prev_id: 1}
      }
    },
    comment: {
      type: CommentType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        console.log(args.id)
        return {id: 1, content: 'my comment'}
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: rootQuery
})
