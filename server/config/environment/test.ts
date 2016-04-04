// Test specific configuration
// ===========================
export = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/angulartest-test'
  },
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'test.sqlite',
      define: {
        timestamps: false
      }
    }
  }
};
