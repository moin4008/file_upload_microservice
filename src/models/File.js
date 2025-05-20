const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../sequelize.config');
const User = require('./User');

class File extends Model {}

File.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  originalFilename: { type: DataTypes.STRING, allowNull: false },
  storagePath: { type: DataTypes.TEXT, allowNull: false },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  status: { 
    type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'failed'),
    allowNull: false,
    defaultValue: 'uploaded'
  },
  extractedData: { type: DataTypes.TEXT },
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'File',
  tableName: 'files',
  timestamps: false,
});

User.hasMany(File, { foreignKey: 'userId' });
File.belongsTo(User, { foreignKey: 'userId' });

module.exports = File;
