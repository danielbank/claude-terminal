# Claude Terminal

## Install

```bash
# Install Deno
deno install

# Install Redis
brew install redis

# Install Docker
brew install docker
```

## Commands

```bash
# Start Redis
docker compose up -d

# List running containers
docker ps

# Run the script
deno task dev

# Stop Redis
docker compose down
```

## Redis Commands

```bash
# Connect to Redis CLI
redis-cli

# Check dir_entries
TYPE dir_entries
HGETALL dir_entries  # if hash
GET dir_entries      # if string
LRANGE dir_entries 0 -1  # if list
```

## Questions

```
List the creation date for every file in the "./content" folder
```
