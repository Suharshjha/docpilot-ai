# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime Environment with JRE and Tesseract OCR
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install Tesseract OCR and English data
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Expose backend port
EXPOSE 8080

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Define system properties / environment overrides
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

ENTRYPOINT ["java", "-jar", "app.jar"]
