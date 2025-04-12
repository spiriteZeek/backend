import axios from "axios";
import CryptoJS from "crypto-js";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { parseFile } from 'music-metadata';

import { TTSConfig } from "../../config/config.js";

// TODO:这个服务需要鉴权
const timeout = 3 * 60
// 创建axios示例并设置拦截器
const axiosInstance = axios.create();

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("请求报文信息：");
    console.log("请求方法：", config.method);
    console.log("请求URL", config.url);
    console.log("请求头：", config.headers);
    if (config.data) {
      try {
        console.log("请求体:", JSON.parse(config.data));
      } catch (error) {
        console.log("请求体:", config.data);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("响应报文信息：");
    console.log("响应状态码:", response.status);
    console.log("响应头:", response.headers);
    console.log("响应体:", response.data);
    return response;
  },
  (error) => {
    console.log("错误响应报文信息：");
    if (error.response) {
      console.log("错误响应状态码:", error.response.status);
      console.log("错误响应头:", error.response.headers);
      console.log("错误响应体:", error.response.data);
    } else {
      console.log("错误信息:", error.message);
    }
    return Promise.reject(error);
  }
);

class TestTask {
  constructor() {
    this.host = TTSConfig.HOST;
    this.app_id = TTSConfig.APP_ID;
    this.api_key = TTSConfig.API_KEY;
    this.api_secret = TTSConfig.API_SECRET;
  }

  // 生成鉴权的url
  assembleAuthUrl(path) {
    const params = this.assembleAuthParams(path);
    // 请求地址
    const requestUrl = `http://${this.host}${path}`;
    const authUrl = `${requestUrl}?${new URLSearchParams(params).toString()}`;
    return authUrl;
  }

  // 生成鉴权的参数
  assembleAuthParams(path) {
    // 生成RFC1123格式的时间戳
    const formatDate = new Date().toUTCString();
    // const formatDate = 'Mon, 17 Mar 2025 13:31:45 GMT'
    // 拼接字符串
    const signatureOrigin = `host: ${this.host}\ndate: ${formatDate}\nPOST ${path} HTTP/1.1`;
    // 进行hmac-sha256加密
    const secretUtf8 = CryptoJS.enc.Utf8.parse(this.api_secret);
    const originUtf8 = CryptoJS.enc.Utf8.parse(signatureOrigin);
    const signatureSha = CryptoJS.HmacSHA256(originUtf8, secretUtf8);
    //const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.api_secret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha); //encode base64
    // 构建请求参数
    const authorizationOrigin = `api_key="${this.api_key}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    // 将请求参数使用base64编码
    const authorization = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(authorizationOrigin)
    );
    // 将请求的鉴权参数组合为对象
    const params = {
      host: this.host,
      date: formatDate,
      authorization,
    };
    return params;
  }

  // 创建任务
  async testCreate(text) {
    const createPath = "/v1/private/dts_create";
    const authUrl = this.assembleAuthUrl(createPath);
    const txt = Buffer.from(text).toString("base64");
    const headers = { "Content-Type": "application/json" };
    const data = {
      header: {
        app_id: this.app_id,
      },
      parameter: {
        dts: {
          vcn: "x4_yeting",
          language: "zh",
          speed: 50,
          volume: 50,
          pitch: 50,
          rhy: 1,
          bgs: 0,
          reg: 0,
          rdn: 0,
          scn: 0,
          audio: {
            encoding: "lame",
            sample_rate: 16000,
            channels: 1,
            bit_depth: 16,
            frame_size: 0,
          },
          pybuf: {
            encoding: "utf8",
            compress: "raw",
            format: "plain",
          },
        },
      },
      payload: {
        text: {
          encoding: "utf8",
          compress: "raw",
          format: "plain",
          text: txt,
        },
      },
    };
    try {
      const res = await axiosInstance.post(authUrl, JSON.stringify(data), {
        headers,
      });
      return res.data;
    } catch (e) {
      console.log("创建任务接口调用异常，错误详情：", e.message);
    }
  }

  // 查询任务
  async testQuery(taskId) {
    const queryPath = "/v1/private/dts_query";
    const authUrl = this.assembleAuthUrl(queryPath);
    const headers = { "Content-Type": "application/json" };
    const data = {
      header: {
        app_id: this.app_id,
        task_id: taskId,
      },
    };
    try {
      const res = await axios.post(authUrl, JSON.stringify(data), {
        headers,
      });
      return res.data;
    } catch (e) {
      console.log("查询任务接口调用异常，错误详情", e.message);
    }
  }
}

// 创建任务
async function doCreate(text) {
  const testTask = new TestTask();
  const createResult = await testTask.testCreate(text);
  const code = createResult?.header?.code;
  if (code === 0) {
    const taskId = createResult?.header?.task_id;
    console.log("创建任务成功,task_id:", taskId);
    return taskId;
  } else {
    console.log("创建任务失败，返回状态码：", code);
  }
}

// 查询任务
async function doQuery(taskId) {
  const testTask = new TestTask();
  for (let i = 0; i < timeout; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); //暂停1秒
    const queryResult = await testTask.testQuery(taskId);
    const code = queryResult?.header?.code;
    if (code === 0) {
      const taskStatus = queryResult?.header?.task_status;
      if (taskStatus === "5") {
        const audio = queryResult?.payload?.audio?.audio;
        const decodeAudio = Buffer.from(audio, "base64").toString("utf-8"); //base64Str -> string
        console.log("查询任务成功，音频下载链接：", decodeAudio);
        return decodeAudio;
      } else {
        console.log(`第${i + 1}次查询，处理未完成，任务状态码：${taskStatus}`);
      }
    } else {
      console.log("查询任务失败，返回状态码：", code);
      process.exit(1);
    }
  }
	console.log("文本过长，超时。");
}

// 封装为服务
async function textToSpeechService(text, saveDir) {
  try {
    const taskId = await doCreate(text);
    if (taskId) {
      const queryResult = await doQuery(taskId);
      if (queryResult) {
        const response = await axios.get(queryResult, {
          responseType: "arraybuffer",
        });
				const randomFileName = `${uuidv4()}.mp3`;
				const savePath = `${saveDir}/${randomFileName}`
        fs.writeFileSync(savePath, response.data);
        console.log("\n音频保存成功!");

				// 获取音频时长
				const metadata = await parseFile(savePath);
				const duration = metadata.format.duration;
				console.log(`音频时长：${duration}秒`);
				return {
					savePath,
					duration,
				};
      }
    }
  } catch (error) {
    console.error("程序执行出错:", error);
  }
}

export default textToSpeechService;
