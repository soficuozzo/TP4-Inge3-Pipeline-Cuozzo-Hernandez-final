# Dockerfile Backend
FROM golang:latest

COPY . /backend
WORKDIR /backend
RUN go mod init backend
RUN go mod tidy
RUN go build -o backend

#EXPOSE 8080
CMD ["/backend/backend"]