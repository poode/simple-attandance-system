const db = require('./models');
const { verifyToken } = require('./auth-utils');
const buildError = require('./buildError');

exports.auth = async (req, res, next) => {
  const accessToken = req.get('Authorization');
  if (!accessToken) {
    next(buildError('Authorization must be sent!', 400));
  }

  try {
    const { user } = await verifyToken(accessToken);
    res.locals.user = user;
    return next();
  } catch (error) {
    next(buildError(error.message, 401));
  }
}

exports.isManager = async (req, res, next) => {
  const { user } = res.locals;
  if (user.username !== 'manager') return next(buildError('You are not authorized for this action!', 401));
  next();
}


// // propertyList is array of strings
// exports.validator = (propertyList) => {
//   return (req, res, next) => {
//     if (req.method === 'POST') {
//       const result = Object.keys(req.body).map(property => {
//         if (propertyList.includes(property)) return true;
//         else return false;
//       });

//       const valid = result.every(item => item === true);
//       if (!valid) return next(buildError('bad request', 400));
//     }
//   }
// }
