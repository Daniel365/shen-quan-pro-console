FROM node:16-alpine

# 维护者信息
LABEL maintainer="your-name@example.com"

# 创建工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json./

# 安装生产依赖
RUN npm ci --production

# 复制应用代码
COPY..

# 暴露后端服务端口
EXPOSE 3000

# 启动命令（根据实际入口文件调整）
CMD ["node", "server.js"]
