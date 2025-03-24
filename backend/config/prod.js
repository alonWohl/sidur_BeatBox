export default {
  dbURL: process.env.MONGO_URL || 'mongodb+srv://anistavi:Mypassword12345@cluster0.2nwg9.mongodb.net/?retryWrites=true&w=majority',
  dbName: process.env.DB_NAME || 'car_db'
}

// export default {
//   dbURL: process.env.MONGO_URL || 'mongodb+srv://theUser:thePass@cluster0-klgzh.mongodb.net/test?retryWrites=true&w=majority',
//   dbName : process.env.DB_NAME || 'tester_db'
// }
