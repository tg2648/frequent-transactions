let clientId = "Jj41xZ86nMbjs9d9GEr4816FpZhcnCfPk-W5kRybyjA";

const dev = {
    clientId: clientId,
    redirectUri: "http://localhost:5173/frequent-transactions/"
}

const prod = {
    clientId: clientId,
    redirectUri: "https://tg2648.github.io/frequent-transactions/"
}

export const config = process.env.NODE_ENV === 'development' ? dev : prod;
