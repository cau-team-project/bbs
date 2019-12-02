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
    id: { type: new GraphQLNonNull(GraphQLID) },
    uname: { type: new GraphQLNonNull(GraphQLString) },
    level: { type: GraphQLInt },
    bdate: { type: GraphQLString },
    fname: { type: new GraphQLNonNull(GraphQLString) },
    mname: { type: GraphQLString },
    lname: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: SexType },
    email: { type: new GraphQLNonNull(GraphQLString) },
    admin_board_id_list: {
      type: new GraphQLList(GraphQLID),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT `id` FROM `board` WHERE `admin_id` = ?', [obj.id])
        return res[0].map(board => board.id)
      }
    },
    admin_board_list: {
      type: new GraphQLList(BoardType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `board` WHERE `admin_id` = ?', [obj.id])
        return res[0]
      }
    },
    mod_board_id_list: {
      type: new GraphQLList(GraphQLID),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT `board_id` FROM `xref_board_mod` WHERE `mod_id` = ?', [obj.id])
        return res[0].map(board => board.id)
      }
    },
    mod_board_list: {
      type: new GraphQLList(BoardType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `board` JOIN `xref_board_mod` ON `board`.`id` = `xref_board_mod`.`board_id` WHERE `xref_board_mod`.`mod_id` = ?', [obj.id])
        return res[0]
      }
    },
    article_id_list: {
      type: new GraphQLList(GraphQLID),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT `id` FROM `article` WHERE `user_id` = ?', [obj.id])
        return res[0].map(article => article.id)
      }
    },
    article_list: {
      type: new GraphQLList(ArticleType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `article` WHERE `user_id` = ?', [obj.id])
        return res[0]
      }
    },
    comment_id_list: {
      type: new GraphQLList(GraphQLID),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT `id` FROM `comment` WHERE `user_id` = ?', [obj.id])
        return res[0].map(comment => comment.id)
      }
    },
    comment_list: {
      type: new GraphQLList(CommentType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `comment` WHERE `user_id` = ?', [obj.id])
        return res[0]
      }
    }
  })
})

const BoardType = new GraphQLObjectType({
  name: 'BoardType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    admin_id: { type: new GraphQLNonNull(GraphQLID) },
    admin: {
      type: UserType,
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `user` WHERE `id` = ?', [obj.admin_id])
        return res[0][0]
      }
    },
    mod_id_list: {
      type: new GraphQLList(GraphQLID),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `xref_board_mod` WHERE `board_id` = ?', [args.id])
        return res[0].map(xref => xref.mod_id)
      }
    },
    mod_list: {
      type: new GraphQLList(UserType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `xref_board_mod` WHERE `board_id` = ?', [args.id])
        return res[0]
      }
    },
    article_id_list: {
      type: new GraphQLList(GraphQLID),
      async resolve(obj, args, context, info) {
        const res = await pool.query("SELECT `id` FROM `article` WHERE `board_id` = ? ORDER BY `ctime` DESC", [obj.id])
        return res[0].map(article => article.id)
      }
    },
    article_list: {
      type: new GraphQLList(ArticleType),
      async resolve(obj, args, context, info) {
        const res = await pool.query("SELECT * FROM `article` WHERE `board_id` = ? ORDER BY `ctime`", [obj.id])
        return res[0]
      }
    },
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
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    user: {
      type: UserType,
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `user` WHERE `id` = ?', [obj.user_id])
        res[0][0].sex = res[0][0].sex == 'M' ? 0 : 1
        return res[0][0]
      }
    },
    board_id: { type: new GraphQLNonNull(GraphQLID) },
    prev_id: { type: GraphQLID },
    prev: {
      type: ArticleType,
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `article` WHERE `prev_id` = ?', [obj.prev_id])
        return res[0][0]
      }
    },
    comment_id_list: {
      type: new GraphQLList(CommentType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT `id` FROM `comment` WHERE `article_id` = ?', [obj.id])
        return res[0].map((comment) => comment.id)
      }
    },
    comment_list: {
      type: new GraphQLList(CommentType),
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `comment` WHERE `article_id` = ?', [obj.id])
        return res[0]
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
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    user: {
      type: UserType,
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `user` WHERE `id` = ?', [obj.user_id])
        return res[0][0]
      }
    },
    article_id: { type: new GraphQLNonNull(GraphQLID) },
    article: {
      type: ArticleType,
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `article` WHERE `id` = ?', [obj.article_id])
        return res[0][0]
      }
    },
    image_id: { type: GraphQLID },
    parent_id: { type: GraphQLID },
    parent: {
      type: CommentType,
      async resolve(obj, args, context, info) {
        if(obj.parent_id === null)
          return null
        const res = await pool.query('SELECT * FROM `comment` WHERE `id` = ?', [obj.parent_id])
        return res[0][0]
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) }},
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `user` WHERE `id` = ?', [args.id])
        res[0][0].sex = res[0][0].sex == 'M' ? 0 : 1
        return res[0][0]
      }
    },
    board: {
      type: BoardType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) }},
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `board` WHERE `id` = ?', [args.id])
        return res[0][0]
      }
    },
    article: {
      type: ArticleType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) }},
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `article` WHERE `id` = ?', [args.id])
        return res[0][0]
      }
    },
    comment: {
      type: CommentType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) }},
      async resolve(obj, args, context, info) {
        const res = await pool.query('SELECT * FROM `comment` WHERE `id` = ?', [args.id])
        return res[0][0]
      }
    }
  })
})

