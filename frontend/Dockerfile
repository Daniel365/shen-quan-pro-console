FROM nginx:alpine AS builder

# 维护者信息
LABEL maintainer="your-name@example.com"

# 复制构建好的前端文件到Nginx
COPY dist/ /usr/share/nginx/html/

# 复制自定义Nginx配置（可选，如需修改默认配置）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
