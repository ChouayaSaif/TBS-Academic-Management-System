package org.springframework.samples.university.api.boundary.web;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.cloud.circuitbreaker.resilience4j.ReactiveResilience4JAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.samples.university.api.application.StudentsServiceClient;
import org.springframework.samples.university.api.application.ExamsServiceClient;
import org.springframework.samples.university.api.dto.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.net.ConnectException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@WebFluxTest(controllers = ApiGatewayController.class)
@Import({ReactiveResilience4JAutoConfiguration.class, CircuitBreakerConfiguration.class})
class ApiGatewayControllerTest {

    @MockitoBean
    private StudentsServiceClient studentsServiceClient;

    @MockitoBean
    private ExamsServiceClient examsServiceClient;

    @Autowired
    private WebTestClient client;


    @Test
    void getStudentDetails_withAvailableExamsService() {
        CourseDetails course = new CourseDetails(
            20,
            "Computer Science",
            "2024-01-15",
            new CourseType("Lecture"),
            new ArrayList<>()
        );
        StudentDetails student = new StudentDetails(
            1,
            "John",
            "Doe",
            "123 Main St",
            "New York",
            "555-1234",
            List.of(course)
        );
        Mockito
            .when(studentsServiceClient.getStudent(1))
            .thenReturn(Mono.just(student));

        ExamDetails exam = new ExamDetails(300, course.id(), "2024-02-15", "Midterm Exam");
        Exams exams = new Exams(List.of(exam));
        Mockito
            .when(examsServiceClient.getExamsForCourses(Collections.singletonList(course.id())))
            .thenReturn(Mono.just(exams));

        client.get()
            .uri("/api/gateway/students/1")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.courses[0].title").isEqualTo("Computer Science")
            .jsonPath("$.courses[0].exams[0].subject").isEqualTo("Midterm Exam");
    }

    /**
     * Test Resilience4j fallback method
     */
    @Test
    void getStudentDetails_withServiceError() {
        CourseDetails course = new CourseDetails(
            20,
            "Computer Science",
            "2024-01-15",
            new CourseType("Lecture"),
            new ArrayList<>()
        );
        StudentDetails student = new StudentDetails(
            1,
            "John",
            "Doe",
            "123 Main St",
            "New York",
            "555-1234",
            List.of(course)
        );
        Mockito
            .when(studentsServiceClient.getStudent(1))
            .thenReturn(Mono.just(student));

        Mockito
            .when(examsServiceClient.getExamsForCourses(Collections.singletonList(course.id())))
            .thenReturn(Mono.error(new ConnectException("Simulate error")));

        client.get()
            .uri("/api/gateway/students/1")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.courses[0].title").isEqualTo("Computer Science")
            .jsonPath("$.courses[0].exams").isEmpty();
    }

}
