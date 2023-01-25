FROM node:alpine
COPY ./ ./
EXPOSE 3000
CMD ["npm", "start"]