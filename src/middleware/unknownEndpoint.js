const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: "unknown endpoint" });
};

export default unknownEndpoint;
