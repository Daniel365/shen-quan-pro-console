FROM node:22-alpine as builder

WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码和.env文件
COPY..
COPY.env./

# 编译TypeScript
RUN yarn run build

# 生产环境
FROM node:22-alpine

WORKDIR /app

# 复制package文件和编译结果
COPY package.json yarn.lock./
COPY --from=builder /app/dist./dist
COPY --from=builder /app/node_modules./node_modules
COPY.env./

EXPOSE 3000

CMD ["node", "dist/src/app.js"]