const MutationType = new GraphQLObjectType({
  name: 'MutationType',
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
      async resolve(obj, args, context, info) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          args.sex = args.sex == 0 ? 'M' : 'F'
          let res = await conn.query("INSERT INTO `user` SET ?, `salt` = SHA2(RAND(), 256)", [args])
          await conn.commit()
          await conn.release()
          if(res[0].affectedRows !== 1)
            return null
          res = await pool.query('SELECT * FROM `user` WHERE `id` = ?', [res[0].insertId])
          res[0][0].sex = res.sex == 'M' ? 0 : 1
          return res[0][0]
        } catch(err) {
          await conn.rollback()
          await conn.release()
          return err
        }
      }
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        uname: { type: GraphQLString },
        pw: { type: GraphQLString },
        fname: { type: GraphQLString },
        mname: { type: GraphQLString },
        lname: { type: GraphQLString },
        sex: { type: SexType },
        email: { type: GraphQLString }
      },
      async resolve(obj, args, context, info) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          args.sex = args.sex == 0 ? 'M' : 'F'
          const { ['id']: user_id, ...user_args } = args
          let res = await conn.query("UPDATE `user` SET ?, `salt` = SHA2(RAND(), 256) WHERE `id` = ?", [user_args, user_id])
          await conn.commit()
          await conn.release()
          if(res[0].affectedRows !== 1)
            return null
          res = await pool.query('SELECT * FROM `user` WHERE `id` = ?', [args.id])
          res[0][0].sex = res.sex == 'M' ? 0 : 1
          return res[0][0]
        } catch(err) {
          await conn.rollback()
          await conn.release()
          return err
        }
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(obj, args, context, info) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          const res = await conn.query("DELETE FROM `user` WHERE `id` = ?", [args.id])
          await conn.commit()
          await conn.release()
          if(res[0].affectedRows !== 1)
            return null
          args.sex = args.sex == 'M' ? 0 : 1
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
        mod_id_list: { type: new GraphQLList(GraphQLID) },
      },
      async resolve(obj, args, context, info) {
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
    deleteBoard: {
      type: BoardType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(obj, args, context, info) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          const res = await conn.query("DELETE FROM `board` WHERE `id` = ?", [args.id])
          await conn.commit()
          await conn.release()
          if(res[0].affectedRows !== 1)
            return null
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
        user_id: { type: new GraphQLNonNull(GraphQLID) },
        board_id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(obj, args, context, info) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          let res = await conn.query("INSERT INTO `article` SET ?", [args])
          await conn.commit()
          await conn.release()
          if(res[0].affectedRows !== 1)
            return null
          res = await pool.query('SELECT * FROM `article` WHERE `id` = ?', [res[0].insertId])
          return res[0][0]
        } catch(err) {
          await conn.rollback()
          await conn.release()
          return err
        }
      }
    },
    deleteArticle: {
      type: ArticleType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(obj, args, context, info) {
        const conn = await pool.getConnection()
        try {
          await conn.beginTransaction()
          const res = await conn.query("DELETE FROM `article` WHERE `id` = ?", [args.id])
          await conn.commit()
          await conn.release()
          if(res[0].affectedRows !== 1)
            return null
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
  query: RootQueryType,
  mutation: MutationType
})
