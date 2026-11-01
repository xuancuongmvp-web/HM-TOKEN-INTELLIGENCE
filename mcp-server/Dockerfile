FROM node:22-alpine
WORKDIR /app
COPY mcp-server/package*.json ./
RUN npm install --omit=dev
COPY mcp-server/ ./
ENV NODE_ENV=production
EXPOSE 8787
CMD ["npm","start"]
