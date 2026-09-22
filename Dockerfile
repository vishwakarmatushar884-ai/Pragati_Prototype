# ==============================================================================
# PRAGATI - Unified Full-Stack Platform Dockerfile
# Combines React Frontend + Spring Boot Backend into a Single Executable Service
# ==============================================================================

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy source and build (permissions guarded)
COPY frontend/ ./
RUN chmod -R +x node_modules/.bin || true
RUN npm run build

# Stage 2: Build Spring Boot Backend with embedded static frontend assets
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/src ./src
# Copy compiled frontend assets into Spring Boot's static resources
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests -B

# Stage 3: Lightweight Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl tzdata

WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE="dev"
ENV APP_SEED_ENABLED="true"
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
