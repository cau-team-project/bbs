const graphql = require('graphql')
const { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql
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
    admin_id: { type: new GraphQLNonNull(GraphQLID) },
    mod_id_list: { type: new GraphQLList(GraphQLID) }
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
    board_id: { type: GraphQLID },
    prev_id: { type: GraphQLID },
    prev_article: {
      type: ArticleType,
      async resolve(parent, args) {
        const res = await pool.query('SELECT * from `article` WHERE `prev_id` = ?', [parent.prev_id])
        return res[0][0]
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
        if(res[0].length !== 1)
          return null
        return res[0][0]
      }
    },
    board: {
      type: BoardType,
      args: { id: { type: GraphQLID }},
      async resolve(parent, args) {
        let res = await pool.query('SELECT * from `board` WHERE `id` = ?', [args.id])
        const xref_board_mod_res = await pool.query('SELECT * from `xref_board_mod` WHERE `board_id` = ?', [args.id])
        if(res[0].length !== 1)
          return null
        res[0][0].mod_id_list = xref_board_mod_res[0].map((xref) => { return xref.mod_id })
        return res[0][0]
      }
    },
    article: {
      type: ArticleType,
      args: { id: { type: GraphQLID }},
      async resolve(parent, args) {
        const res = await pool.query('SELECT * from `article` WHERE `id` = ?', [args.id])
        return res[0][0]
      }
    },
    comment: {
      type: CommentType,
      args: { id: { type: GraphQLID }},
      async resolve(parent, args) {
        const res = await pool.query('SELECT * from `comment` WHERE `id` = ?', [args.id])
        if(res[0].length !== 1)
          return null
        return res[0][0]
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
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          const res = await conn.query("INSERT INTO `user` SET ?, `salt`=SHA2(RAND(), 256)", [args])
          await conn.commit()
          await conn.release()
          args.id = res[0].insertId
          return args
        } catch(err) {
          await conn.rollback()
          await conn.release()
          return err
        }
      }
    },
    insertBoard: {
      type: BoardType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        admin_id: { type: new GraphQLNonNull(GraphQLID) },
        mod_id_list: { type: new GraphQLList(GraphQLID) }
      },
      async resolve(parent, args) {
        args.mod_id_list = args.mod_id_list || []
        const { ['mod_id_list']: mod_id_list, ...board_args } = args
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          const res = await conn.query("INSERT INTO `board` SET ?", [board_args])
          args.id = res[0].insertId
          for(const mod_id of mod_id_list) {
            const xref_board_mod_args = { board_id: args.id, mod_id }
            await conn.query("INSERT INTO `xref_board_mod` SET ?", [xref_board_mod_args])
          }
          await conn.commit()
          await conn.release()
          return args
        } catch(err) {
          await conn.rollback()
          await conn.release()
          return err
        }
      }
    },
    insertArticle: {
      type: ArticleType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        prev_id: { type: GraphQLID },
        board_id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          const res = await conn.query("INSERT INTO `article` SET ?", [args])
          await conn.commit()
          await conn.release()
          args.id = res[0].insertId
          return args
        } catch(err) {
          await conn.rollback()
          await conn.release()
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
