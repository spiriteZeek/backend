import simpleGit from "simple-git";
import path from 'path';

class GitUploader {
  constructor(repoPath,remoteUrl, branch = 'main') {
    this.git = simpleGit(repoPath);
    this.remoteUrl = remoteUrl;
    this.branch = branch;
  }
  
  async uploadFile(filePath) {
    try {
      // 检查远程仓库 origin 是否已经存在
      const remotes = await this.git.getRemotes(true);
      const originExists = remotes.some(remote => remote.name === 'origin');
      if (!originExists) {
          await this.git.addRemote('origin', this.remoteUrl);
      }

      await this.git.pull('origin', this.branch);
      await this.git.add(filePath);
      const commitMessage = `Upload audio file: ${path.basename(filePath)}`;
      await this.git.commit(commitMessage)
      await this.git.push('origin', this.branch);
      
      // 提取文件名
      const fileName = path.basename(filePath);
      // 构建指定格式的url
      const githubUrl = `${this.remoteUrl.replace('.git', '')}/raw/refs/heads/${this.branch}/assets/audio/${encodeURIComponent(fileName)}`;
      return githubUrl;
    } catch (error) {
      console.error('使用Git上传文件时出错：', error);
      throw error;
    }
  }
}

export default GitUploader;