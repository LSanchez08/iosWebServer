const mongo = require('mongodb');
const { ObjectId } = mongo;
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const {
  DBNAME,
  MONGODB_HOST,
  SECRET
} = process.env;
const encryption = require('../utils/encyption');


const URI = `${MONGODB_HOST}${DBNAME}`;

const client = new MongoClient(URI, { useNewUrlParser: true });

// Initializating
exports.initialize = async () => {
  await client.connect();
}

exports.exportClient = () => {
return client;
}

// METHODS

// GET
exports.getAllMethod = async (reqInfo) => {
  try {
    const {
      collection
    } = reqInfo;

    const response = await client.db(DBNAME).collection(collection).find().toArray();

    return response;
  } catch (error){
    return { 
      errormessage: error.message 
    };
  }
}

exports.getSingle = async (reqInfo) => {
  try {
    const {
      collection,
      id
    } = reqInfo;

    const response = await client.db(DBNAME).collection(collection).findOne({ _id: ObjectId(id) });

    return response;
  } catch (error){
    return { 
      errormessage: error.message 
    };
  }
}

exports.postAny = async (reqInfo) => {
  try {
    const {
      collection,
      body
    } = reqInfo;
    const object = body.length ? body : [body];
    const values = object.map(async (element) => {
      if (element.password) {
        element.password = await encryption.encryptPassword(element.password);
      }

      return element;
    });

    console.log(values)

    const insert = await client.db(DBNAME).collection(collection).insertMany(values);
    const response = Object.values(insert.insertedIds).map((id) => id);

    return { insertedIds: response };
  } catch (error){
    return { 
      errormessage: error.message 
    };
  }
}

exports.login = async (reqInfo) => {
  try {
    const {
      collection,
      body
    } = reqInfo

    if (!body.password || !body.email) {
      return {
        message: 'Incomplete data provided.'
      };
    }
    const user = await client.db(DBNAME).collection(collection).findOne({ email: body.email });
    const validPassword = await encryption.matchPassword(
      body.password,
      user.password
    );
    if (!validPassword) {
      return {
        message: 'Incorrect data was provided'
      };
    }

    const accessToken = await jwt.sign({ id: user._id, type:'user', email: user.email }, SECRET, { expiresIn: '100d' });

    return {
      email: user.email,
      accessToken
    };

  } catch (error) {
    console.log(error)
    return {
      errormessage: error.message
    }
  }
}

exports.updateMethod = async (reqInfo) => {
  try {
    const {
      collection,
      body,
      id
    } = reqInfo;

    if (body.password) {
      const passwordEncrypted = await encryptPassword(body.password || '');
      body.password = passwordEncrypted;
    }
  
    const response = await client.db(DBNAME).collection(collection).findOneAndUpdate({ _id: ObjectId(id) }, { $set: body });

    return response.value;
  } catch (error){
    return { 
      errormessage: error.message 
    };
  }
}

exports.deleteMethod = async (reqInfo) => {
  try {
    const {
      collection,
      id
    } = reqInfo;

    const response = await client.db(DBNAME).collection(collection).findOneAndDelete({ _id: ObjectId(id) });

    return response.value;
  } catch (error){
    return { 
      errormessage: error.message 
    };
  }
}
