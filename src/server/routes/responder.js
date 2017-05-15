function handleResponse(response, statusCode, message, contents) {
  if (!contents){
    contents = {};
  }
  response.status(statusCode).json({message: message, contents: JSON.stringify(contents)});
}

function handleError(response, statusCode, message) {
    response.status(statusCode).json({ message: message.toString(), statusCode: statusCode });
}

module.exports = {
  handleResponse,
  handleError
}
