package redisclient

import (
    "context"
    "github.com/redis/go-redis/v9"
)

var Client *redis.Client

func Init(addr string) {
    Client = redis.NewClient(&redis.Options{
        Addr: addr,
    })
}

func Ping(ctx context.Context) error {
    return Client.Ping(ctx).Err()
}
