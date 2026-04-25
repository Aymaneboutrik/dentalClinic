# ===== STAGE 1: Build =====
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copier le pom.xml
COPY pom.xml .

# (optionnel) tester réseau
# RUN ping -c 3 repo.maven.apache.org

# Copier le code source
COPY src ./src

# Build
RUN mvn clean package -DskipTests -B

# ===== STAGE 2: Runtime =====
FROM eclipse-temurin:21-jre

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN groupadd appgroup && useradd -r -g appgroup appuser

# Copier le JAR depuis le stage de build
COPY --from=build /app/target/paiement-api-1.0.0.jar app.jar

# Changer le propriétaire
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
