const moment = require('moment');

const db = require('./models');
const buildError = require('./buildError');
const { hashPassword, verifyPassword, signToken  } = require('./auth-utils');


/**
 * this function is request/response handler
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 * @param {Function} serviceFunction
 * @param {Boolean} isResponseSent // if true the response object will be passed to service function
 * @returns
 */
async function handler(req, res, next, serviceFunction, isResponseSent) {
  reqOrRes = isResponseSent ? res : req
  const result = await serviceFunction(reqOrRes);
  if (result.errMsg) return next(result);
  res.json(result);
}
exports.handler = handler;


async function hasCheckInToday(model, user) {
  const found = await model.findOne({
    where: {
      userId: user.id,
      checkIn: true,
      createdAt: {
        [db.Sequelize.Op.between]: [
          `${moment().format('YYYY-MM-DD')} 00:00:00`,
          `${moment().format('YYYY-MM-DD')} 23:59:59`,
        ],
      },
    }
  });

  return found ? found.toJSON() : found;
}

async function hasCheckOutToday(model, user) {
  const found = await model.findOne({
    where: {
      userId: user.id,
      checkOut: true,
      updatedAt: {
        [db.Sequelize.Op.between]: [
          `${moment().format('YYYY-MM-DD')} 00:00:00`,
          `${moment().format('YYYY-MM-DD')} 23:59:59`,
        ],
      }
    }
  });
  return found ? found.toJSON(): found;
}

function twoDigits(number) {
  if (number < 10) return `0${number}`;
  return number
}

function isValidMonthNumber(number) {
  if (!number) return false;
  const monthNumber = parseInt(number);
  if (monthNumber < 1 || monthNumber > 12) return false;
  const validMonthNumber = twoDigits(monthNumber);
  const pattern = /^(0[1-9])|(1[0-2])$/;
  if (!pattern.test(validMonthNumber)) return false;

  return true
}

function getLastDayNumberInTheMonth(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}


exports.createUser = async ({ body }) => {
  const { username, password } = body;
  if(!username) return buildError('username must be sent', 400);
  if(!password) return buildError('password must be sent', 400);

  const user = {};
  Object.assign(user, body);

  const foundUsername = await db.user.findOne({ where: { username } });
  if (foundUsername) return buildError(`Username ${username} is exist please try another one!`, 422);

  user.password = await hashPassword(password);
  const createdUserObject = await db.user.create(user);
  const createdUser = createdUserObject.toJSON();
  delete createdUser.password;

  return { user: createdUser };
}

exports.auth = async ({ body }) => { 
  const { username, password } = body;
  if(!username) return buildError('username must be sent', 400);
  if(!password) return buildError('password must be sent', 400);

  const userFound = await db.user.findOne({ where: { username }});
  if (!userFound) return buildError(`User with username %{username} is not exist`, 404);

  const user = userFound.toJSON();
  const validPassword = verifyPassword(password, user.password);

  if (!validPassword) return buildError('Wrong password please try again!', 401);
  delete user.password;
  const accessToken = signToken(user);

  return { user: user, accessToken };
}

exports.checkInUser = async ({ locals }) => {
  const { user } = locals;

  const attendedToday = await hasCheckInToday(db.attendance, user);
  //check attend today
  if (attendedToday) return buildError('You checked in today!', 422);

  const attended = await db.attendance.create({ userId: user.id });
  const response = { attended, message: 'you checked in successfully!' };
  return response;
}

exports.checkOutUser = async ({ locals }) => {
  const { user } = locals;

  const checkedOutToday = await hasCheckOutToday(db.attendance, user)

  //check attend today
  if (checkedOutToday) return buildError('You checked out today!', 422);
  
  const isCheckInToday = await hasCheckInToday(db.attendance, user);
  if (!isCheckInToday) return buildError('You did not check in for today!', 422);
  await db.attendance.update({ checkOut: true }, { where: { id: isCheckInToday.id } });
  const attended = {};
  isCheckInToday.checkOut = "1";
  Object.assign(attended, isCheckInToday);

  const response = { attended, message: 'you checked out successfully!' };
  return response;
}

exports.getReport = async ({ query }) => {
  const { month } = query;
  const validMonthNumber = isValidMonthNumber(month);
  if (!validMonthNumber) return buildError('Month number is not valid!', 400);
  const year = new Date().getFullYear();
  const startDate = `${year}-${month}-01 00:00:00`;
  const endDate = `${year}-${month}-${getLastDayNumberInTheMonth(startDate)} 23:59:59`;
  
  const result = await db.user.findAll({
    include: [{
      model: db.attendance,
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [
            startDate,
            endDate,
          ]
        }
      },
      attributes: [],
    }],
    group: [db.Sequelize.col('user.username')],
    attributes: ['username', [db.Sequelize.fn('COUNT', db.Sequelize.col('*')), 'numberOfAttendedDays']]
  });

  return { result };

}
