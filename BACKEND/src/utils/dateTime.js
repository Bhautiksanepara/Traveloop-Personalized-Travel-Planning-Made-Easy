const toDateOnly = (value) => {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
};

const toSqlTimeDate = (value) => {
  if (!value) {
    return null;
  }

  return new Date(`1970-01-01T${value}`);
};

const formatTime = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return date.toTimeString().slice(0, 8);
};

module.exports = {
  toDateOnly,
  toSqlTimeDate,
  formatTime
};
