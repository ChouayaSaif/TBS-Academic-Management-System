# Spring University Microservices

A distributed University Management System built with Spring Boot, Spring Cloud, and Docker. This project demonstrates a microservices architecture for managing university operations such as students, professors, courses, and exams.

## Architecture

This project is organized as a set of microservices:

*   **Discovery Server** (Eureka): Service registration and discovery.
*   **Config Server**: Centralized configuration for all services.
*   **API Gateway**: The entry point of the system, routing requests to appropriate microservices and hosting the AngularJS frontend.
*   **Students Service**: Manages student profiles, enrollments, and academic records.
*   **Professors Service**: Manages professor profiles, course assignments, and schedules.
*   **Exams Service**: Handles exam scheduling and grading.
*   **Admin Service**: Manages everything.
*   **GenAI Service**: Provides AI-powered features for the university portal.
*   **Admin Server**: Spring Boot Admin for monitoring and managing the microservices.

## tech Stack

*   **Backend**: Java 17, Spring Boot 3, Spring Cloud
*   **Frontend**: AngularJS
*   **Containerization**: Docker, Docker Compose
*   **Registry & Config**: Eureka, Spring Cloud Config

## Getting Started

### Prerequisites

*   Java 17 or higher
*   Maven (wrapper provided)
*   Docker & Docker Compose (optional, for running full stack)

### Running Locally (Without Docker)

You can run each service individually using the Maven wrapper. Important: Start the **Config Server** and **Discovery Server** first.

1.  **Config Server**:
    ```bash
    ./mvnw spring-boot:run -pl spring-university-config-server
    ```
2.  **Discovery Server**:
    ```bash
    ./mvnw spring-boot:run -pl spring-university-discovery-server
    ```
3.  **Start other services** (Students, Professors, Exams, Gateway, etc.) in any order.

Access the application at: http://localhost:8080

### Running with Docker

You can build the Docker images and run the entire system using the provided scripts or Docker Compose.

1.  **Build the project and Docker images**:
    ```bash
    ./mvnw clean package -DskipTests
    docker build -t students-service:local ./spring-university-students-service
    docker build -t exams-service:local ./spring-university-exams-service
    docker build -t professors-service:local ./spring-university-professors-service
    docker build -t api-gateway:local ./spring-university-api-gateway
    # Build other services as needed...
    ```

2.  **Run with Docker Compose**:
    ```bash
    docker-compose up
    ```

## Ports

| Service | Port |
| :--- | :--- |
| API Gateway | 8080 |
| Discovery Server | 8761 |
| Config Server | 8888 |
| Admin Server | 9090 |
| Students Service | 8081 |
| Professors Service | 8082 |
| Exams Service | 8083 |

## Features

*   **Student Portal**: View courses, schedule, and profile management.
*   **Professor Portal**: Manage courses, students, and profile.
*   **Admin Portal**: Overview of the system, reports, and management.
*   **Profile Image Upload**: Users can update their profile images directly.
*   **Reports**: Enrollment statistics and department performance.

<img width="1330" height="835" alt="dash" src="https://github.com/user-attachments/assets/cc2df18e-1678-4cdb-b8e7-a93f93369db8" />

