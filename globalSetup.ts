module.exports = () => {
  const globalAny: any = global;
  globalAny.fetch = undefined;
};
