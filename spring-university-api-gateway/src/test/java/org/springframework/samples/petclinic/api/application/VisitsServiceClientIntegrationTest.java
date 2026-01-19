package org.springframework.samples.university.api.application;

import mockwebserver3.MockResponse;
import mockwebserver3.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.samples.university.api.dto.Exams;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ExamsServiceClientIntegrationTest {

    private static final Integer COURSE_ID = 1;

    private ExamsServiceClient examsServiceClient;

    private MockWebServer server;

    @BeforeEach
    void setUp() {
        server = new MockWebServer();
        examsServiceClient = new ExamsServiceClient(WebClient.builder());
        examsServiceClient.setHostname(server.url("/").toString());
    }

    @AfterEach
    void shutdown() throws IOException {
        this.server.close();
    }

    @Test
    void getExamsForCourses_withAvailableExamsService() {
        prepareResponse();

        Mono<Exams> exams = examsServiceClient.getExamsForCourses(Collections.singletonList(1));

        assertExamSubjectEquals(exams.block(), COURSE_ID,"test exam");
    }


    private void assertExamSubjectEquals(Exams exams, int courseId, String subject) {
        assertEquals(1, exams.items().size());
        assertNotNull(exams.items().get(0));
        assertEquals(courseId, exams.items().get(0).courseId());
        assertEquals(subject, exams.items().get(0).subject());
    }

    private void prepareResponse() {
        MockResponse response = new MockResponse.Builder()
            .addHeader("Content-Type", "application/json")
            .body("{\"items\":[{\"id\":5,\"examDate\":\"2018-11-15\",\"subject\":\"test exam\",\"courseId\":1}]}")
            .build();
        this.server.enqueue(response);
    }

}
