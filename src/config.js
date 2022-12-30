const dev = {
  context_key: Symbol(),
};

const prod = {
  context_key: Symbol(),
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
