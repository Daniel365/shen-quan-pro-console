FROM node:22-alpine as builder

# 安装pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY..

# 构建项目
RUN pnpm run build

# 生产环境
FROM nginx:alpine

# 复制构建结果到Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
