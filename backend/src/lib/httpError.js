/** 상태 코드와 에러 코드를 담은 Error를 만들어요. */
module.exports = function httpError(status, code, message) {
  return Object.assign(new Error(message), { status, code });
};
