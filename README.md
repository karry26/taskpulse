

# Setup
## Docker 
### For postgres, redis 
`docker-compose down`

`docker-compose up -d`

`docker ps`
## Front end 
`npm run dev`

## Backend
`./mvnw spring-boot:run`


# Important commands

### To see keys in redis
`docker exec -it taskpulse-redis redis-cli`

`KEYS *`

### To connect to postgres
`docker exec -it taskpulse-postgres psql -U postgres -d taskpulse`

`\dt`

`\d tasks`

### To connect to kafka
`docker exec -it taskpulse-kafka bash`

`kafka-topics \
--list \
--bootstrap-server localhost:9092`
### For debugging
`docker logs taskpulse-postgres`

`docker logs taskpulse-redis`

`docker logs taskpulse-kafka`


# Flow diagram
Host
│
├── Spring Boot (Port 8081)
│
├── Docker
│     │
│     ├── Postgres (5433 → 5432)
│     ├── Redis (6379 → 6379)
│     ├── Kafka (9092 → 9092)
│     └── Zookeeper (2181 → 2181)