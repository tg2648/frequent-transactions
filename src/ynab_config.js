let clientId = "Jj41xZ86nMbjs9d9GEr4816FpZhcnCfPk-W5kRybyjA";

const dev = {
  clientId: clientId,
  redirectUri: "http://localhost:5173/frequent-transactions/",
  context_key: Symbol()
};

const prod = {
  clientId: clientId,
  redirectUri: "https://tg2648.github.io/frequent-transactions/",
  context_key: Symbol()
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
