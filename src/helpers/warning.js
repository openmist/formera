const warning = process.env.NODE_ENV === 'production' ? () => {} : (condition, message) => {
  if (!condition) {
    console.error(`Warning: ${message}`);
  }
};

export default warning;
