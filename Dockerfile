FROM golang:1.19.2-alpine AS builder
WORKDIR /app
COPY . ./
RUN go build -o main .

FROM alpine:latest AS runner
WORKDIR /app
COPY --from=builder /app/main .
RUN mkdir /app/output && mkdir /app/backup
CMD ["/app/main"]