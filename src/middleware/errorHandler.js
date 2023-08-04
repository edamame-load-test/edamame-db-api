const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  return res.status(500).send({ error: err.messageForClient });
};

export default errorHandler;
