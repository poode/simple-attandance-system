/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const attendance = sequelize.define('attendance', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    checkIn: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1'
    },
    checkOut: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'attendances'
  });

  attendance.associate = function associate(models) {
    attendance.belongsTo(models.user);
  }

  return attendance;
};
