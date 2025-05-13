FROM node:20.19.1-slim

RUN npm install -g pnpm@10.7.0

WORKDIR /app

COPY . .
RUN pnpm install
RUN pnpm build

EXPOSE 5173

CMD ["pnpm", "start", "--host", "0.0.0.0", "--port", "5173"]
