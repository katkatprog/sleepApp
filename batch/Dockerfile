FROM node:20-alpine

# ----------本番用設定(start)-----------
WORKDIR /root/batch
COPY . .
# ----------本番用設定(end)-------------

RUN apk update && apk upgrade
RUN apk add vim git python3
# venvにpykakasiをインストール。&&で繋げる必要がある
RUN python3 -m venv /path/to/venv && . /path/to/venv/bin/activate && pip3 install pykakasi && deactivate

# ----------本番用設定(start)-----------
RUN yarn
RUN yarn checkformat
RUN yarn lint
RUN yarn test
CMD ["yarn", "start"]
# ----------本番用設定(end)-------------
