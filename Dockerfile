FROM node:20-alpine

WORKDIR /app

# 复制 API 的 package.json
COPY api/package*.json ./

RUN npm install

# 复制 API 源码
COPY api/ .

# 构建
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
