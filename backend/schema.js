const graphql = require("graphql");
const sqlite3 = require('sqlite3').verbose();

//create a database if no exists
const database = new sqlite3.Database("./app.db");

//create a table to insert User
const createUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS User (
        id integer PRIMARY KEY,
        fullname text,
        email text,
        password text
        )`;
    return database.run(query);
}

const createImages = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Images (
        id integer PRIMARY KEY,
        user_id integer,
        image_link text,
        FOREIGN KEY (user_id) REFERENCES User(id)
        )`;
    return database.run(query);
}

const createImageLikes = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS ImageLikes (
        id integer PRIMARY KEY,
        user_id integer,
        image_id integer,
        FOREIGN KEY (user_id) REFERENCES User(id),
        FOREIGN KEY (image_id) REFERENCES Images(id)
        )`;
    return database.run(query);
}

//call function to init the User table
createUserTable();
createImages();
createImageLikes();

//creacte graphql User object
const UserType = new graphql.GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: graphql.GraphQLID },
        fullname: { type: graphql.GraphQLString },
        email: { type: graphql.GraphQLString },
        password: { type: graphql.GraphQLString },
    }
});

const ImageType = new graphql.GraphQLObjectType({
    name: "Images",
    fields: {
        id: { type: graphql.GraphQLID },
        user_id: { type: graphql.GraphQLID },
        image_link: { type: graphql.GraphQLString },
    }
});

const ImageLikeType = new graphql.GraphQLObjectType({
    name: "ImageLikes",
    fields: {
        id: { type: graphql.GraphQLID },
        user_id: { type: graphql.GraphQLID },
        image_id: { type: graphql.GraphQLID },
    }
});

const GetImageLikesType = new graphql.GraphQLObjectType({
    name: "GetImageLikesType",
    fields: {
        likes: { type: graphql.GraphQLInt },
    }
});


// create a graphql query to select users all and by id
var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        //first query to select all
        Users: {
            type: graphql.GraphQLList(UserType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw SQLite query to select from table
                    database.all("SELECT * FROM User;", function (err, rows) {
                        if (err) {
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        //second query to select by id
        User: {
            type: UserType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, { id }, context, info) => {
                return new Promise((resolve, reject) => {

                    database.all("SELECT * FROM User WHERE id = (?);", [id], function (err, rows) {
                        if (err) {
                            reject(null);
                        }
                        resolve(rows[0]);
                    });
                });
            }
        },
        Login: {
            type: UserType,
            args: {
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
            },
            resolve: (root, { email,password }, context, info) => {
                return new Promise((resolve, reject) => {

                    database.all("SELECT * FROM User WHERE email = (?) and password=(?);", [email, password], function (err, rows) {
                        if (err) {
                            reject(null);
                        }
                        resolve(rows[0]);
                    });
                });
            }
        },
        //first query to select all images
        Images: {
            type: graphql.GraphQLList(ImageType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw SQLite query to select from table
                    database.all("SELECT * FROM Images;", function (err, rows) {
                        if (err) {
                            reject([]);
                        }

                        resolve(rows);
                    });
                });
            }
        },
        //second query to select image by id
        Image: {
            type: ImageType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, { id }, context, info) => {
                return new Promise((resolve, reject) => {

                    database.all("SELECT * FROM Images WHERE id = (?);", [id], function (err, rows) {
                        if (err) {
                            reject(null);
                        }
                        resolve(rows[0]);
                    });
                });
            }
        },
        ImageLikes: {
            type: GetImageLikesType,
            args:{
                image_id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, { image_id }, context, info) => {
                return new Promise((resolve, reject) => {

                    database.all("SELECT COUNT(*) FROM ImageLikes WHERE image_id = (?);", [image_id], function (err, rows) {
                        if (err) {
                            reject(null);
                        }
                        resolve({
                            likes: rows[0]["COUNT(*)"]
                         });
                    });
                });
            }
        }
    }
});

//mutation type is a type of object to modify data (INSERT,DELETE,UPDATE)
var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        //mutation for creacte
        createUser: {
            //type of object to return after create in SQLite
            type: UserType,
            //argument of mutation createUser to get from request
            args: {
                fullname: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
            },
            resolve: (root, { fullname, email, password }) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to insert a new user
                    database.run('INSERT INTO User (fullname, email, password) VALUES (?,?,?);', [fullname, email, password], (err) => {
                        if (err) {
                            reject(null);
                        }
                        database.get("SELECT last_insert_rowid() as id", (err, row) => {

                            resolve({
                                id: row["id"],
                                fullname,
                                email,
                                password
                            });
                        });
                    });
                })
            }
        },
        createImage: {
            //type of object to return after create in SQLite
            type: ImageType,
            //argument of mutation createUser to get from request
            args: {
                user_id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt) 
                },
                image_link:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
            },
            resolve: (root, { user_id, image_link }) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to insert a new user
                    database.run('INSERT INTO Images (user_id, image_link) VALUES (?,?);', [user_id, image_link], (err) => {
                        if (err) {
                            reject(null);
                        }
                        database.get("SELECT last_insert_rowid() as id", (err, row) => {

                            resolve({
                                id: row["id"],
                                user_id:user_id,
                                image_link:image_link
                            });
                        });
                    });
                })
            }
        },
        createImageLike: {
            //type of object to return after create in SQLite
            type: ImageLikeType,
            //argument of mutation createUser to get from request
            args: {
                user_id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
                image_id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
            },
            resolve: (root, { user_id, image_id }) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to insert a new user
                    database.run('INSERT INTO ImageLikes (user_id, image_id) VALUES (?,?);', [user_id, image_id], (err) => {
                        if (err) {
                            reject(null);
                        }
                        database.get("SELECT last_insert_rowid() as id", (err, row) => {

                            resolve({
                                id: row["id"],
                                user_id: user_id,
                                image_id: image_id
                            });
                        });
                    });
                })
            }
        },
        //mutation for update
        deleteUser: {
            //type of object resturn after delete in SQLite
            type: graphql.GraphQLString,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, { id }) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE from User WHERE id =(?);', [id], (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(`User #${id} deleted`);
                    });
                })
            }
        }
    }
});

//define schema with post object, queries, and mustation 
const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType
});

//export schema to use on index.js
module.exports = {
    schema
}