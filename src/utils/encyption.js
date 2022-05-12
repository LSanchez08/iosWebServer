const bcrypt = require('bcrypt');

module.exports = {
  encryptPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    console.log({salt})
    const newPass = await bcrypt.hash(password, salt);
    console.log({newPass})
    console.log(1)
    return newPass;
  },
  matchPassword: async (password, dbPassword) => {
    return await bcrypt.compare(password, dbPassword);
  }
};
