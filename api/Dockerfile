FROM node:20-alpine

# ----------本番用設定(start)-----------
WORKDIR /root/api
COPY . .
# ----------本番用設定(end)-------------

RUN apk update && apk upgrade
RUN apk add vim git

# ----------本番用設定(start)-----------
RUN yarn
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start"]
# ----------本番用設定(end)-------------