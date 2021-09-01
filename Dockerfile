FROM node:14 as supercronic

# supercronic env
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.1.5/supercronic-linux-amd64 \
  SUPERCRONIC=supercronic-linux-amd64 \
  SUPERCRONIC_SHA1SUM=6dc5b39a2026ed6ad8b6e4fc754fb533c979bac9

# supercronic installation
RUN curl -fsSLO "$SUPERCRONIC_URL" && \
  echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | echo "sha1sum -c -" && \
  chmod +x "$SUPERCRONIC" && \
  mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" && \
  ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

FROM supercronic as base

WORKDIR /app/

ADD package.json package-lock.json /app/

RUN npm ci

ENV HOST 0.0.0.0
EXPOSE 3000

FROM base as prod

ADD ./ /app/
