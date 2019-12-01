const graphql = require('graphql')
const { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql
const pool = require('./pool')

const SexType = new GraphQLEnumType({
  name: 'Sex',
  values: {
    M: { value: 0 },
    F: { value: 1 }
  }
})

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLID },
    uname: { type: new GraphQLNonNull(GraphQLString) },
    level: { type: GraphQLInt },
    bdate: { type: GraphQLString },
    fname: { type: new GraphQLNonNull(GraphQLString) },
    mname: { type: GraphQLString },
    lname: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: SexType },
    email: { type: new GraphQLNonNull(GraphQLString) }
  })
})

const BoardType = new GraphQLObjectType({
  name: 'BoardType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    admin_id: { type: new GraphQLNonNull(GraphQLID) }
  })
})

const ArticleType = new GraphQLObjectType({
  name: 'ArticleType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    ctime: { type: GraphQLString },
    mtime: { type: GraphQLString },
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
    id: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    ctime: { type: GraphQLString },
    mtime: { type: GraphQLString },
    upcount: { type: GraphQLInt },
    dwcount: { type: GraphQLInt },
    article_id: { type: new GraphQLNonNull(GraphQLID) },
    user_id: { type: new GraphQLNonNull(GraphQLID) },
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
      async resolve(parent, args) {
        const res = await pool.query('SELECT * from `user` WHERE `id` = ?', [args.id])
        return res[0][0]
      }
    },
    board: {
      type: BoardType,
      args: { id: { type: GraphQLID }},
      async resolve(parent, args) {
        const res = await pool.query('SELECT * from `board` WHERE `id` = ?', [args.id])
        return res[0][0]
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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    insertUser: {
      type: UserType,
      args: {
        uname: { type: new GraphQLNonNull(GraphQLString) },
        pw: { type: new GraphQLNonNull(GraphQLString) },
        fname: { type: new GraphQLNonNull(GraphQLString) },
        mname: { type: GraphQLString },
        lname: { type: new GraphQLNonNull(GraphQLString) },
        sex: { type: SexType },
        email: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args) {
        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction()
          const res = await conn.query("INSERT INTO `user` SET ?, salt=SHA2(RAND(), 256)", [args])
          await conn.commit()
          await conn.release();
          args.id = res[0].insertId
          return args
        } catch(err) {
          await conn.rollback();
          await conn.release();
          return err
        }
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: rootQuery,
  mutation: Mutation
})
