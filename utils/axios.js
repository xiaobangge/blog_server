const Axios = require("axios");
// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
class PureHttp {
  constructor(baseURL="http://m.kugou.com") {
    this.baseURL = baseURL;
    this.axiosInstance = Axios.create({timeout: this.timeout, baseURL: this.baseURL});
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }
  static timeout = 10000;
  static baseURL = "http://m.kugou.com";
  /** `token`过期后，暂存待执行的请求 */
  static requests = [];

  /** 防止重复刷新`token` */
  static isRefreshing = false;

  /** 初始化配置对象 */
  static initConfig = {};

  /** 保存当前`Axios`实例对象 */
  static axiosInstance = Axios.create({timeout: this.timeout, baseURL: this.baseURL});

  /** 重连原始请求 */
  static retryOriginalRequest(config) {
    return new Promise((resolve) => {
      resolve(config);
    });
  }

  /** 请求拦截 */
  httpInterceptorsRequest() {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config) => {
        // 开启进度条动画
        resolve(config);
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  httpInterceptorsResponse() {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  request(method, url, param, axiosConfig) {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    };

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  post(url, params, config) {
    return this.request("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  get(url, params, config) {
    return this.request("get", url, params, config);
  }
}

module.exports.PureHttp = PureHttp;
