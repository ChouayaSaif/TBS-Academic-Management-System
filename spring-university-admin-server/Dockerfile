FROM eclipse-temurin:17-jre

WORKDIR /app

COPY target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 9090

ENTRYPOINT ["java", "-jar", "app.jar"]
