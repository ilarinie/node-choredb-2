function handleResponse(response, statusCode, message, contents) {
  if (!contents){
    contents = {};
  }
  response.status(statusCode).json({message: message, contents: contents});
}

function handleError(response, statusCode, message) {
    response.status(statusCode).json({ message: message });
}

module.exports = {
  handleResponse,
  handleError
}
