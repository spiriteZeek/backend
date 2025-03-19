//数据库配置
const DBConfig = {
  HOST: 'localhost',
  USER: 'root',
  PASSWORD: '123456',
  DATABASE: 'news_db',
}

//科大讯飞文本转语音配置
const TTSConfig = {
  HOST: "api-dx.xf-yun.com",
  APP_ID: '5d8c932d',
  API_KEY: '84693148a51d27c7609d3a289710ca60',
  API_SECRET: 'NGFhMjA3YzE4ODQ0NTBhY2U5ZjE4MzQy'
}

// GitHub配置
const GITHUB_CONFIG = {
  REPO_URL: 'https://github.com/spiriteZeek/backend',
  BRANCH: 'main',
}

export {
  DBConfig,
  TTSConfig,
  GITHUB_CONFIG,
};