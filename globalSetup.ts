//Node 18 introduced global fetch. It doesn't behave the same way as cross-fetch.
//Cross-fetch/pollyfill installs the fetch as global if it doesnt exist.
//Since on node 18 fetch exists as global, it would prevent pollyfill from installing.
//Ergo, all recordings would break.
module.exports = () => {
  const globalAny: any = global;
  globalAny.fetch = undefined;
};
