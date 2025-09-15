# Docker Deployment

This project includes a `docker-compose.yml` file for easy deployment.

## Environment Variables

Required:
- `JELLYFIN_HOST`
- `JELLYFIN_USERNAME` 
- `JELLYFIN_PASSWORD`

Optional (see `.env.example` for defaults):
- `AUDIO_BITRATE`, `VIDEO_BITRATE`, `MAX_AUDIO_CHANNELS`, `MAX_HEIGHT`, `MAX_WIDTH`

## Deployment

1. Set environment variables
2. Deploy with Docker Compose

Service runs on port 4000.
