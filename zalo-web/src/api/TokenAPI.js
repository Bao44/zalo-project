const getAccessToken = () => {
  try {
    const token = JSON.parse(localStorage.getItem("access_token"));

    return token;
  } catch (error) {
    console.log(error);
  }
};

const setAccessToken = (token) => {
  try {
    localStorage.setItem("access_token", JSON.stringify(token));
  } catch (error) {
    console.log(error);
  }
};

const getRefreshToken = () => {
  try {
    const token = JSON.parse(localStorage.getItem("refresh_token"));

    return token;
  } catch (error) {
    console.log(error);
  }
};

const setRefreshToken = (token) => {
  try {
    localStorage.setItem("refresh_token", JSON.stringify(token));
  } catch (error) {
    console.log(error);
  }
};

const removeTokens = () => {
  try {
    console.log("remove tokens");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  } catch (error) {
    console.log(error);
  }
};

const TokenAPI = {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeTokens,
};

export default TokenAPI;
