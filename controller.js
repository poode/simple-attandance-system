const service = require('./service');


exports.registerUser = async (req, res, next) => {
  await service.handler(req, res, next, service.createUser, false);
}

exports.login = async (req, res, next) => {
  await service.handler(req, res, next, service.auth, false);
}

exports.checkIn = async (req, res, next) => {
  await service.handler(req, res, next, service.checkInUser, true);
}

exports.checkOut = async (req, res, next) => {
  await service.handler(req, res, next, service.checkOutUser, true);
}

exports.report = async (req, res, next) => {
  await service.handler(req, res, next, service.getReport, false);
}
