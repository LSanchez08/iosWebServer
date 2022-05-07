const mongo = require('mongodb');
const { ObjectId } = mongo;
const MongoClient = require('mongodb').MongoClient;
const {
  DBNAME,
  MONGODB_URI
} = process.env;

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true });

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

    const insert = await client.db(DBNAME).collection(collection).insertMany(object);
    const response = Object.values(insert.insertedIds).map((id) => id);

    return { insertedIds: response };
  } catch (error){
    return { 
      errormessage: error.message 
    };
  }
}

exports.updateMethod = async (reqInfo) => {
  try {
    const {
      collection,
      body,
      id
    } = reqInfo;
  
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
