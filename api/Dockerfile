FROM node:20-alpine

# ----------本番用設定(start)-----------
WORKDIR /root/api
COPY . .
# ----------本番用設定(end)-------------

RUN apk update && apk upgrade
RUN apk add --no-cache openssl

# ----------本番用設定(start)-----------
RUN yarn
RUN yarn checkformat
RUN yarn lint
RUN yarn test
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start"]
# ----------本番用設定(end)-------------