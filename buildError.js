function buildError(message, status) {
  return { errMsg: message, status }
}

module.exports = buildError;
